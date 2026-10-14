"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ErrorMessage } from "../../../Functions/Mics";

export default function PrivacyIdleOverlay({
  idleTimeMs = 60_000, // 1 minute
  onLock,
  userData,
  SessionId,
  children,
  requirePin = false,
}) {
  const router = useRouter();

  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState("");
  const timerRef = useRef(null);

  /**
   * Session Validation
   */
  useEffect(() => {
    if (!userData?.user || !SessionId) return;

    const userSession = userData.user.SessionId;

    if (userSession !== SessionId) {
      ErrorMessage("Your account has been logged in elsewhere.");

      setTimeout(() => {
        router.replace("/Login");
      }, 500);
    }
  }, [userData?.user?.SessionId, SessionId, router]);

  /**
   * Reset idle timer
   */
  const resetTimer = () => {
    if (locked) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setLocked(true);
      onLock?.();
    }, idleTimeMs);
  };

  /**
   * Activity listeners
   */
  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    const reset = () => resetTimer();

    events.forEach((event) => window.addEventListener(event, reset));

    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, reset));

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [locked, idleTimeMs]);

  /**
   * Unlock
   */
  const unlock = () => {
    if (requirePin) {
      const storedPin = userData?.user?.pin;

      if (!storedPin) {
        ErrorMessage("PIN not configured.");
        return;
      }

      if (pin !== String(storedPin)) {
        ErrorMessage("Invalid PIN.");
        setPin("");
        return;
      }
    }

    setPin("");
    setLocked(false);
    resetTimer();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      unlock();
    }
  };

  // Get logo or fallback initials
  const logoUrl = userData?.business?.companyLogo;
  const businessName = userData?.business?.name || "Company";

  return (
    <>
      {children}

      <AnimatePresence>
        {locked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-2xl"
          >
            <Card className="w-[95%] max-w-md shadow-2xl border border-white/10 bg-gray-900/95 backdrop-blur-3xl">
              <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center">
                {/* Avatar */}
                <Avatar className="mb-6 h-20 w-20 border-2 border-white/20">
                  <AvatarImage
                    src={logoUrl}
                    alt={businessName}
                    className="object-contain"
                  />
                  <AvatarFallback className="bg-white/10 text-3xl font-semibold text-white">
                    {businessName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  Privacy Mode
                </h1>

                <p className="mt-3 text-base sm:text-lg text-white/80">
                  Your session has been locked due to inactivity.
                </p>

                <p className="mt-1 text-sm text-white/60">
                  Unlock to continue working.
                </p>

                {requirePin && (
                  <div className="mt-8 w-full">
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter your PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center text-lg tracking-widest"
                    />
                  </div>
                )}

                <Button
                  onClick={unlock}
                  size="lg"
                  className="mt-6 w-full h-12 text-base font-medium"
                >
                  {requirePin ? "Unlock Session" : "Continue Working"}
                </Button>

                {requirePin && (
                  <p className="mt-4 text-xs text-white/50">
                    Press Enter after entering PIN
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}