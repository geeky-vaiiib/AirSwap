/**
 * Approve Claim API - Enhanced Approval with Marketplace Listing
 * POST: Approve a claim and create marketplace listing
 *
 * On approval:
 * - Updates claim status to 'verified'
 * - Issues credits
 * - Creates marketplace listing automatically
 * - Adds audit log entries
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
import { MarketplaceModel } from '@/lib/db/models/marketplace';
import { logger } from '@/lib/logger';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// Extended approval schema with marketplace listing options
const ApproveClaimSchema = z.object({
  credits: z.number().min(1, 'Credits must be at least 1'),
  notes: z.string().optional(),
  createListing: z.boolean().optional().default(true),
  listingPrice: z.number().min(0.01, 'Price must be greater than 0').optional(),
  listingQuantity: z.number().min(1, 'Quantity must be at least 1').optional(),
});

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

    // Only verifiers can approve claims
    if (user.role !== 'verifier') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Only verifiers can approve claims',
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
    const validatedData = ApproveClaimSchema.parse(req.body);
    const { credits, notes, createListing, listingPrice, listingQuantity } = validatedData;

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
          status: 'verified',
          creditsIssued: credits,
          marketplaceListing: createListing ? { id: `LST-${Date.now()}`, price: listingPrice } : null,
        },
        message: 'Demo claim approved successfully',
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

    // Verify (approve) the claim
    const verifierId = new ObjectId(user.id);
    const approvalSuccess = await ClaimsModel.verify(
      id,
      verifierId,
      user.full_name,
      true, // approved = true
      credits,
      notes
    );

    if (!approvalSuccess) {
      return res.status(500).json({
        success: false,
        error: 'Failed to approve claim',
      });
    }

    // Create credit record
    const creditRecord = await CreditsModel.create({
      claim_id: claim._id!,
      owner_id: claim.contributorId,
      amount: credits,
      metadata_cid: claim.metadataCID,
    });

    // Create marketplace listing if requested
    let marketplaceListing = null;
    if (createListing && listingPrice && listingQuantity && creditRecord._id) {
      marketplaceListing = await MarketplaceModel.create({
        seller_id: claim.contributorId, // Contributor is the seller
        credit_id: new ObjectId(creditRecord._id.toString()),
        price: listingPrice,
        quantity: listingQuantity,
      });

      logger.info(`Marketplace listing created for claim ${claim.claimId}: ${listingQuantity} credits at $${listingPrice} each`);
    }

    // Add detailed audit log entry
    await ClaimsModel.addAuditLog(id, {
      event: 'claim_approved_with_listing',
      userId: verifierId,
      userName: user.full_name,
      note: [
        notes ? `${notes}. ` : '',
        `Approved with ${credits} credits.`,
        marketplaceListing ? `Created marketplace listing: ${listingQuantity} credits at $${listingPrice}.` : 'No marketplace listing created.'
      ].join(' '),
    });

    logger.info(`Claim ${claim.claimId} approved by verifier ${user.id} with marketplace listing`);

    // Fetch updated claim
    const approvedClaim = await ClaimsModel.findById(id);

    // Serialize response
    const responseData = {
      claimId: approvedClaim?.claimId,
      status: approvedClaim?.status,
      verifiedAt: approvedClaim?.verifiedAt,
      verifierId: approvedClaim?.verifierId?.toString(),
      creditsIssued: approvedClaim?.creditsIssued,
      verifierNotes: approvedClaim?.verifierNotes,
      creditRecordId: creditRecord._id?.toString(),
      marketplaceListing: marketplaceListing ? {
        id: marketplaceListing._id?.toString(),
        price: marketplaceListing.price,
        quantity: marketplaceListing.quantity,
        status: marketplaceListing.status,
      } : null,
    };

    return res.status(200).json({
      success: true,
      data: responseData,
      message: `Claim approved successfully${marketplaceListing ? ' with marketplace listing' : ''}`,
    });
  } catch (error) {
    logger.error('POST /api/claims/[id]/approve error:', error as Error);

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
