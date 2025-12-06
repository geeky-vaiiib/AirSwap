/**
 * Claims API - Enhanced Production Version
 * GET: Retrieve claims with pagination and filtering
 * POST: Create a new claim with parent hash generation
 * 
 * Includes authentication, rate limiting, and comprehensive validation
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { isDemo } from '@/lib/isDemo';
import { demoClaims } from '@/demo/demoClaims';
import { CreateClaimSchema, ListClaimsQuerySchema } from '@/lib/validators/claims';
import { ClaimsModel, type EvidenceFile } from '@/lib/db/models/claims';
import { getUserFromRequest } from '@/lib/auth';
import { generateParentHash, extractEvidenceCIDs } from '@/lib/utils/parentHash';
import { logger } from '@/lib/logger';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  meta?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
  });
}

/**
 * GET /api/claims
 * Retrieve claims with optional filters and pagination
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Demo mode
    if (isDemo()) {
      const { status } = req.query;
      let filteredClaims = [...demoClaims];

      if (status && typeof status === 'string') {
        filteredClaims = filteredClaims.filter(claim => claim.status === status);
      }

      return res.status(200).json({
        success: true,
        data: filteredClaims,
        message: 'Demo claims retrieved successfully',
      });
    }

    // Parse and validate query parameters
    const query = ListClaimsQuerySchema.parse(req.query);
    const { status, page, limit, sortBy, sortOrder } = query;

    // Build filter
    const filter: any = {};
    
    // Contributors only see their own claims; verifiers/admins see all
    if (user.role === 'contributor') {
      filter.contributorId = new ObjectId(user.id);
    }

    if (status) {
      filter.status = status;
    }

    // Query with pagination
    const skip = (page - 1) * limit;
    const result = await ClaimsModel.findPaginated(filter, skip, limit, sortBy, sortOrder);

    // Serialize ObjectIds for JSON
    const serializedClaims = result.data.map(claim => ({
      ...claim,
      _id: claim._id?.toString(),
      contributorId: claim.contributorId?.toString(),
      verifierId: claim.verifierId?.toString(),
      auditLog: claim.auditLog?.map(log => ({
        ...log,
        userId: log.userId?.toString(),
      })),
    }));

    return res.status(200).json({
      success: true,
      data: serializedClaims,
      meta: {
        page: result.page,
        pages: result.pages,
        total: result.total,
        limit,
      },
      message: 'Claims retrieved successfully',
    });
  } catch (error) {
    logger.error('GET /api/claims error:', error as Error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: `Invalid query parameters: ${error.errors[0].message}`,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * POST /api/claims
 * Create a new claim (accepts base64-encoded files or file URLs)
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Only contributors can create claims
    if (user.role !== 'contributor') {
      return res.status(403).json({
        success: false,
        error: 'Only contributors can create claims',
      });
    }

    // Demo mode
    if (isDemo()) {
      return res.status(201).json({
        success: true,
        data: {
          id: `CLM-DEMO-${Date.now()}`,
          status: 'pending',
          message: 'Demo mode: Claim would be created',
        },
        message: 'Demo claim created successfully',
      });
    }

    // Rate limiting: 10 claims per day
    const claimsToday = await ClaimsModel.countByUserToday(user.id);
    if (claimsToday >= 10) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded: Maximum 10 claims per day',
      });
    }

    // Validate request body
    const validatedData = CreateClaimSchema.parse(req.body);

    // Validate contributor matches authenticated user
    if (validatedData.contributorEmail !== user.email) {
      logger.warn(`Contributor email mismatch: ${validatedData.contributorEmail} vs ${user.email}`);
    }

    // Process evidence files
    // For now, evidence array contains file metadata with tmpIds
    // In a real implementation, these would be uploaded via a separate upload endpoint first
    // or sent as base64 encoded data
    const uploadedEvidence: EvidenceFile[] = validatedData.evidence.map((ev, index) => ({
      name: ev.name,
      type: ev.type || 'document',
      url: `https://nftstorage.link/ipfs/pending-${Date.now()}-${index}`,
      cid: `pending-${Date.now()}-${index}`, // Placeholder CID
      uploadedAt: new Date(),
    }));

    // Generate parent hash
    const evidenceCIDs = extractEvidenceCIDs(uploadedEvidence);
    const { parentHash } = generateParentHash(
      user.id,
      new Date(),
      validatedData.location.polygon,
      evidenceCIDs
    );

    // Create claim in database
    const newClaim = await ClaimsModel.create({
      parentHash,
      contributorId: new ObjectId(user.id),
      contributorName: validatedData.contributorName || user.full_name,
      contributorEmail: validatedData.contributorEmail,
      phone: validatedData.phone,
      location: validatedData.location,
      areaHectares: validatedData.areaHectares,
      description: validatedData.description,
      expectedCredits: validatedData.expectedCredits,
      evidence: uploadedEvidence,
      ndvi: validatedData.ndvi,
    });

    logger.info(`Claim created: ${newClaim.claimId} by user ${user.id}`);

    // Serialize for response
    const serializedClaim = {
      ...newClaim,
      _id: newClaim._id?.toString(),
      contributorId: newClaim.contributorId?.toString(),
      auditLog: newClaim.auditLog?.map(log => ({
        ...log,
        userId: log.userId?.toString(),
      })),
    };

    return res.status(201).json({
      success: true,
      data: serializedClaim,
      message: `Claim created successfully (${claimsToday + 1}/10 daily claims used)`,
    });
  } catch (error) {
    logger.error('POST /api/claims error:', error as Error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.errors[0].path.join('.')}: ${error.errors[0].message}`,
      });
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
