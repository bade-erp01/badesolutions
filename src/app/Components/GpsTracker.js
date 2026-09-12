"use client";

import { useEffect, useState } from "react";
import { MapPin, RefreshCcw, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LocationGuard({ children }) {
  const [status, setStatus] = useState("checking"); // checking | granted | denied | unavailable
  const [isRequesting, setIsRequesting] = useState(false);

  const checkLocation = () => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }

    setIsRequesting(true);

    navigator.geolocation.getCurrentPosition(
      () => {
        setStatus("granted");
        setIsRequesting(false);
      },
      (error) => {
        setIsRequesting(false);

        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setStatus("denied"); // treat as location off
        } else {
          setStatus("denied");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    checkLocation();

    // Optional: re-check when user comes back to the tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkLocation();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Still checking
  if (status === "checking") {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Checking location access…</p>
      </div>
    );
  }

  // Location not available on this device/browser
  if (status === "unavailable") {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5 bg-background px-6 text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h1 className="text-xl font-semibold">Location Not Supported</h1>
          <p className="text-sm text-muted-foreground">
            Your browser or device does not support location services. This app requires location access to work.
          </p>
        </div>
      </div>
    );
  }

  // Location denied / turned off → BLOCK the app
  if (status === "denied") {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background px-6 text-center">
        <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center">
          <MapPin className="h-10 w-10 text-amber-500" />
        </div>

        <div className="space-y-3 max-w-md">
          <h1 className="text-2xl font-bold tracking-tight">
            Location is Required
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            This application needs access to your device location to function.
            Please turn on location services and allow permission for this site.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button
            onClick={checkLocation}
            disabled={isRequesting}
            className="gap-2 min-w-[160px]"
          >
            {isRequesting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking…
              </>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4" />
                Enable Location
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4 max-w-sm">
          Go to your browser / phone settings → Site settings → Location → Allow
        </p>
      </div>
    );
  }

  // Location granted → show the app
  return children;
}