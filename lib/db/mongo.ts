/**
 * MongoDB Client Connection
 * Singleton pattern to prevent duplicate connections in development
 */

import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable');
}

if (!process.env.MONGODB_DB_NAME) {
  throw new Error('Please define MONGODB_DB_NAME environment variable');
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

interface MongoGlobal {
  conn: { client: MongoClient; db: Db } | null;
  promise: Promise<{ client: MongoClient; db: Db }> | null;
}

declare global {
  var mongo: MongoGlobal;
}

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

/**
 * Get MongoDB database connection
 * Uses connection pooling and caching for optimal performance
 */
export async function getDb(): Promise<Db> {
  if (cached.conn) {
    return cached.conn.db;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = MongoClient.connect(MONGODB_URI, opts).then((client) => {
      return {
        client,
        db: client.db(MONGODB_DB_NAME),
      };
    });
  }

  cached.conn = await cached.promise;
  return cached.conn.db;
}

/**
 * Get MongoDB client (for advanced operations)
 */
export async function getClient(): Promise<MongoClient> {
  if (cached.conn) {
    return cached.conn.client;
  }

  const db = await getDb();
  return cached.conn!.client;
}

/**
 * Close MongoDB connection (for cleanup)
 */
export async function closeDb(): Promise<void> {
  if (cached.conn) {
    await cached.conn.client.close();
    cached.conn = null;
    cached.promise = null;
  }
}

/**
 * Initialize database indexes
 * Call this once on application startup
 */
export async function initializeIndexes(): Promise<void> {
  const db = await getDb();

  // Users collection indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  // Claims collection indexes
  await db.collection('claims').createIndex({ user_id: 1 });
  await db.collection('claims').createIndex({ status: 1 });
  await db.collection('claims').createIndex({ created_at: -1 });

  // Credits collection indexes
  await db.collection('credits').createIndex({ owner_id: 1 });
  await db.collection('credits').createIndex({ claim_id: 1 });

  // Evidence collection indexes
  await db.collection('evidence').createIndex({ claim_id: 1 });
  await db.collection('evidence').createIndex({ uploader_id: 1 });

  // Marketplace collection indexes
  await db.collection('marketplace_listings').createIndex({ status: 1 });
  await db.collection('marketplace_listings').createIndex({ seller_id: 1 });

  // Verifier logs collection indexes
  await db.collection('verifier_logs').createIndex({ claim_id: 1 });
  await db.collection('verifier_logs').createIndex({ verifier_id: 1 });
  await db.collection('verifier_logs').createIndex({ created_at: -1 });

  // Transactions collection indexes
  await db.collection('transactions').createIndex({ user_id: 1 });
  await db.collection('transactions').createIndex({ created_at: -1 });

  console.log('✓ MongoDB indexes initialized');
}

