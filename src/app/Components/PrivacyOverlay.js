"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PrivacyIdleOverlay
 *
 * Purpose:
 * Locks the screen with a full-page privacy overlay after a period of user inactivity.
 * The overlay drops from the top and covers the entire viewport.
 */
export default function PrivacyIdleOverlay({
  idleTimeMs = 60_000, // default 1 minute
  onLock,
  children,
}) {
  const [locked, setLocked] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (locked) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setLocked(true);
      onLock?.();
    }, idleTimeMs);
  };

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [locked, idleTimeMs]);

  const unlock = () => {
    setLocked(false);
    resetTimer();
  };

  return (
    <>
      {children}

      <AnimatePresence>
        {locked && (
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
          >
            <div className="text-center text-white space-y-4">
              <h1 className="text-2xl font-bold tracking-widest uppercase">
                Privacy Mode Activated
              </h1>
              <p className="text-sm text-gray-400">
                We locked your session due to inactivity
              </p>

              <button
                onClick={unlock}
                className="mt-4 px-6 py-2 bg-white text-black rounded-md font-medium hover:bg-gray-200 transition"
              >
                Tap to Unlock
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
