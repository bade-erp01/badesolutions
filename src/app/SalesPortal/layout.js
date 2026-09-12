import React from "react";
import GeoUpdater from "@/app/Components/LocationGrabber";
import { fetchUser } from "../../../Functions/whoIsSalesPerson";
import {Dencrypt} from "../../../Functions/Functions";

// Prevent static prerendering (session data is only available at request time)
export const dynamic = "force-dynamic";

export default async function layout({ children }) {
  const userData = await fetchUser();

  const hasValidSession = userData?.user?.SessionId === Dencrypt(userData.SessionId) && userData?.business;

  return (
    <>
      {hasValidSession && (
        <GeoUpdater
          userData={userData}
          baseUrl={process.env.EXPRESS_PRIVATE_URL}
        />
      )}
      {children}
    </>
  );
}