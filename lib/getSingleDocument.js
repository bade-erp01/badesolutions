import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import dbConnect from "../lib/mongoose";
import jwt from "jsonwebtoken";
import {EncryptBAckend} from '../Functions/Functions'

async function getDocumentById(collectionName, tenantId, documentId) {
  try {
    // Ensure Mongoose is connected
    await dbConnect();

    // Validate collection name
    if (!collectionName || typeof collectionName !== "string") {
      throw new Error("Invalid collection name provided.");
    }

    // Validate tenantId
    if (!tenantId) {
      throw new Error("tenantId is required for querying.");
    }

    // Validate documentId
    if (!documentId) {
      throw new Error("documentId is required for querying.");
    }

    // Decode tenantId from JWT
    const decodedTenant = jwt.verify(tenantId, "THESTARTUPWAY");
    const decodedDoc = jwt.verify(documentId, "THESTARTUPWAY");
    const decodedCollection = jwt.verify(collectionName, "THESTARTUPWAY");
    const MainObjectId = jwt.verify(decodedDoc.id, "THESTARTUPWAY")
    
    // Dynamically get the collection
    const collection = mongoose.connection.db.collection(`${decodedCollection.id}s`);
    
    // Execute query using findOne for better efficiency
    const document = await collection.findOne({
        _id: new ObjectId(MainObjectId.id),
        tenantId: new ObjectId(decodedTenant.id),
    });

    return  EncryptBAckend(document) || null; // Return null if no document is found
  } catch (error) {
    console.error("Error fetching document:", error);
    return  EncryptBAckend(null);
  }
}

export default getDocumentById;
