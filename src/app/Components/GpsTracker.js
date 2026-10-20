"use client";

import { useEffect, useState, useRef } from "react";
import { MapPin, RefreshCcw, Loader2, ShieldAlert } from "lucide-react";


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

  if (status === "checking" || status === "unavailable" || status === "denied") {
    return (
      <>
        <div className="pointer-events-none select-none opacity-40 blur-[2px]" aria-hidden="true">
          {children}
        </div>
        <div className="sales-app fixed inset-0 z-[99999] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 text-center text-[#111827] shadow-2xl">
            {status === "checking" ? (
              <>
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#6b7280]" />
                <p className="text-sm text-[#6b7280]">Checking location access…</p>
              </>
            ) : status === "unavailable" ? (
              <>
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fee2e2]">
                  <ShieldAlert className="h-7 w-7 text-[#b91c1c]" />
                </span>
                <h2 className="text-xl font-bold tracking-tight">Location not supported</h2>
                <p className="text-sm text-[#6b7280]">This phone or browser can&apos;t share its location. Use a phone with location services to work in the Sales Portal.</p>
              </>
            ) : (
              <>
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fef3c7]">
                  <MapPin className="h-7 w-7 text-[#b45309]" />
                </span>
                <h2 className="text-xl font-bold tracking-tight">Turn on your location</h2>
                <p className="text-sm text-[#6b7280]">
                  The Sales Portal records where you visit customers. Allow location for this site and turn on your phone&apos;s location.
                </p>
                <button
                  type="button"
                  onClick={() => checkLocation(false)}
                  disabled={isRequesting}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#111827] text-[15px] font-semibold text-white disabled:opacity-60"
                >
                  {isRequesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                  {isRequesting ? "Checking…" : "Try again"}
                </button>
                <p className="text-xs text-[#6b7280]">Browser menu → Site settings → Location → Allow</p>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  return children;
}