/**
 * Evidence Collection Model
 */

import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';

export interface Evidence {
  _id?: ObjectId;
  claim_id: ObjectId;
  uploader_id: ObjectId;
  cid: string; // IPFS CID
  url: string;
  file_type?: string;
  file_size?: number;
  created_at: Date;
}

export class EvidenceModel {
  private static COLLECTION = 'evidence';

  static async create(evidence: Omit<Evidence, '_id' | 'created_at'>): Promise<Evidence> {
    const db = await getDb();
    const newEvidence: Evidence = {
      ...evidence,
      created_at: new Date(),
    };
    const result = await db.collection<Evidence>(this.COLLECTION).insertOne(newEvidence);
    return { ...newEvidence, _id: result.insertedId };
  }

  static async findById(id: string | ObjectId): Promise<Evidence | null> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return db.collection<Evidence>(this.COLLECTION).findOne({ _id });
  }

  static async findByClaimId(claimId: string | ObjectId): Promise<Evidence[]> {
    const db = await getDb();
    const claim_id = typeof claimId === 'string' ? new ObjectId(claimId) : claimId;
    return db.collection<Evidence>(this.COLLECTION).find({ claim_id }).sort({ created_at: -1 }).toArray();
  }

  static async findByUploaderId(uploaderId: string | ObjectId): Promise<Evidence[]> {
    const db = await getDb();
    const uploader_id = typeof uploaderId === 'string' ? new ObjectId(uploaderId) : uploaderId;
    return db.collection<Evidence>(this.COLLECTION).find({ uploader_id }).sort({ created_at: -1 }).toArray();
  }

  static async delete(id: string | ObjectId): Promise<boolean> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await db.collection<Evidence>(this.COLLECTION).deleteOne({ _id });
    return result.deletedCount > 0;
  }
}

