"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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

    events.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );

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
        return;
      }
    }

    setPin("");
    setLocked(false);
    resetTimer();
  };

  return (
    <>
      {children}

      <AnimatePresence>
        {locked && (
          <motion.div
            initial={{
              y: "-100%",
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: "-100%",
              opacity: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
            }}
            className="
              fixed inset-0
              z-[99999]
              flex items-center justify-center
              backdrop-blur-2xl
              bg-black/20
            "
          >
            <div
              className="
                bg-white/15
                backdrop-blur-3xl
                border border-white/20
                rounded-3xl
                p-8
                w-[95%]
                max-w-md
                shadow-2xl
              "
            >
              <div className="flex flex-col items-center">
                <div
                  className="
                    w-20 h-20
                    rounded-full
                    bg-white/20
                    flex items-center justify-center
                    text-4xl
                    mb-4
                  "
                >
                  🔒
                </div>

                <h1 className="text-2xl font-bold text-white">
                  Privacy Mode
                </h1>

                <p className="text-white/80 text-center mt-2">
                  Your session has been locked due to inactivity.
                </p>

                <p className="text-white/60 text-xs text-center mt-1">
                  Unlock to continue working.
                </p>

                {requirePin && (
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="
                      mt-5
                      w-full
                      px-4 py-3
                      rounded-lg
                      bg-white/20
                      text-white
                      placeholder:text-white/50
                      border border-white/20
                      outline-none
                    "
                  />
                )}

                <button
                  onClick={unlock}
                  className="
                    mt-5
                    w-full
                    py-3
                    rounded-lg
                    bg-white
                    text-black
                    font-medium
                    hover:bg-gray-100
                    transition-all
                  "
                >
                  {requirePin
                    ? "Unlock Session"
                    : "Continue Working"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}