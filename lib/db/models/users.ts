/**
 * Users Collection Model
 */

import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';

export interface User {
  _id?: ObjectId;
  email: string;
  password_hash: string;
  full_name?: string;
  role: 'contributor' | 'company' | 'verifier';
  avatar_url?: string;
  wallet_address?: string;
  created_at: Date;
  updated_at?: Date;
}

export class UsersModel {
  private static COLLECTION = 'users';

  static async findByEmail(email: string): Promise<User | null> {
    const db = await getDb();
    return db.collection<User>(this.COLLECTION).findOne({ email });
  }

  static async findById(id: string | ObjectId): Promise<User | null> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return db.collection<User>(this.COLLECTION).findOne({ _id });
  }

  static async create(user: Omit<User, '_id' | 'created_at'>): Promise<User> {
    const db = await getDb();
    const newUser: User = {
      ...user,
      created_at: new Date(),
    };
    const result = await db.collection<User>(this.COLLECTION).insertOne(newUser);
    return { ...newUser, _id: result.insertedId };
  }

  static async update(id: string | ObjectId, updates: Partial<User>): Promise<boolean> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await db.collection<User>(this.COLLECTION).updateOne(
      { _id },
      { $set: { ...updates, updated_at: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  static async findAll(filter: Partial<User> = {}): Promise<User[]> {
    const db = await getDb();
    return db.collection<User>(this.COLLECTION).find(filter).toArray();
  }
}

