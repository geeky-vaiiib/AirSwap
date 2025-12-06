/**
 * Tests for Parent Hash Generator
 */

import {
  generateParentHash,
  verifyParentHash,
  extractEvidenceCIDs,
} from '../../../lib/utils/parentHash';

describe('Parent Hash Generator', () => {
  const testContributorId = '507f1f77bcf86cd799439011';
  const testDate = new Date('2024-01-15T10:00:00Z');
  const testPolygon = {
    type: 'Polygon' as const,
    coordinates: [
      [
        [77.5946, 12.9716],
        [77.5947, 12.9716],
        [77.5947, 12.9717],
        [77.5946, 12.9717],
        [77.5946, 12.9716], // Closed polygon
      ],
    ],
  };
  const testEvidenceCIDs = [
    'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    'bafybeihkoviema7g3gxyt6la7vd5ho32ictqbilu3wnlo3rs7ewhnp7lly',
  ];

  describe('generateParentHash', () => {
    it('should generate a valid parent hash', () => {
      const result = generateParentHash(
        testContributorId,
        testDate,
        testPolygon,
        testEvidenceCIDs
      );

      expect(result).toHaveProperty('parentHash');
      expect(result).toHaveProperty('nonce');
      expect(typeof result.parentHash).toBe('string');
      expect(result.parentHash).toHaveLength(64); // SHA256 hex = 64 chars
      expect(typeof result.nonce).toBe('string');
    });

    it('should generate different hashes for different nonces', () => {
      const result1 = generateParentHash(
        testContributorId,
        testDate,
        testPolygon,
        testEvidenceCIDs,
        'nonce-1'
      );

      const result2 = generateParentHash(
        testContributorId,
        testDate,
        testPolygon,
        testEvidenceCIDs,
        'nonce-2'
      );

      expect(result1.parentHash).not.toBe(result2.parentHash);
    });

    it('should generate same hash for same inputs with same nonce', () => {
      const nonce = 'test-nonce-123';

      const result1 = generateParentHash(
        testContributorId,
        testDate,
        testPolygon,
        testEvidenceCIDs,
        nonce
      );

      const result2 = generateParentHash(
        testContributorId,
        testDate,
        testPolygon,
        testEvidenceCIDs,
        nonce
      );

      expect(result1.parentHash).toBe(result2.parentHash);
      expect(result1.nonce).toBe(result2.nonce);
    });

    it('should handle unsorted evidence CIDs consistently', () => {
      const unsorted = ['cid-3', 'cid-1', 'cid-2'];
      const sorted = ['cid-1', 'cid-2', 'cid-3'];
      const nonce = 'test-nonce';

      const result1 = generateParentHash(
        testContributorId,
        testDate,
        testPolygon,
        unsorted,
        nonce
      );

      const result2 = generateParentHash(
        testContributorId,
        testDate,
        testPolygon,
        sorted,
        nonce
      );

      // Should be same because internal sorting
      expect(result1.parentHash).toBe(result2.parentHash);
    });

    it('should generate different hashes for different dates', () => {
      const nonce = 'test-nonce';
      const date1 = new Date('2024-01-01T00:00:00Z');
      const date2 = new Date('2024-01-02T00:00:00Z');

      const result1 = generateParentHash(
        testContributorId,
        date1,
        testPolygon,
        testEvidenceCIDs,
        nonce
      );

      const result2 = generateParentHash(
        testContributorId,
        date2,
        testPolygon,
        testEvidenceCIDs,
        nonce
      );

      expect(result1.parentHash).not.toBe(result2.parentHash);
    });
  });

  describe('verifyParentHash', () => {
    it('should verify a valid parent hash', () => {
      const { parentHash, nonce } = generateParentHash(
        testContributorId,
        testDate,
        testPolygon,
        testEvidenceCIDs
      );

      const isValid = verifyParentHash(
        parentHash,
        testContributorId,
        testDate,
        testPolygon,
        testEvidenceCIDs,
        nonce
      );

      expect(isValid).toBe(true);
    });

    it('should reject invalid parent hash', () => {
      const { nonce } = generateParentHash(
        testContributorId,
        testDate,
        testPolygon,
        testEvidenceCIDs
      );

      const isValid = verifyParentHash(
        'invalid-hash-123',
        testContributorId,
        testDate,
        testPolygon,
        testEvidenceCIDs,
        nonce
      );

      expect(isValid).toBe(false);
    });

    it('should reject tampered evidence CIDs', () => {
      const { parentHash, nonce } = generateParentHash(
        testContributorId,
        testDate,
        testPolygon,
        testEvidenceCIDs
      );

      const tamperedCIDs = [...testEvidenceCIDs, 'extra-cid'];

      const isValid = verifyParentHash(
        parentHash,
        testContributorId,
        testDate,
        testPolygon,
        tamperedCIDs,
        nonce
      );

      expect(isValid).toBe(false);
    });
  });

  describe('extractEvidenceCIDs', () => {
    it('should extract CIDs from evidence array', () => {
      const evidence = [
        { cid: 'cid-1', url: 'https://example.com/1' },
        { cid: 'cid-2', url: 'https://example.com/2' },
      ];

      const cids = extractEvidenceCIDs(evidence);

      expect(cids).toEqual(['cid-1', 'cid-2']);
    });

    it('should use URLs when CIDs are missing', () => {
      const evidence = [
        { url: 'https://example.com/1' },
        { cid: 'cid-2', url: 'https://example.com/2' },
      ];

      const cids = extractEvidenceCIDs(evidence);

      expect(cids).toEqual(['https://example.com/1', 'cid-2']);
    });
  });
});
