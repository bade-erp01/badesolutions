import { cookies } from "next/headers";
import User from "../models/Users";
import Business from "../models/Business";
import dbConnect from "../lib/mongoose";
import { Dencrypt } from "./Functions";
import {redirect} from "next/navigation"

const fetchUser = async () => {
  "use server";
  try {
    // Retrieve cookies
    const cookieStore = await cookies();
    const userToken = cookieStore.get("salesPerson")?.value;
    const StoredSession = cookieStore.get("SessionId")?.value;

    if (!userToken || !StoredSession) {
      // Redirect to login page
      return { error: "Session expired, please log in again." };
    }

    // Decode JWT Tokens
    let decodedUser, decodedSessionId;
    try {
      decodedUser = Dencrypt(userToken);
      decodedSessionId = StoredSession;
    } catch (error) {
       return { error: "Invalid session tokens, please log in again." };
    }

    await dbConnect("BadeAdmin");

    // Fetch user & business details
    decodedUser = Dencrypt(userToken);
    const rawUserInfo = await User.findById(decodedUser)
      .select("-password -__v -createdAt -updatedAt -opsCode")
      .lean();

    if (!rawUserInfo) {
      return { error: "User information not found." };
    }

    const rawBusinessInfo = await Business.findOne({ tenantId: rawUserInfo.tenantId })
      .select("-payStackApiKey")
      .lean();

    if (!rawUserInfo || !rawBusinessInfo) {
      return { error: "User information not found." };
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
