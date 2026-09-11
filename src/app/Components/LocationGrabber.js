"use client";

import { useEffect, useRef } from "react";
import { Encrypt } from "../../../Functions/Functions";
import Swal from "sweetalert2";

const GeoUpdater = ({ userData, baseUrl }) => {
  const retryCount = useRef(0);
  const retryTimeout = useRef(null);
  const intervalRef = useRef(null);
  const hasPrompted = useRef(false); // prevent spamming the prompt

  useEffect(() => {
    if (!userData || !baseUrl) return;

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

    const promptEnableLocation = () => {
      if (hasPrompted.current || !isMounted) return;
      hasPrompted.current = true;

      Swal.fire({
        icon: "warning",
        title: "Location is turned off",
        html: `
          <p style="margin-bottom: 12px;">
            We need access to your location to update your live position.
          </p>
          <p style="font-size: 14px; color: #666;">
            Please enable location services in your browser or device settings, then click the button below.
          </p>
        `,
        confirmButtonText: "Enable Location",
        showCancelButton: true,
        cancelButtonText: "Not now",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          // Reset so we can prompt again later if still denied
          hasPrompted.current = false;
          // This will trigger the browser permission popup again
          requestLocationPermission();
        }
      });
    };

    const updateLocation = () => {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!isMounted) return;

          const { latitude, longitude } = position.coords;

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

            if (!res.ok) throw new Error("Server responded with error");

            retryCount.current = 0;
            hasPrompted.current = false; // reset prompt flag on success
          } catch (err) {
            retryCount.current += 1;
            const delay = Math.min(60000, 2000 * 2 ** retryCount.current);

            retryTimeout.current = setTimeout(() => {
              if (isMounted) updateLocation();
            }, delay);
          }
        },
        (error) => {
          if (!isMounted) return;

          if (
            error.code === error.PERMISSION_DENIED ||
            error.code === error.POSITION_UNAVAILABLE
          ) {
            console.warn("Location is off or permission denied");
            clearTimers();
            promptEnableLocation();
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    };

    const startTracking = () => {
      clearTimers();
      updateLocation();
      intervalRef.current = setInterval(updateLocation, 2 * 60 * 1000);
    };

    const stopTracking = () => {
      clearTimers();
    };

    const requestLocationPermission = () => {
      if (!navigator.geolocation) {
        Swal.fire({
          icon: "error",
          title: "Geolocation not supported",
          text: "Your browser does not support location services.",
        });
        return;
      }

      // This call will show the browser permission popup
      navigator.geolocation.getCurrentPosition(
        () => {
          if (isMounted) startTracking();
        },
        (error) => {
          if (
            error.code === error.PERMISSION_DENIED ||
            error.code === error.POSITION_UNAVAILABLE
          ) {
            promptEnableLocation();
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    };

    const checkPermissionAndStart = async () => {
      // Fallback for browsers without Permissions API
      if (!navigator.permissions) {
        requestLocationPermission();
        return;
      }

      try {
        const result = await navigator.permissions.query({
          name: "geolocation",
        });

        if (result.state === "granted") {
          startTracking();
        } else if (result.state === "prompt") {
          requestLocationPermission();
        } else {
          // denied
          promptEnableLocation();
        }

        // Listen for changes (user turns location on/off later)
        result.onchange = () => {
          if (!isMounted) return;

          if (result.state === "granted") {
            hasPrompted.current = false;
            startTracking();
          } else {
            stopTracking();
            promptEnableLocation();
          }
        };
      } catch (err) {
        requestLocationPermission();
      }
    };

    checkPermissionAndStart();

    return () => {
      isMounted = false;
      clearTimers();
    };
  }, [userData, baseUrl]);

  return null;
};

export default GeoUpdater;