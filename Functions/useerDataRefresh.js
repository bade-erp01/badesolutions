
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "../models/Users";
import Business from "../models/Business";
import dbConnect from "../lib/mongoose"; // Ensure DB connection
import { NextResponse } from 'next/server';


const SECRET_KEY = "THESTARTUPWAY";

const fetchUser = async () => {
  "use server";
  try {
    await dbConnect(); // Ensure database connection
    // Retrieve cookies
    const cookieStore = await cookies();
    const userToken = cookieStore.get("userInfo")?.value;
    const businessToken = cookieStore.get("businessInfo")?.value;

    if (!userToken || !businessToken) {
      //redirect to login page
      return { error: "Session expired, please log in again." };
    }
    
    // Decode JWT Tokens
    let decodedUser, decodedBusiness;
    try {
      decodedUser = jwt.verify(userToken, SECRET_KEY);
      decodedBusiness = jwt.verify(businessToken, SECRET_KEY);
      
    } catch (error) {
      return { error: "Invalid session tokens, please log in again." };
    }

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
    };
  } catch (err) {
    console.error( err.message);
    return { error: "An unexpected error occurred, please try again later." };
  }
};

export { fetchUser };
