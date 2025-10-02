import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
// // const MONGODB_URI = "mongodb://0.0.0.0:27017/BadeAdmin";
// const options = {
//   dbName: "test",
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 30000, // Reduced timeout for faster failure detection
//   maxPoolSize: 20, // Increased pool size for better concurrency
//   tls: true, // Explicitly enabling TLS since Cosmos DB uses SSL
// };

// if (!MONGODB_URI) {
//   throw new Error('Please define the MONGODB_URI environment variable in .env.local');
// }

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function dbConnect() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const options = {
//       bufferCommands: false,
//     };

//     cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
//       return mongoose;
//     });
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }


let cachedDbName = null;

/**
 * Connects to MongoDB using Mongoose.
 * Disconnects and reconnects if the target database name changes.
 * @param {string} databaseName - The name of the database to connect to.
 */
async function dbConnect(databaseName ="BadeAdmin") {

    if (!databaseName) {
        console.error('❌ No database name provided. Connection aborted.');
        return;
    }

    const username = 'amaco';
    const password = '3XqDYsF4LBai8rUfXgRwbQDcaWAy1vXRoptAfoxsgssQghlDkL7pfpFYgCD1T9VhJqTiqBTdLfwpACDbMNQHNQ==';
    const host = 'amaco.mongo.cosmos.azure.com:10255';
    const options = 'ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@amaco@';
    const url = `mongodb://${username}:${password}@${host}/${databaseName}?${options}`;

    // Set strictQuery to avoid deprecation warning
    mongoose.set('strictQuery', true);

    // If already connected but to a different DB, disconnect first
    if (mongoose.connection.readyState === 1) {
        const currentDb = mongoose.connection.db?.databaseName;
        if (currentDb && currentDb !== databaseName) {
            console.log(`🔄 Switching from ${currentDb} to ${databaseName}`);
            await mongoose.disconnect();
            cachedDbName = null;
        } else if (currentDb === databaseName) {
            console.log(`⚠️ Already connected to MongoDB: ${currentDb}`);
            return;
        }
    }

    try {
        await mongoose.connect(url);
        cachedDbName = databaseName;
        console.log(`✅ Connected to database: ${databaseName}`);
    } catch (err) {
        console.error('❌ Connection error:', err.message);
    }
}


export default dbConnect;
