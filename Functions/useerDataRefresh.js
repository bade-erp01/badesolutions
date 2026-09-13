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
    const RustyRoof = cookieStore.get("rustyRoof")?.value;

    if (!userToken || !businessToken || Dencrypt(RustyRoof) === null ) {
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
    
    await dbConnect("BadeAdmin");
    // await dbConnect(Dencrypt(RustyRoof));
    
    // Fetch user & business details
    const rawUserInfo = await User.findById(decodedUser)
    .select("-password -__v -createdAt -updatedAt -opsCode")
    .populate({
        path: "toogledTenants.tenantIds",
        select: "companyName tenantId isActive",
      }).lean();

    if (!rawUserInfo) {
      return { error: "User information not found." };
    }

    const rawBusinessInfo = await Business.findOne({ tenantId: rawUserInfo.tenantId })
      .select("-payStackApiKey -priceList")
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
