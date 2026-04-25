import { cookies } from "next/headers";
import { Dencrypt,Encrypt } from "./Functions";
import User from "../models/Users";
import Business from "../models/Business";
import dbConnect from "../lib/mongoose";
import { NextResponse } from "next/server";

const fetchUser = async () => {
  "use server";
  try {
    // Retrieve cookies
    const cookieStore = await cookies();
    const userToken = cookieStore.get("userInfo")?.value;
    const businessToken = cookieStore.get("businessInfo")?.value;
    const StoredSession = cookieStore.get("SessionId")?.value;

    if (!userToken || !businessToken) {
      //redirect to login page
      return { error: "Session expired, please log in again." };
    }

    // Decode JWT Tokens
    let decodedUser, decodedBusiness, decodedSessionId;
    try {
      decodedUser = Dencrypt(userToken);
      decodedBusiness = Dencrypt(businessToken);
      decodedSessionId = Dencrypt(StoredSession);
    } catch (error) {
      return { error: "Invalid session tokens, please log in again." };
    }

    const userReq = await fetch(
      `${process.env.EXPRESS_PRIVATE_URL}/api/user/${userToken}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(decodedBusiness)}`,
          access: `${Encrypt(decodedUser)}`,
          "Cache-Control": "max-age=120", // cache for 2 minutes
        },
      },
    );

    const response = await userReq.json()

    const rawUserInfo = response. employee;
    const rawBusinessInfo = response.business

    if (!userReq.ok) {
      return { error: "User or Business information not found." };
    }

    return {
      user: Dencrypt(rawUserInfo),
      business: Dencrypt(rawBusinessInfo),
      SessionId: decodedSessionId
    };


    // await dbConnect("BadeAdmin"); // Ensure database connection
    // // Fetch user & business details
    // const rawUserInfo = await User.findById(decodedUser)
    // .select("-password -__v -createdAt -updatedAt -opsCode")
    // .populate({
    //   path: "toogledTenants.tenantIds", // drill down into the subdocument field
    //   model: "Business",            // explicitly tell Mongoose which model to use
    //   select: "tenantId companyName _id email"
    // }).lean();

    // if (!rawUserInfo) {
    //   return { error: "User information not found." };
    // }

    // const rawBusinessInfo = await Business.findOne({ tenantId: rawUserInfo.tenantId })
      // .select("-payStackApiKey")
      // .lean();
    // if (!rawUserInfo || !rawBusinessInfo) {
    //   return { error: "User or Business information not found." };
    // }

    // // Convert data to plain objects
    // return {
    //   user: JSON.parse(JSON.stringify(rawUserInfo)),
    //   business: JSON.parse(JSON.stringify(rawBusinessInfo)),
    //   SessionId: decodedSessionId
    // };
  } catch (err) {
    return { error: "An unexpected error occurred, please try again later." };
  }
};

export { fetchUser };
