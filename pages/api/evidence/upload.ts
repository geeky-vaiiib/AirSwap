/**
 * Evidence Upload API - POST endpoint
 * Upload evidence for a claim
 * 
 * Uses MongoDB for data storage
 * Note: File storage should be handled separately (S3, IPFS, etc.)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { isDemo } from '@/lib/isDemo';
import { EvidenceModel } from '@/lib/db/models/evidence';
import { UploadEvidenceSchema } from '@/lib/validators/evidence';

interface EvidenceResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EvidenceResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Demo mode - return mock evidence
    if (isDemo()) {
      const mockEvidence = {
        id: `EVD-${Date.now()}`,
        claim_id: req.body.claim_id,
        cid: req.body.cid || `Qm${Date.now().toString(36)}`,
        url: req.body.url || `https://demo.storage.airswap.io/${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      return res.status(201).json({
        success: true,
        data: mockEvidence,
        message: 'Demo evidence uploaded successfully',
      });
    }

    // Authenticate user
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Please log in',
      });
    }

    // Validate request body
    const validatedData = UploadEvidenceSchema.parse(req.body);

    // Create evidence record in MongoDB
    const evidence = await EvidenceModel.create({
      claim_id: new ObjectId(validatedData.claim_id),
      uploader_id: new ObjectId(user.id),
      cid: validatedData.cid,
      url: validatedData.url,
      file_type: validatedData.file_type,
      file_size: validatedData.file_size,
    });

    // Serialize for JSON response
    const serializedEvidence = {
      ...evidence,
      _id: evidence._id?.toString(),
      claim_id: evidence.claim_id?.toString(),
      uploader_id: evidence.uploader_id?.toString(),
    };

    return res.status(201).json({
      success: true,
      data: serializedEvidence,
      message: 'Evidence uploaded successfully',
    });
  } catch (error) {
    console.error('POST /api/evidence/upload error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

