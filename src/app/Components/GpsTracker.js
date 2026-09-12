"use client";

import { useEffect, useState, useRef } from "react";
import { MapPin, RefreshCcw, Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LocationGuard({ children }) {
  const [status, setStatus] = useState("checking"); // checking | granted | denied | unavailable
  const [isRequesting, setIsRequesting] = useState(false);
  const pollRef = useRef(null);

  const checkLocation = (silent = false) => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }

    if (!silent) setIsRequesting(true);

    navigator.geolocation.getCurrentPosition(
      () => {
        setStatus("granted");
        setIsRequesting(false);

        // Stop polling once granted
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      },
      () => {
        setIsRequesting(false);
        setStatus((prev) => (prev === "granted" ? "granted" : "denied"));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    // Initial check
    checkLocation();

    // Auto-check every 5 seconds while blocked
    pollRef.current = setInterval(() => {
      checkLocation(true); // silent check (no loading spinner)
    }, 5000);

    // Also re-check when user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkLocation(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Lock body scroll while blocked
  useEffect(() => {
    if (status === "granted") {
      document.body.style.overflow = "";
    } else {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [status]);

  // ─── CHECKING ────────────────────────────────────────────────
  if (status === "checking") {
    return (
      <>
        <div className="pointer-events-none select-none opacity-30 blur-[1px]">
          {children}
        </div>

        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <Card className="w-full max-w-sm mx-4 border-border/50 bg-zinc-950 text-zinc-100 shadow-2xl">
            <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-zinc-400">
                Checking location access…
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // ─── NOT SUPPORTED ───────────────────────────────────────────
  if (status === "unavailable") {
    return (
      <>
        <div className="pointer-events-none select-none opacity-30 blur-[2px]">
          {children}
        </div>

        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md">
          <Card className="w-full max-w-md mx-4 border-border/50 bg-zinc-950 text-zinc-100 shadow-2xl">
            <CardHeader className="items-center text-center space-y-4 pb-2">
              <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <ShieldAlert className="h-8 w-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl text-zinc-50">
                  Location Not Supported
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Your browser or device does not support location services.
                  This application cannot be used without it.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  // ─── LOCATION OFF / DENIED → FULL MODAL BLOCK ────────────────
  if (status === "denied") {
    return (
      <>
        <div className="pointer-events-none select-none opacity-40 blur-[2px]">
          {children}
        </div>

        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md">
          <Card className="w-full max-w-md mx-4 border-border/50 bg-zinc-950 text-zinc-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="items-center text-center space-y-4 pb-2">
              <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center">
                <MapPin className="h-10 w-10 text-amber-500" />
              </div>

              <div className="space-y-2">
                <CardTitle className="text-2xl text-zinc-50">
                  Location Required
                </CardTitle>
                <CardDescription className="text-zinc-400 leading-relaxed">
                  You must turn on your device location and allow access to
                  continue using this application.
                  <br />
                  <span className="text-zinc-500 text-xs mt-1 block">
                    Checking automatically every few seconds…
                  </span>
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              <Button
                size="lg"
                onClick={() => checkLocation(false)}
                disabled={isRequesting}
                className="w-full gap-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
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
            </CardContent>

            <CardFooter className="justify-center pb-6">
              <p className="text-xs text-zinc-500 text-center">
                Phone Settings → Location → Turn On → Allow for this browser
              </p>
            </CardFooter>
          </Card>
        </div>
      </>
    );
  }

  // ─── GRANTED → APP UNLOCKED ──────────────────────────────────
  return children;
}