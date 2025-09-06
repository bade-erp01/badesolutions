import { MongoClient } from "mongodb";

 // Load environment variables from .env file

const uri = process.env.MONGODB_URI;

const options = {
  dbName: "test",
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Reduced timeout for faster failure detection
  maxPoolSize: 20, // Increased pool size for better concurrency
  tls: true, // Explicitly enabling TLS since Cosmos DB uses SSL
};

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

let cached = global._mongoClient;
if (!cached) {
  cached = global._mongoClient = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = new MongoClient(uri, options).connect();
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;

// Function to get the database instance
// export async function getDb() {
//   const client = await dbConnect();
//   return client.db(); // Return the database instance
// }
