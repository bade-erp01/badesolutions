import mongoose from "mongoose";
import { Encrypt } from "../Functions/Functions";

let cachedDbName = null;

/**
 * Connects to MongoDB using Mongoose.
 * Disconnects and reconnects if the target database name changes.
 * @param {string} databaseName - The name of the database to connect to.
 **/

async function dbConnect(databaseName = Encrypt("BadeAdmin")) {
  "use server";
  try {

    if (!databaseName) {
      return;
    }

    const username = "amaco";
    const password =
      "3XqDYsF4LBai8rUfXgRwbQDcaWAy1vXRoptAfoxsgssQghlDkL7pfpFYgCD1T9VhJqTiqBTdLfwpACDbMNQHNQ==";
    const host = "amaco.mongo.cosmos.azure.com:10255";
    const options =
      "ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@amaco@";
    const url = `mongodb://${username}:${password}@${host}/${databaseName}?${options}`;

    // Set strictQuery to avoid deprecation warning
    mongoose.set("strictQuery", true);

    // If already connected but to a different DB, disconnect first
    if (mongoose.connection.readyState === 1) {
      const currentDb = mongoose.connection.db?.databaseName;
      if (currentDb && currentDb !== databaseName) {
        await mongoose.disconnect();
        cachedDbName = null;
      } else if (currentDb === databaseName) {
        return;
      }
    }

    await mongoose.connect(url);
    cachedDbName = databaseName;
  } catch (err) {

  }
}

export default dbConnect;
