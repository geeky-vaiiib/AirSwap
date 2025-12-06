/**
 * Marketplace Listings Collection Model
 */

import { ObjectId } from 'mongodb';
import { getDb } from '../mongo';

export interface MarketplaceListing {
  _id?: ObjectId;
  seller_id: ObjectId;
  credit_id: ObjectId;
  price: number;
  quantity: number;
  status: 'active' | 'sold' | 'cancelled';
  buyer_id?: ObjectId;
  sold_at?: Date;
  created_at: Date;
  updated_at?: Date;
}

export class MarketplaceModel {
  private static COLLECTION = 'marketplace_listings';

  static async create(listing: Omit<MarketplaceListing, '_id' | 'created_at' | 'status'>): Promise<MarketplaceListing> {
    const db = await getDb();
    const newListing: MarketplaceListing = {
      ...listing,
      status: 'active',
      created_at: new Date(),
    };
    const result = await db.collection<MarketplaceListing>(this.COLLECTION).insertOne(newListing);
    return { ...newListing, _id: result.insertedId };
  }

  static async findById(id: string | ObjectId): Promise<MarketplaceListing | null> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return db.collection<MarketplaceListing>(this.COLLECTION).findOne({ _id });
  }

  static async findActive(): Promise<MarketplaceListing[]> {
    const db = await getDb();
    return db.collection<MarketplaceListing>(this.COLLECTION)
      .find({ status: 'active' })
      .sort({ created_at: -1 })
      .toArray();
  }

  static async findBySellerId(sellerId: string | ObjectId): Promise<MarketplaceListing[]> {
    const db = await getDb();
    const seller_id = typeof sellerId === 'string' ? new ObjectId(sellerId) : sellerId;
    return db.collection<MarketplaceListing>(this.COLLECTION)
      .find({ seller_id })
      .sort({ created_at: -1 })
      .toArray();
  }

  static async update(id: string | ObjectId, updates: Partial<MarketplaceListing>): Promise<boolean> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await db.collection<MarketplaceListing>(this.COLLECTION).updateOne(
      { _id },
      { $set: { ...updates, updated_at: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  static async purchase(id: string | ObjectId, buyerId: ObjectId, quantity: number): Promise<boolean> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    
    const listing = await this.findById(_id);
    if (!listing || listing.status !== 'active' || listing.quantity < quantity) {
      return false;
    }

    const newQuantity = listing.quantity - quantity;
    const updates: Partial<MarketplaceListing> = {
      quantity: newQuantity,
      updated_at: new Date(),
    };

    if (newQuantity === 0) {
      updates.status = 'sold';
      updates.buyer_id = buyerId;
      updates.sold_at = new Date();
    }

    const result = await db.collection<MarketplaceListing>(this.COLLECTION).updateOne(
      { _id, status: 'active' },
      { $set: updates }
    );
    return result.modifiedCount > 0;
  }

  static async cancel(id: string | ObjectId): Promise<boolean> {
    const db = await getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await db.collection<MarketplaceListing>(this.COLLECTION).updateOne(
      { _id, status: 'active' },
      { $set: { status: 'cancelled', updated_at: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  static async findActiveWithDetails(): Promise<any[]> {
    const db = await getDb();
    return db.collection<MarketplaceListing>(this.COLLECTION).aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'users',
          localField: 'seller_id',
          foreignField: '_id',
          as: 'seller'
        }
      },
      {
        $lookup: {
          from: 'credits',
          localField: 'credit_id',
          foreignField: '_id',
          as: 'credit'
        }
      },
      { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$credit', preserveNullAndEmptyArrays: true } },
      { $sort: { created_at: -1 } }
    ]).toArray();
  }
}

