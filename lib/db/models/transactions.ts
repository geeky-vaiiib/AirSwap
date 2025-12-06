/**
 * Transactions Collection Model
 */

import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';

export type TransactionType = 'issue' | 'transfer' | 'purchase' | 'sale';

export interface Transaction {
  _id?: ObjectId;
  user_id: ObjectId;
  tx_hash?: string;
  type: TransactionType;
  metadata: {
    claim_id?: string;
    credit_id?: string;
    credits?: number;
    ndvi_delta?: number;
    from_user_id?: string;
    to_user_id?: string;
    listing_id?: string;
    price?: number;
    quantity?: number;
    [key: string]: any;
  };
  created_at: Date;
}

export class TransactionsModel {
  private static COLLECTION = 'transactions';

  static async create(transaction: Omit<Transaction, '_id' | 'created_at'>): Promise<Transaction> {
    const db = await getDb();
    const newTransaction: Transaction = {
      ...transaction,
      created_at: new Date(),
    };
    const result = await db.collection<Transaction>(this.COLLECTION).insertOne(newTransaction);
    return { ...newTransaction, _id: result.insertedId };
  }

  static async findById(id: string | ObjectId): Promise<Transaction | null> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return db.collection<Transaction>(this.COLLECTION).findOne({ _id });
  }

  static async findByUserId(userId: string | ObjectId, limit: number = 50): Promise<Transaction[]> {
    const db = await getDb();
    const user_id = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return db.collection<Transaction>(this.COLLECTION)
      .find({ user_id })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();
  }

  static async findByType(type: TransactionType, limit: number = 50): Promise<Transaction[]> {
    const db = await getDb();
    return db.collection<Transaction>(this.COLLECTION)
      .find({ type })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();
  }

  static async findAll(filter: Partial<Transaction> = {}, limit: number = 100): Promise<Transaction[]> {
    const db = await getDb();
    return db.collection<Transaction>(this.COLLECTION)
      .find(filter)
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();
  }

  static async findRecent(limit: number = 20): Promise<Transaction[]> {
    const db = await getDb();
    return db.collection<Transaction>(this.COLLECTION)
      .find()
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();
  }
}

