/**
 * Verifier Logs Collection Model
 */

import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';

export interface VerifierLog {
  _id?: ObjectId;
  claim_id: ObjectId;
  verifier_id: ObjectId;
  action: 'approve' | 'reject';
  comment?: string;
  created_at: Date;
}

export class VerifierLogsModel {
  private static COLLECTION = 'verifier_logs';

  static async create(log: Omit<VerifierLog, '_id' | 'created_at'>): Promise<VerifierLog> {
    const db = await getDb();
    const newLog: VerifierLog = {
      ...log,
      created_at: new Date(),
    };
    const result = await db.collection<VerifierLog>(this.COLLECTION).insertOne(newLog);
    return { ...newLog, _id: result.insertedId };
  }

  static async findByClaimId(claimId: string | ObjectId): Promise<VerifierLog[]> {
    const db = await getDb();
    const claim_id = typeof claimId === 'string' ? new ObjectId(claimId) : claimId;
    return db.collection<VerifierLog>(this.COLLECTION)
      .find({ claim_id })
      .sort({ created_at: -1 })
      .toArray();
  }

  static async findByVerifierId(verifierId: string | ObjectId): Promise<VerifierLog[]> {
    const db = await getDb();
    const verifier_id = typeof verifierId === 'string' ? new ObjectId(verifierId) : verifierId;
    return db.collection<VerifierLog>(this.COLLECTION)
      .find({ verifier_id })
      .sort({ created_at: -1 })
      .toArray();
  }

  static async findAll(limit: number = 100): Promise<VerifierLog[]> {
    const db = await getDb();
    return db.collection<VerifierLog>(this.COLLECTION)
      .find()
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();
  }

  static async countByVerifier(verifierId: string | ObjectId): Promise<{ approved: number; rejected: number }> {
    const db = await getDb();
    const verifier_id = typeof verifierId === 'string' ? new ObjectId(verifierId) : verifierId;
    const result = await db.collection<VerifierLog>(this.COLLECTION).aggregate([
      { $match: { verifier_id } },
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]).toArray();
    
    const counts = { approved: 0, rejected: 0 };
    result.forEach(r => {
      if (r._id === 'approve') counts.approved = r.count;
      if (r._id === 'reject') counts.rejected = r.count;
    });
    return counts;
  }
}

