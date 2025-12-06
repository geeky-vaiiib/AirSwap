/**
 * Parent Hash Generator
 * 
 * Generates an immutable SHA256 fingerprint of claim data
 * for verification and integrity purposes.
 */

import crypto from 'crypto';

export interface ClaimSeedData {
  contributorId: string;
  createdAt: string; // ISO format
  polygon: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  evidenceCIDs: string[];
  nonce: string;
}

/**
 * Canonicalize JSON object for consistent hashing
 * Sorts keys alphabetically and ensures consistent formatting
 */
function canonicalizeJSON(obj: any): string {
  if (obj === null) return 'null';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  
  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalizeJSON(item)).join(',') + ']';
  }
  
  const keys = Object.keys(obj).sort();
  const pairs = keys.map(key => `"${key}":${canonicalizeJSON(obj[key])}`);
  return '{' + pairs.join(',') + '}';
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Generate parent hash from claim seed data
 * 
 * @param contributorId - User ID of the contributor
 * @param createdAt - Claim creation timestamp (Date object)
 * @param polygon - GeoJSON polygon of the land claim
 * @param evidenceCIDs - Array of CIDs or URLs for evidence files
 * @param nonce - Optional nonce (will be generated if not provided)
 * @returns Object containing parentHash and nonce
 */
export function generateParentHash(
  contributorId: string,
  createdAt: Date,
  polygon: { type: 'Polygon'; coordinates: number[][][] },
  evidenceCIDs: string[],
  nonce?: string
): { parentHash: string; nonce: string } {
  // Generate nonce if not provided
  const claimNonce = nonce || generateUUID();
  
  // Sort evidence CIDs lexicographically for deterministic ordering
  const sortedCIDs = [...evidenceCIDs].sort();
  
  // Construct seed object
  const seedData: ClaimSeedData = {
    contributorId,
    createdAt: createdAt.toISOString(),
    polygon: {
      type: polygon.type,
      coordinates: polygon.coordinates,
    },
    evidenceCIDs: sortedCIDs,
    nonce: claimNonce,
  };
  
  // Canonicalize and hash
  const canonical = canonicalizeJSON(seedData);
  const hash = crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
  
  return {
    parentHash: hash,
    nonce: claimNonce,
  };
}

/**
 * Verify parent hash matches claim data
 * 
 * @param expectedHash - The stored parent hash to verify against
 * @param contributorId - User ID of the contributor
 * @param createdAt - Claim creation timestamp
 * @param polygon - GeoJSON polygon of the land claim
 * @param evidenceCIDs - Array of CIDs or URLs for evidence files
 * @param nonce - The nonce used in original hash generation
 * @returns true if hash matches, false otherwise
 */
export function verifyParentHash(
  expectedHash: string,
  contributorId: string,
  createdAt: Date,
  polygon: { type: 'Polygon'; coordinates: number[][][] },
  evidenceCIDs: string[],
  nonce: string
): boolean {
  const { parentHash } = generateParentHash(
    contributorId,
    createdAt,
    polygon,
    evidenceCIDs,
    nonce
  );
  
  return parentHash === expectedHash;
}

/**
 * Extract evidence CIDs from evidence array
 * Helper function to get CIDs for hash generation
 */
export function extractEvidenceCIDs(
  evidence: Array<{ cid?: string; url: string }>
): string[] {
  return evidence.map(e => e.cid || e.url);
}
