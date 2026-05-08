import { cookies } from "next/headers";
import { Dencrypt,Encrypt } from "./Functions";
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

    const request  = await fetch(`${process.env.EXPRESS_PRIVATE_URL}/api/userData/${userToken}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
         access: `${Encrypt(decodedUser)}`, 
      },
      next: {
        revalidate: 60,
      },
    });

    const response = await request.json();
    const userData = Dencrypt(response.data)

    const rawUserInfo = userData.user;
    const rawBusinessInfo = userData.Biz;

    if (!rawUserInfo) {
      return { error: "User information not found." };
    }

    if (!rawUserInfo || !rawBusinessInfo) {
      return { error: "User or Business information not found." };
    }

    return {
      user: rawUserInfo,
      business: rawBusinessInfo,
      SessionId: decodedSessionId
    };
    
  } catch (err) {
    return { error: "An unexpected error occurred, please try again later." };
  }
};

export { fetchUser };
