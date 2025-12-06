/**
 * Claims Collection Model - Enhanced for Production
 */

import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';

export interface EvidenceFile {
  name: string;
  type: 'document' | 'image' | 'satellite';
  url: string;
  cid?: string;
  mimeType?: string;
  size?: number;
  uploadedAt: Date;
}

export interface NDVIData {
  beforeImageCid?: string;
  afterImageCid?: string;
  ndviDelta?: number;
  processedAt?: Date;
  jobId?: string;
}

export interface LocationData {
  country: string;
  state?: string;
  city?: string;
  description?: string;
  polygon: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface AuditLogEntry {
  event: string;
  userId?: ObjectId;
  userName?: string;
  note?: string;
  timestamp: Date;
}

export interface Claim {
  _id?: ObjectId;
  claimId: string; // Human-friendly ID like AIR-CLAIM-0001
  parentHash: string; // Immutable fingerprint of claim data
  status: 'pending' | 'verified' | 'rejected';
  
  // Contributor information
  contributorId: ObjectId;
  contributorName: string;
  contributorEmail: string;
  phone?: string;
  
  // Location and land details
  location: LocationData;
  areaHectares?: number;
  description: string;
  expectedCredits?: number;
  
  // Evidence and verification
  evidence: EvidenceFile[];
  ndvi?: NDVIData;
  
  // Verification details
  verifiedAt?: Date;
  verifierId?: ObjectId;
  verifierNotes?: string;
  creditsIssued?: number;
  
  // Blockchain integration
  tokenId?: string;
  metadataCID?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt?: Date;
  
  // Audit trail
  auditLog: AuditLogEntry[];
  
  // Legacy fields for backward compatibility
  user_id?: ObjectId;
  polygon?: any;
  ndvi_before?: any;
  ndvi_after?: any;
  ndvi_delta?: number;
  credits_assigned?: number;
  verified_by?: ObjectId;
  verified_at?: Date;
  rejection_reason?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class ClaimsModel {
  private static COLLECTION = 'claims';

  /**
   * Generate next claim ID in sequence (AIR-CLAIM-0001, AIR-CLAIM-0002, etc.)
   */
  private static async generateClaimId(): Promise<string> {
    const db = await getDb();
    const lastClaim = await db
      .collection<Claim>(this.COLLECTION)
      .find()
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    if (lastClaim.length === 0) {
      return 'AIR-CLAIM-0001';
    }

    const lastId = lastClaim[0].claimId;
    const match = lastId.match(/AIR-CLAIM-(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1]) + 1;
      return `AIR-CLAIM-${String(nextNum).padStart(4, '0')}`;
    }

    return 'AIR-CLAIM-0001';
  }

  static async create(
    claim: Omit<Claim, '_id' | 'createdAt' | 'status' | 'claimId' | 'auditLog'>
  ): Promise<Claim> {
    const db = await getDb();
    const claimId = await this.generateClaimId();
    
    const newClaim: Claim = {
      ...claim,
      claimId,
      status: 'pending',
      createdAt: new Date(),
      auditLog: [
        {
          event: 'claim_created',
          userId: claim.contributorId,
          userName: claim.contributorName,
          note: 'Claim submitted for verification',
          timestamp: new Date(),
        },
      ],
      // Legacy compatibility
      user_id: claim.contributorId,
      created_at: new Date(),
    };
    
    const result = await db.collection<Claim>(this.COLLECTION).insertOne(newClaim);
    return { ...newClaim, _id: result.insertedId };
  }

  static async findById(id: string | ObjectId): Promise<Claim | null> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return db.collection<Claim>(this.COLLECTION).findOne({ _id });
  }

  static async findByClaimId(claimId: string): Promise<Claim | null> {
    const db = await getDb();
    return db.collection<Claim>(this.COLLECTION).findOne({ claimId });
  }

  static async findByUserId(userId: string | ObjectId): Promise<Claim[]> {
    const db = await getDb();
    const contributorId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return db
      .collection<Claim>(this.COLLECTION)
      .find({ contributorId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async findByStatus(status: Claim['status']): Promise<Claim[]> {
    const db = await getDb();
    return db
      .collection<Claim>(this.COLLECTION)
      .find({ status })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async findAll(filter: Partial<Claim> = {}): Promise<Claim[]> {
    const db = await getDb();
    return db
      .collection<Claim>(this.COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async findPaginated(
    filter: Partial<Claim> = {},
    skip: number = 0,
    limit: number = 20,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ data: Claim[]; total: number; page: number; pages: number }> {
    const db = await getDb();
    const collection = db.collection<Claim>(this.COLLECTION);

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      collection.find(filter).sort(sortOptions).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit),
    };
  }

  static async update(id: string | ObjectId, updates: Partial<Claim>): Promise<boolean> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await db.collection<Claim>(this.COLLECTION).updateOne(
      { _id },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date(),
          updated_at: new Date(), // Legacy
        } 
      }
    );
    
    return result.modifiedCount > 0;
  }

  static async appendEvidence(
    id: string | ObjectId,
    evidence: EvidenceFile
  ): Promise<boolean> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await db.collection<Claim>(this.COLLECTION).updateOne(
      { _id },
      {
        $push: { evidence: evidence },
        $set: { updatedAt: new Date(), updated_at: new Date() },
      }
    );
    
    return result.modifiedCount > 0;
  }

  static async addAuditLog(
    id: string | ObjectId,
    entry: Omit<AuditLogEntry, 'timestamp'>
  ): Promise<boolean> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    };
    
    const result = await db.collection<Claim>(this.COLLECTION).updateOne(
      { _id },
      {
        $push: { auditLog: logEntry },
        $set: { updatedAt: new Date() },
      }
    );
    
    return result.modifiedCount > 0;
  }

  static async verify(
    id: string | ObjectId,
    verifierId: ObjectId,
    verifierName: string,
    approved: boolean,
    credits?: number,
    notes?: string
  ): Promise<boolean> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;

    const updates: Partial<Claim> = {
      status: approved ? 'verified' : 'rejected',
      verifiedAt: new Date(),
      verifierId,
      verifierNotes: notes,
      updatedAt: new Date(),
      // Legacy fields
      verified_at: new Date(),
      verified_by: verifierId,
      rejection_reason: !approved ? notes : undefined,
    };

    if (approved && credits) {
      updates.creditsIssued = credits;
      updates.credits_assigned = credits; // Legacy
    }

    const auditEntry: AuditLogEntry = {
      event: approved ? 'claim_verified' : 'claim_rejected',
      userId: verifierId,
      userName: verifierName,
      note: notes || (approved ? 'Claim approved' : 'Claim rejected'),
      timestamp: new Date(),
    };

    const result = await db.collection<Claim>(this.COLLECTION).updateOne(
      { _id },
      {
        $set: updates,
        $push: { auditLog: auditEntry },
      }
    );

    return result.modifiedCount > 0;
  }

  static async countByUserToday(userId: string | ObjectId): Promise<number> {
    const db = await getDb();
    const contributorId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return db.collection<Claim>(this.COLLECTION).countDocuments({
      contributorId,
      createdAt: { $gte: today },
    });
  }

  static async updateNDVI(
    id: string | ObjectId,
    ndviData: NDVIData
  ): Promise<boolean> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await db.collection<Claim>(this.COLLECTION).updateOne(
      { _id },
      {
        $set: {
          ndvi: ndviData,
          updatedAt: new Date(),
          // Legacy fields
          ndvi_delta: ndviData.ndviDelta,
          updated_at: new Date(),
        },
      }
    );
    
    return result.modifiedCount > 0;
  }
}

