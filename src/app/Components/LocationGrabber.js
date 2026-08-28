"use client"
import { useEffect } from "react";
import { Encrypt } from "../../../Functions/Functions";

const GeoUpdater = ({ userData, baseUrl }) => {
  useEffect(() => {
    let retryCount = 0;

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            try {
              const res = await fetch(`${baseUrl}/api/update-location`, {
                method: "POST",
                headers: { 
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
                  access: `${Encrypt(userData.user._id)}`,
                  sessionKey: `Bearer ${userData.SessionId}`
                },
                body: JSON.stringify({ latitude, longitude }),
              });

              if (!res.ok) throw new Error("Server responded with error");

              // Reset retry count on success
              retryCount = 0;
            } catch (err) {
              // Exponential backoff retry
              retryCount++;
              const delay = Math.min(60000, 2000 * 2 ** retryCount); // max 1 min
              setTimeout(updateLocation, delay);
            }
          },
          (error) => {
            // console.error("Error getting location:", error);
          }
        );
      }
    };

    // Run immediately on mount
    // updateLocation();

    // Run every 5 minutes after the initial call
    const interval = setInterval(updateLocation, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userData, baseUrl]);

  // No UI rendered
  return null;
};

export default GeoUpdater;
