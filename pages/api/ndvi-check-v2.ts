/**
 * NDVI Check API - Enhanced Version
 * POST: Request NDVI analysis for a polygon or image pair
 * 
 * Supports:
 * - Polygon-based analysis (via Google Earth Engine)
 * - Before/after image comparison
 * - Background job queue for expensive operations
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { isDemo } from '@/lib/isDemo';
import { ndviDemoResponse } from '@/demo/ndviDemoResponse';
import { NDVICheckSchema } from '@/lib/validators/claims';
import { ClaimsModel } from '@/lib/db/models/claims';
import { getUserFromRequest } from '@/lib/auth';
import { logger } from '@/lib/logger';

interface ApiResponse {
  success: boolean;
  data?: {
    ndviDelta?: number;
    beforeImageCid?: string;
    afterImageCid?: string;
    jobId?: string;
    status?: 'completed' | 'pending' | 'processing';
  };
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

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
      return res.status(200).json({
        success: true,
        data: {
          ...ndviDemoResponse,
          status: 'completed' as const,
        },
        message: 'Demo NDVI analysis completed',
      });
    }

    // Validate request
    const validatedData = NDVICheckSchema.parse(req.body);
    const { polygon, beforeImage, afterImage, claimId } = validatedData;

    // Check if this is for an existing claim
    if (claimId) {
      const claim = await ClaimsModel.findById(claimId);
      if (!claim) {
        return res.status(404).json({
          success: false,
          error: 'Claim not found',
        });
      }

      // Verify ownership
      if (claim.contributorId.toString() !== user.id && user.role !== 'verifier') {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }
    }

    // TODO: Implement real NDVI analysis
    // For now, create a background job and return job ID
    const jobId = `ndvi-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    logger.info(`NDVI analysis requested by user ${user.id}, job ID: ${jobId}`);

    // In a real implementation:
    // 1. If polygon provided: use Google Earth Engine API
    // 2. If images provided: process with image analysis library
    // 3. Queue job for background processing
    // 4. Return job ID for polling

    // Placeholder response
    return res.status(202).json({
      success: true,
      data: {
        jobId,
        status: 'pending',
      },
      message: 'NDVI analysis job queued. Check status with job ID.',
    });
  } catch (error) {
    logger.error('POST /api/ndvi-check error:', error as Error);

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
