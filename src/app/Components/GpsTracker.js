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
  const failCount = useRef(0);

  const checkLocation = (silent = false) => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }

    if (!silent) setIsRequesting(true);

    navigator.geolocation.getCurrentPosition(
      () => {
        failCount.current = 0;
        setStatus("granted");
        setIsRequesting(false);
      },
      (error) => {
        setIsRequesting(false);

        // Only hard-block on real permission denial
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied");
          return;
        }

        // Timeout / unavailable → don't immediately block
        failCount.current += 1;

        // Only block after several consecutive hard failures
        if (failCount.current >= 3) {
          setStatus("denied");
        }
        // otherwise keep current status (stay granted if already granted)
      },
      {
        enableHighAccuracy: false, // more reliable
        timeout: 20000,
        maximumAge: 60000, // accept a recent cached position
      }
    );
  };

  useEffect(() => {
    checkLocation();

    // Poll every 10s (less aggressive)
    pollRef.current = setInterval(() => {
      checkLocation(true);
    }, 10000);

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

  useEffect(() => {
    document.body.style.overflow = status === "granted" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [status]);

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
              <p className="text-sm text-zinc-400">Checking location access…</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

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
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  if (status === "denied") {
    return (
      <>
        <div className="pointer-events-none select-none opacity-40 blur-[2px]">
          {children}
        </div>
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md">
          <Card className="w-full max-w-md mx-4 border-border/50 bg-zinc-950 text-zinc-100 shadow-2xl">
            <CardHeader className="items-center text-center space-y-4 pb-2">
              <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center">
                <MapPin className="h-10 w-10 text-amber-500" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl sm:text-2xl text-zinc-50">
                  Location Required
                </CardTitle>
                <CardDescription className="text-zinc-400 leading-relaxed">
                  Please allow location access for this site and turn on device
                  location.
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
                Site settings → Location → Allow
              </p>
            </CardFooter>
          </Card>
        </div>
      </>
    );
  }

  return children;
}