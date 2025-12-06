/**
 * Claims Collection Model
 */

import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';

export interface Claim {
  _id?: ObjectId;
  user_id: ObjectId;
  location: string;
  polygon: any; // GeoJSON object
  ndvi_before?: any;
  ndvi_after?: any;
  ndvi_delta?: number;
  evidence?: string[]; // Array of CIDs or URLs
  area?: number;
  status: 'pending' | 'verified' | 'rejected';
  credits_assigned?: number;
  verified_by?: ObjectId;
  verified_at?: Date;
  rejection_reason?: string;
  created_at: Date;
  updated_at?: Date;
}

export class ClaimsModel {
  private static COLLECTION = 'claims';

  static async create(claim: Omit<Claim, '_id' | 'created_at' | 'status'>): Promise<Claim> {
    const db = await getDb();
    const newClaim: Claim = {
      ...claim,
      status: 'pending',
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

  static async findByUserId(userId: string | ObjectId): Promise<Claim[]> {
    const db = await getDb();
    const user_id = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return db.collection<Claim>(this.COLLECTION).find({ user_id }).sort({ created_at: -1 }).toArray();
  }

  static async findByStatus(status: Claim['status']): Promise<Claim[]> {
    const db = await getDb();
    return db.collection<Claim>(this.COLLECTION).find({ status }).sort({ created_at: -1 }).toArray();
  }

  static async findAll(filter: Partial<Claim> = {}): Promise<Claim[]> {
    const db = await getDb();
    return db.collection<Claim>(this.COLLECTION).find(filter).sort({ created_at: -1 }).toArray();
  }

  static async update(id: string | ObjectId, updates: Partial<Claim>): Promise<boolean> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await db.collection<Claim>(this.COLLECTION).updateOne(
      { _id },
      { $set: { ...updates, updated_at: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  static async verify(
    id: string | ObjectId,
    verifierId: ObjectId,
    approved: boolean,
    credits?: number,
    comment?: string
  ): Promise<boolean> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    
    const updates: Partial<Claim> = {
      status: approved ? 'verified' : 'rejected',
      verified_by: verifierId,
      verified_at: new Date(),
      updated_at: new Date(),
    };

    if (approved && credits) {
      updates.credits_assigned = credits;
    }

    if (!approved && comment) {
      updates.rejection_reason = comment;
    }

    const result = await db.collection<Claim>(this.COLLECTION).updateOne({ _id }, { $set: updates });
    return result.modifiedCount > 0;
  }

  static async countByUserToday(userId: string | ObjectId): Promise<number> {
    const db = await getDb();
    const user_id = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return db.collection<Claim>(this.COLLECTION).countDocuments({
      user_id,
      created_at: { $gte: today },
    });
  }
}

