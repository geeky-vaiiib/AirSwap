/**
 * Verify Claim API - Enhanced Production Version
 * POST: Approve or reject a claim (verifiers only)
 * 
 * On approval:
 * - Updates claim status
 * - Issues credits
 * - Creates audit log entry
 * - Optionally triggers blockchain minting
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { isDemo } from '@/lib/isDemo';
import { demoClaims } from '@/demo/demoClaims';
import { VerifyClaimSchema } from '@/lib/validators/claims';
import { ClaimsModel } from '@/lib/db/models/claims';
import { CreditsModel } from '@/lib/db/models/credits';
import { logger } from '@/lib/logger';

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
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Only verifiers can verify claims
    if (user.role !== 'verifier') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Only verifiers can verify claims',
      });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Claim ID is required',
      });
    }

    // Validate request body
    const validatedData = VerifyClaimSchema.parse(req.body);
    const { approved, credits, notes } = validatedData;

    // Demo mode
    if (isDemo()) {
      const claimIndex = demoClaims.findIndex(c => c.id === id);
      if (claimIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Claim not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          id,
          status: approved ? 'verified' : 'rejected',
          credits: approved ? credits : 0,
        },
        message: `Demo claim ${approved ? 'approved' : 'rejected'} successfully`,
      });
    }

    // Fetch claim
    const claim = await ClaimsModel.findById(id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found',
      });
    }

    // Check if already verified/rejected
    if (claim.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Claim already ${claim.status}`,
      });
    }

    // Verify the claim
    const verifierId = new ObjectId(user.id);
    const success = await ClaimsModel.verify(
      id,
      verifierId,
      user.full_name,
      approved,
      credits,
      notes
    );

    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update claim status',
      });
    }

    // If approved and credits assigned, create credit record
    let creditRecord = null;
    if (approved && credits && credits > 0) {
      creditRecord = await CreditsModel.create({
        claim_id: claim._id!,
        owner_id: claim.contributorId,
        amount: credits,
        metadata_cid: claim.metadataCID,
      });

      logger.info(`Credits issued: ${credits} to user ${claim.contributorId} for claim ${claim.claimId}`);
    }

    // Add detailed audit log entry
    await ClaimsModel.addAuditLog(id, {
      event: approved ? 'claim_verified' : 'claim_rejected',
      userId: verifierId,
      userName: user.full_name,
      note: notes || (approved ? `Approved with ${credits} credits` : 'Claim rejected'),
    });

    logger.info(`Claim ${claim.claimId} ${approved ? 'verified' : 'rejected'} by verifier ${user.id}`);

    // Fetch updated claim
    const updatedClaim = await ClaimsModel.findById(id);

    // Serialize response
    const responseData = {
      claimId: updatedClaim?.claimId,
      status: updatedClaim?.status,
      verifiedAt: updatedClaim?.verifiedAt,
      verifierId: updatedClaim?.verifierId?.toString(),
      creditsIssued: updatedClaim?.creditsIssued,
      verifierNotes: updatedClaim?.verifierNotes,
      creditRecordId: creditRecord?._id?.toString(),
    };

    return res.status(200).json({
      success: true,
      data: responseData,
      message: `Claim ${approved ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    logger.error('POST /api/claims/[id]/verify error:', error as Error);

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
