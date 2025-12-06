/**
 * Zod validation schemas for Claims API
 * Enhanced with GeoJSON validation and comprehensive field validation
 */

import { z } from 'zod';

// MongoDB ObjectId validation regex (24 hex characters)
const objectIdRegex = /^[a-fA-F0-9]{24}$/;

/**
 * Custom ObjectId validator
 */
export const ObjectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

/**
 * GeoJSON Polygon coordinate validation
 * Validates proper polygon structure and coordinate ranges
 */
export const GeoJSONPolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z
    .array(
      z.array(
        z.tuple([
          z.number().min(-180).max(180), // longitude
          z.number().min(-90).max(90),   // latitude
        ])
      ).min(4) // Minimum 4 points for a closed polygon (last point = first point)
    )
    .min(1)
    .refine(
      (rings) => {
        // Validate that first and last coordinates match (closed polygon)
        const firstRing = rings[0];
        if (firstRing.length < 4) return false;
        const first = firstRing[0];
        const last = firstRing[firstRing.length - 1];
        return first[0] === last[0] && first[1] === last[1];
      },
      { message: 'Polygon must be closed (first and last points must match)' }
    ),
});

/**
 * Location data schema
 */
export const LocationSchema = z.object({
  country: z.string().min(2, 'Country is required'),
  state: z.string().optional(),
  city: z.string().optional(),
  description: z.string().optional(),
  polygon: GeoJSONPolygonSchema,
});

/**
 * Evidence file metadata schema (for temporary uploads)
 */
export const EvidenceFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  tmpId: z.string().optional(), // Temporary ID before upload
  type: z.enum(['document', 'image', 'satellite']).optional().default('document'),
});

/**
 * Schema for creating a new claim (POST /api/claims)
 */
export const CreateClaimSchema = z.object({
  // Contributor information (will be validated against auth)
  contributorName: z.string().min(2, 'Contributor name is required'),
  contributorEmail: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  
  // Location and land details
  location: LocationSchema,
  areaHectares: z.number().positive('Area must be positive').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  expectedCredits: z.number().int().positive('Expected credits must be positive').optional(),
  
  // Evidence files (to be uploaded)
  evidence: z.array(EvidenceFileSchema).min(1, 'At least one evidence file is required'),
  
  // NDVI data (optional, can be added later)
  ndvi: z.object({
    beforeImageCid: z.string().optional(),
    afterImageCid: z.string().optional(),
  }).optional(),
});

/**
 * Schema for updating a claim (PATCH /api/claims/:id)
 */
export const UpdateClaimSchema = z.object({
  contributorName: z.string().min(2).optional(),
  contributorEmail: z.string().email().optional(),
  phone: z.string().optional(),
  location: LocationSchema.optional(),
  areaHectares: z.number().positive().optional(),
  description: z.string().min(10).optional(),
  expectedCredits: z.number().int().positive().optional(),
}).partial();

/**
 * Schema for appending evidence to a claim
 */
export const AppendEvidenceSchema = z.object({
  files: z.array(EvidenceFileSchema).min(1, 'At least one file is required'),
});

/**
 * Schema for verifying a claim (POST /api/claims/:id/verify)
 */
export const VerifyClaimSchema = z.object({
  approved: z.boolean(),
  credits: z.number().int().positive('Credits must be positive').optional(),
  notes: z.string().optional(),
});

/**
 * Query parameters for listing claims
 */
export const ListClaimsQuerySchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  sortBy: z.enum(['createdAt', 'updatedAt', 'ndviDelta', 'creditsIssued']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Schema for NDVI check request
 */
export const NDVICheckSchema = z.object({
  polygon: GeoJSONPolygonSchema.optional(),
  beforeImage: z.string().optional(), // CID or URL
  afterImage: z.string().optional(),  // CID or URL
  claimId: z.string().optional(),
}).refine(
  (data) => data.polygon || (data.beforeImage && data.afterImage),
  { message: 'Either polygon or both before/after images are required' }
);

// Type exports
export type CreateClaimInput = z.infer<typeof CreateClaimSchema>;
export type UpdateClaimInput = z.infer<typeof UpdateClaimSchema>;
export type VerifyClaimInput = z.infer<typeof VerifyClaimSchema>;
export type AppendEvidenceInput = z.infer<typeof AppendEvidenceSchema>;
export type ListClaimsQuery = z.infer<typeof ListClaimsQuerySchema>;
export type NDVICheckInput = z.infer<typeof NDVICheckSchema>;

// Legacy exports for backward compatibility
export const ClaimInputSchema = CreateClaimSchema;
export const VerifyInputSchema = VerifyClaimSchema;
export type ClaimInput = CreateClaimInput;
export type VerifyInput = VerifyClaimInput;

