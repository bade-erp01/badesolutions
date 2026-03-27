
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "../models/Users";
import Business from "../models/Business";
import dbConnect from "../lib/mongoose";
import { NextResponse } from 'next/server';



const fetchUser = async () => {
  "use server";
  try {
    // Retrieve cookies
    const SECRET_KEY = process.env.TenantToken;
    const cookieStore = await cookies();
    const userToken = cookieStore.get("userInfo")?.value;
    const businessToken = cookieStore.get("businessInfo")?.value;
    const StoredSession = cookieStore.get("SessionId")?.value;
    
    if (!userToken || !businessToken) {
      //redirect to login page
      return { error: "Session expired, please log in again." };
    }
    
    // Decode JWT Tokens
    let decodedUser, decodedBusiness,decodedSessionId;
    try {
      decodedUser = jwt.verify(userToken, SECRET_KEY);
      decodedBusiness = jwt.verify(businessToken, SECRET_KEY);
      decodedSessionId = jwt.verify(StoredSession,SECRET_KEY)
      
    } catch (error) {
      return { error: "Invalid session tokens, please log in again." };
    }
    
    await dbConnect("BadeAdmin"); // Ensure database connection
    // Fetch user & business details
    const rawUserInfo = await User.findById(decodedUser.data)
      .select("-password -__v -createdAt -updatedAt -opsCode")
      .lean();
      
    if (!rawUserInfo) {
      return { error: "User information not found." };
    }

    const rawBusinessInfo = await Business.findOne({ tenantId: rawUserInfo.tenantId })
      .select("-payStackApiKey")
      .lean();
    if (!rawUserInfo || !rawBusinessInfo) {
      return { error: "User or Business information not found." };
    }

    // Convert data to plain objects
    return {
      user: JSON.parse(JSON.stringify(rawUserInfo)),
      business: JSON.parse(JSON.stringify(rawBusinessInfo)),
      SessionId: decodedSessionId
    };
  } catch (err) {
    return { error: "An unexpected error occurred, please try again later." };
  }
};

export { fetchUser };