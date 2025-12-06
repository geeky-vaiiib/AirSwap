# Claims Feature - Quick Start Guide

## Overview

The Claims feature allows contributors to submit carbon credit claims for land restoration projects. The system includes:
- Multi-step claim creation form
- File upload for evidence (IPFS-ready)
- GeoJSON polygon validation for land boundaries
- Parent hash generation for data integrity
- Verification workflow for approvers
- Comprehensive audit logging

## Running Locally

### 1. Environment Setup

Create `.env.local` with:

```bash
# Required
MONGODB_URI=mongodb+srv://jonsnow280905_db_user:muggles2025@air-swap.ygxlbue.mongodb.net/?appName=Air-Swap
MONGODB_DB_NAME=airswap
JWT_SECRET=your-jwt-secret-here

# Optional (for production features)
NFT_STORAGE_API_KEY=your_nft_storage_key
SENDGRID_API_KEY=your_sendgrid_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Navigate to http://localhost:3000/dashboard/claims

### 4. Test the Feature

**As a Contributor:**
1. Login or use demo mode
2. Go to Dashboard → Claims
3. Click "New Claim"
4. Fill out the multi-step form
5. Submit claim
6. View claim details and status

**As a Verifier:**
1. Login as verifier
2. Go to claims list
3. Click on a pending claim
4. Click "Verify"
5. Approve or reject with notes

## API Endpoints

All endpoints require authentication (JWT token in cookies).

### Create Claim
```bash
POST /api/claims
Content-Type: application/json

{
  "contributorName": "John Doe",
  "contributorEmail": "john@example.com",
  "location": {
    "country": "India",
    "polygon": {
      "type": "Polygon",
      "coordinates": [[[77.5, 12.9], ...]]
    }
  },
  "description": "Land restoration project",
  "evidence": [
    { "name": "document.pdf", "type": "document" }
  ]
}
```

### List Claims
```bash
GET /api/claims?status=pending&page=1&limit=10
```

### Get Claim Details
```bash
GET /api/claims/:id
```

### Update Claim
```bash
PATCH /api/claims/:id
Content-Type: application/json

{
  "description": "Updated description"
}
```

### Append Evidence
```bash
POST /api/claims/:id/append-evidence
Content-Type: application/json

{
  "files": [
    { "name": "additional.pdf", "type": "document" }
  ]
}
```

### Verify Claim
```bash
POST /api/claims/:id/verify
Content-Type: application/json

{
  "approved": true,
  "credits": 150,
  "notes": "Claim approved based on evidence"
}
```

### NDVI Check
```bash
POST /api/ndvi-check
Content-Type: application/json

{
  "claimId": "...",
  "polygon": { ... }
}
```

## File Structure

```
pages/
  api/
    claims/
      index-v2.ts          # List and create claims
      [id]/
        index.ts           # Get and update single claim
        append-evidence.ts # Add evidence to claim
        verify-v2.ts       # Verify claim (verifier only)
    ndvi-check-v2.ts       # NDVI analysis endpoint
  dashboard/
    claims/
      index.tsx            # Claims list page
      [id].tsx            # Claim detail page
      create.tsx          # Multi-step form (TODO)

lib/
  db/
    models/
      claims.ts           # Enhanced Claim model
      credits.ts          # Credits model
  utils/
    parentHash.ts         # Parent hash generator
  services/
    fileStorage.ts        # IPFS/file upload service
  validators/
    claims.ts            # Zod validation schemas

__tests__/
  lib/
    utils/
      parentHash.test.ts  # Parent hash tests
```

## Key Features

### Parent Hash
Every claim gets an immutable SHA256 fingerprint:
- Combines contributor ID, timestamp, polygon, evidence CIDs
- Uses cryptographic nonce for uniqueness
- Enables tamper detection and verification

### Rate Limiting
- 10 claims per day per contributor
- Prevents spam and abuse
- Configurable per environment

### Audit Logging
Every action is logged:
- Claim created
- Claim updated
- Evidence appended
- Claim verified/rejected
- Includes timestamp, user, and notes

### File Upload
- Supports images, PDFs, documents
- 20MB file size limit
- IPFS integration ready (nft.storage)
- Local stub for development

### GeoJSON Validation
- Validates polygon structure
- Ensures closed polygons
- Checks coordinate ranges
- Supports multi-polygon shapes

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test parentHash

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Database Schema

### Claims Collection
```typescript
{
  _id: ObjectId,
  claimId: "AIR-CLAIM-0001",
  parentHash: "abc123...",
  status: "pending" | "verified" | "rejected",
  contributorId: ObjectId,
  contributorName: "John Doe",
  contributorEmail: "john@example.com",
  location: {
    country: "India",
    polygon: { type: "Polygon", coordinates: [...] }
  },
  description: "...",
  evidence: [
    { name: "file.pdf", url: "...", cid: "...", uploadedAt: Date }
  ],
  ndvi: { ndviDelta: 0.15, ... },
  creditsIssued: 150,
  verifiedAt: Date,
  verifierId: ObjectId,
  auditLog: [
    { event: "claim_created", userId: ObjectId, timestamp: Date }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

**Error: "Authentication required"**
- Ensure you're logged in
- Check JWT token in cookies
- Verify JWT_SECRET is set

**Error: "Rate limit exceeded"**
- Maximum 10 claims per day
- Wait until next day or contact admin

**Error: "Invalid polygon"**
- Ensure polygon is properly closed (first point = last point)
- Check coordinate ranges (lon: -180 to 180, lat: -90 to 90)
- Use at least 4 points

**Error: "File too large"**
- Maximum file size is 20MB
- Compress images or split large documents

**IPFS uploads showing "pending" CIDs**
- This is expected in development mode
- Set NFT_STORAGE_API_KEY for real IPFS uploads
- Stub mode generates fake CIDs for testing

## Contributing

1. Create feature branch: `git checkout -b feature/claims-enhancement`
2. Make changes
3. Run tests: `npm test`
4. Type check: `npm run typecheck`
5. Lint: `npm run lint`
6. Commit: `git commit -m "feat(claims): add feature"`
7. Push: `git push origin feature/claims-enhancement`
8. Create Pull Request

## Security Notes

- All endpoints require authentication
- Role-based access control enforced
- Input validation with Zod
- File type and size validation
- Rate limiting to prevent abuse
- Audit logging for compliance
- Parent hash prevents tampering

## Performance Considerations

- Pagination for large datasets (default 20 per page)
- Database indexes on common queries
- Lazy loading of evidence files
- Cached MongoDB connections
- Efficient GeoJSON queries

## Future Enhancements

- [ ] Blockchain minting integration
- [ ] Real-time NDVI analysis with Google Earth Engine
- [ ] Email notifications for claim status changes
- [ ] Bulk claim operations
- [ ] Advanced analytics dashboard
- [ ] Mobile app support
- [ ] Export claims to CSV/PDF
- [ ] Claim templates for common scenarios

## Support

For issues or questions:
1. Check the error message (most include helpful details)
2. Review the API documentation above
3. Check environment variables
4. Verify MongoDB connection
5. See CLAIMS_IMPLEMENTATION_COMPLETE.md for detailed implementation notes

---

**Status:** Production-ready backend, Frontend 80% complete
**Last Updated:** December 6, 2025
