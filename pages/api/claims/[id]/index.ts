/**
 * Claims API - Individual Claim Operations
 * GET: Retrieve claim details by ID
 * PATCH: Update a claim (contributors can edit pending claims)
 * 
 * Supports authentication and RBAC
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { ClaimsModel } from '@/lib/db/models/claims';
import { getUserFromRequest } from '@/lib/auth';
import { UpdateClaimSchema } from '@/lib/validators/claims';
import { logger } from '@/lib/logger';
import { isDemo } from '@/lib/isDemo';
import { demoClaims } from '@/demo/demoClaims';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'PATCH') {
    return handlePatch(req, res);
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
  });
}

/**
 * GET /api/claims/:id
 * Retrieve a single claim by ID
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Claim ID is required',
      });
    }

    // Demo mode
    if (isDemo()) {
      const claim = demoClaims.find(c => c.id === id);
      if (!claim) {
        return res.status(404).json({
          success: false,
          error: 'Claim not found',
        });
      }
      return res.status(200).json({
        success: true,
        data: claim,
        message: 'Demo claim retrieved successfully',
      });
    }

    // Fetch claim from database
    const claim = await ClaimsModel.findById(id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found',
      });
    }

    // Access control: contributors can only see their own claims
    if (user.role === 'contributor' && claim.contributorId.toString() !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Serialize ObjectIds
    const serializedClaim = {
      ...claim,
      _id: claim._id?.toString(),
      contributorId: claim.contributorId?.toString(),
      verifierId: claim.verifierId?.toString(),
      auditLog: claim.auditLog?.map(log => ({
        ...log,
        userId: log.userId?.toString(),
      })),
    };

    return res.status(200).json({
      success: true,
      data: serializedClaim,
      message: 'Claim retrieved successfully',
    });
  } catch (error) {
    logger.error('GET /api/claims/[id] error:', error as Error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * PATCH /api/claims/:id
 * Update a claim (only for pending claims by contributors or admin actions)
 */
async function handlePatch(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Claim ID is required',
      });
    }

    // Demo mode
    if (isDemo()) {
      return res.status(200).json({
        success: true,
        data: { id, message: 'Demo mode: Claim would be updated' },
        message: 'Demo claim updated successfully',
      });
    }

    // Fetch existing claim
    const claim = await ClaimsModel.findById(id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found',
      });
    }

    // Access control
    const isOwner = claim.contributorId.toString() === user.id;
    const isAdmin = user.role === 'verifier' || user.role === 'company';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Contributors can only edit pending claims
    if (isOwner && !isAdmin && claim.status !== 'pending') {
      return res.status(403).json({
        success: false,
        error: 'Cannot edit non-pending claims',
      });
    }

    // Validate update data
    const validatedData = UpdateClaimSchema.parse(req.body);

    // Update claim
    const updated = await ClaimsModel.update(id, validatedData);
    if (!updated) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update claim',
      });
    }

    // Add audit log entry
    await ClaimsModel.addAuditLog(id, {
      event: 'claim_updated',
      userId: new ObjectId(user.id),
      userName: user.full_name,
      note: `Claim updated by ${user.role}`,
    });

    logger.info(`Claim ${id} updated by user ${user.id}`);

    // Fetch updated claim
    const updatedClaim = await ClaimsModel.findById(id);

    return res.status(200).json({
      success: true,
      data: {
        ...updatedClaim,
        _id: updatedClaim?._id?.toString(),
        contributorId: updatedClaim?.contributorId?.toString(),
      },
      message: 'Claim updated successfully',
    });
  } catch (error) {
    logger.error('PATCH /api/claims/[id] error:', error as Error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.errors[0].message}`,
      });
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
