import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import dbConnect from "../lib/mongoose";
import jwt from "jsonwebtoken";
import {EncryptBAckend} from '../Functions/Functions'

async function getDataFromCollection(collectionName, tenantId, query = {}) {
  try {
    // Ensure Mongoose is connected
    await dbConnect();

    // Validate collection name
    if (!collectionName || typeof collectionName !== "string") {
      throw new Error("Invalid collection name provided.");
    }

    const decodeURI = jwt.verify(tenantId,'THESTARTUPWAY')

    // Validate tenantId
    if (!tenantId) {
      throw new Error("tenantId is required for querying.");
    }

    // Dynamically get the collection and add s since mongodb is very smart
    const collection = mongoose.connection.db.collection(`${collectionName}s`);

    // Ensure query is an object and append tenantId filtering
    if (typeof query !== "object") {
      throw new Error("Query must be an object.");
    }

   

    // Execute query

    const data = await collection
      .find({ tenantId: new ObjectId(decodeURI.id) })
      .toArray();

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

export default getDataFromCollection;
