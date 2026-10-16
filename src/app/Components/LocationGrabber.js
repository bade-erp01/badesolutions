"use client";

import { useEffect, useRef } from "react";
import { Encrypt } from "../../../Functions/Functions";
import Swal from "sweetalert2";
import { escapeHtml } from "@/lib/security/escapeHtml";

const GeoUpdater = ({ userData, baseUrl }) => {
  const retryCount = useRef(0);
  const retryTimeout = useRef(null);
  const intervalRef = useRef(null);
  const hasPrompted = useRef(false);

  useEffect(() => {
    if (!userData || !baseUrl) return;
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    let isMounted = true;

    const clearTimers = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
        retryTimeout.current = null;
      }
    };

    const promptEnableLocation = (message) => {
      if (hasPrompted.current || !isMounted) return;
      hasPrompted.current = true;

      Swal.fire({
        icon: "warning",
        title: "Location Required",
        html: `
          <p style="margin-bottom: 10px;">${escapeHtml(message)}</p>
          <p style="font-size: 13px; color: #666;">
            Please turn on location services and allow access for this site.
          </p>
        `,
        confirmButtonText: "Try Again",
        showCancelButton: true,
        cancelButtonText: "Not now",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          hasPrompted.current = false;
          getAndSendLocation(); // try again
        }
      });
    };

    const sendToServer = async (latitude, longitude) => {
      try {
        const res = await fetch(`${baseUrl}/api/update-location`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
            access: `${Encrypt(userData.user._id)}`,
            sessionKey: `Bearer ${userData.SessionId}`,
          },
          body: JSON.stringify({ latitude, longitude }),
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        // Success
        retryCount.current = 0;
        hasPrompted.current = false;
      } catch (err) {

        // Retry with exponential backoff
        retryCount.current += 1;
        const delay = Math.min(60000, 2000 * 2 ** retryCount.current);

        retryTimeout.current = setTimeout(() => {
          if (isMounted) getAndSendLocation();
        }, delay);
      }
    };

    const getAndSendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMounted) return;

          const { latitude, longitude } = position.coords;

          sendToServer(latitude, longitude);
        },
        (error) => {
          if (!isMounted) return;

          console.error("Geolocation error:", error);

          switch (error.code) {
            case error.PERMISSION_DENIED:
              clearTimers();
              promptEnableLocation(
                "Location permission is denied. Please allow location access."
              );
              break;

            case error.POSITION_UNAVAILABLE:
              promptEnableLocation(
                "Unable to detect your location. Please turn on location services."
              );
              break;

            case error.TIMEOUT:
              // Just retry on timeout
              retryCount.current += 1;
              const delay = Math.min(30000, 3000 * retryCount.current);
              retryTimeout.current = setTimeout(() => {
                if (isMounted) getAndSendLocation();
              }, delay);
              break;

            default:
              console.warn("Unknown geolocation error");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 30000, // accept a location up to 30s old
        }
      );
    };

    const startTracking = () => {
      clearTimers();

      // Run immediately
      getAndSendLocation();

      // Then every 2 minutes
      intervalRef.current = setInterval(() => {
        getAndSendLocation();
      }, 2 * 60 * 1000);
    };

    // Start
    startTracking();

    return () => {
      isMounted = false;
      clearTimers();
    };
  }, [userData, baseUrl]);

  return null;
};

export default GeoUpdater;