import React from "react";
import GeoUpdater from "@/app/Components/LocationGrabber";
import { fetchUser } from "../../../Functions/whoIsSalesPerson";
import LocationGuard from "@/app/Components/GpsTracker";

// Prevent static prerendering (session data is only available at request time)
export const dynamic = "force-dynamic";

export default async function layout({ children }) {
  const userData = await fetchUser();

 const hasValidSession = Boolean(
    userData?.user &&
    userData?.business
  );

  return (
    <LocationGuard>
      {hasValidSession && (
        <GeoUpdater
          userData={userData}
          baseUrl={process.env.EXPRESS_PRIVATE_URL}
        />
      )}
      {children}
    </LocationGuard>
  );
}