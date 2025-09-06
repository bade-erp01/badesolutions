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


const options = {
  dbName: "Badecommunity",
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  maxPoolSize: 20,
  tls: true,
  bufferCommands: false,
};

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  mongoose.set('strictQuery', true);
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  console.log('connected to DB');
  return cached.conn;
}


export default dbConnect;
