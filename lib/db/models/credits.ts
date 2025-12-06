/**
 * Credits Collection Model
 */

import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';

export interface Credit {
  _id?: ObjectId;
  claim_id: ObjectId;
  owner_id: ObjectId;
  amount: number;
  token_id?: string;
  metadata_cid?: string;
  issued_at: Date;
}

export class CreditsModel {
  private static COLLECTION = 'credits';

  static async create(credit: Omit<Credit, '_id' | 'issued_at'>): Promise<Credit> {
    const db = await getDb();
    const newCredit: Credit = {
      ...credit,
      issued_at: new Date(),
    };
    const result = await db.collection<Credit>(this.COLLECTION).insertOne(newCredit);
    return { ...newCredit, _id: result.insertedId };
  }

  static async findById(id: string | ObjectId): Promise<Credit | null> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return db.collection<Credit>(this.COLLECTION).findOne({ _id });
  }

  static async findByOwnerId(ownerId: string | ObjectId): Promise<Credit[]> {
    const db = await getDb();
    const owner_id = typeof ownerId === 'string' ? new ObjectId(ownerId) : ownerId;
    return db.collection<Credit>(this.COLLECTION).find({ owner_id }).sort({ issued_at: -1 }).toArray();
  }

  static async findByClaimId(claimId: string | ObjectId): Promise<Credit[]> {
    const db = await getDb();
    const claim_id = typeof claimId === 'string' ? new ObjectId(claimId) : claimId;
    return db.collection<Credit>(this.COLLECTION).find({ claim_id }).toArray();
  }

  static async update(id: string | ObjectId, updates: Partial<Credit>): Promise<boolean> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await db.collection<Credit>(this.COLLECTION).updateOne(
      { _id },
      { $set: updates }
    );
    return result.modifiedCount > 0;
  }

  static async transferOwnership(id: string | ObjectId, newOwnerId: ObjectId): Promise<boolean> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await db.collection<Credit>(this.COLLECTION).updateOne(
      { _id },
      { $set: { owner_id: newOwnerId } }
    );
    return result.modifiedCount > 0;
  }

  static async getTotalByOwner(ownerId: string | ObjectId): Promise<number> {
    const db = await getDb();
    const owner_id = typeof ownerId === 'string' ? new ObjectId(ownerId) : ownerId;
    const result = await db.collection<Credit>(this.COLLECTION).aggregate([
      { $match: { owner_id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    return result.length > 0 ? result[0].total : 0;
  }
}

