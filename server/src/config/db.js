const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const env = require('./env');

let memServer = null;
let connectionPromise = null;

const autoSeedIfEmpty = async () => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  try {
    const Medicine = require('../models/Medicine');
    const count = await Medicine.countDocuments();
    if (count === 0) {
      console.log('[MongoDB] Empty catalog detected. Running initial database seed...');
      const seedDatabase = require('../seed/seed');
      await seedDatabase(false);
      console.log('[MongoDB] ✅ Database auto-seed completed successfully.');
    } else {
      console.log(`[MongoDB] Catalog ready with ${count} master medicines.`);
    }
  } catch (seedErr) {
    console.warn('[MongoDB] Auto-seed check warning:', seedErr.message);
  }
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    // Step 1: Try connecting to primary URI (Atlas or local)
    try {
      const sanitizedUri = (env.MONGO_URI || '').replace(/:([^@]+)@/, ':****@');
      console.log(`[MongoDB] Connecting to database: ${sanitizedUri} ...`);
      const conn = await mongoose.connect(env.MONGO_URI, {
        autoIndex: true,
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`[MongoDB] ✅ Connected successfully: ${conn.connection.host}`);
      await autoSeedIfEmpty();
      return conn;
    } catch (error) {
    console.error(`\n❌ [MongoDB] Connection to primary database failed: ${error.message}`);

    if (error.message.includes('Could not connect to any servers') || error.message.includes('whitelist')) {
      console.warn('\n-------------------------------------------------------------');
      console.warn('⚠️  MONGODB ATLAS IP WHITELIST NOTICE:');
      console.warn('   Your current IP address is not whitelisted on MongoDB Atlas.');
      console.warn('   To fix in 15 seconds:');
      console.warn('   1. Go to https://cloud.mongodb.com -> Security -> Network Access');
      console.warn('   2. Click "+ Add IP Address" -> Select "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)');
      console.warn('   3. Click Confirm.');
      console.warn('-------------------------------------------------------------\n');
    }

    // Step 2: Fallback to embedded In-Memory MongoDB if available (dev only)
    try {
      console.log('[MongoDB] Attempting to launch embedded In-Memory database engine fallback...');
      let MongoMemoryServer;
      try {
        ({ MongoMemoryServer } = require('mongodb-memory-server'));
      } catch (requireErr) {
        throw new Error('mongodb-memory-server not installed (production mode)');
      }
      if (!memServer) {
        memServer = await MongoMemoryServer.create({
          instance: { dbName: 'medirush' }
        });
      }
      const memUri = memServer.getUri();
      console.log(`[MongoDB] Embedded engine started at: ${memUri}`);
      const conn = await mongoose.connect(memUri, { autoIndex: true });
      console.log('[MongoDB] ✅ Connected to embedded In-Memory database!');
      
      if (process.env.NODE_ENV !== 'test') {
        const seedDatabase = require('../seed/seed');
        await seedDatabase(false);
        console.log('[MongoDB] ✅ In-Memory database fully seeded with all medicines, pharmacies & accounts!');
      }
      return conn;
    } catch (memErr) {
      console.warn(`[MongoDB] In-memory fallback error: ${memErr.message}`);
    }

      if (env.NODE_ENV !== 'test') {
        console.warn('[MongoDB] Retrying primary connection in 6 seconds...');
        connectionPromise = null;
        setTimeout(connectDB, 6000);
      }
    }
  })();

  return connectionPromise;
};

module.exports = connectDB;
