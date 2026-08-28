"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black">
      {/* Soft radial glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex flex-col items-center"
      >
        {/* Soft bloom behind the logo */}
        <div className="absolute inset-0 rounded-full bg-white/10 blur-3xl" />

        {/* Main Logo Text */}
        <motion.h1
          animate={{
            textShadow: [
              "0 0 10px rgba(255,255,255,0.5)",
              "0 0 25px rgba(255,255,255,0.8)",
              "0 0 50px rgba(255,255,255,1)",
              "0 0 25px rgba(255,255,255,0.8)",
              "0 0 10px rgba(255,255,255,0.5)",
            ],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative text-2xl font-black uppercase tracking-[0.4em] text-white md:text-3xl"
        >
          B.A.D.E
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-center text-xs uppercase tracking-[0.3em] text-zinc-500 md:text-sm"
        >
          Business Automated Dynamic Enterprise
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "220px" }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="mt-8 h-0.5 rounded-full bg-white/70"
        />
      </motion.div>
    </div>
  );
}