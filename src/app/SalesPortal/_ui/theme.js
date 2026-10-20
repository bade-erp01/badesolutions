"use client";

// Sales Portal light / dark mode. The rep picks Light, Dark or "Phone setting" in the menu;
// the choice is kept on the phone (localStorage) and applied as html.sp-dark (the dark
// palette in globals.css) plus html.dark, so shared ERP components on these screens
// (notification bell, location and push prompts) follow along. THEME_BOOT (themeBoot.js)
// runs before the first paint (SalesPortal/layout.js) so a dark-mode phone never flashes white.

import { useCallback, useEffect, useState } from "react";
import { THEME_KEY } from "./themeBoot";

const CHANGED = "bade:sales-theme-changed";
const BAR = { light: "#ffffff", dark: "#151b23" }; // browser bar = header colour
let unsaved = null; // the choice for this visit when the phone blocks storage

const read = () => {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return unsaved || "system";
  }
};
const phoneIsDark = () => typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-color-scheme: dark)").matches);
const resolve = (choice) => (choice === "dark" || (choice === "system" && phoneIsDark()) ? "dark" : "light");

function apply(choice) {
  const dark = resolve(choice) === "dark";
  const html = document.documentElement;
  html.classList.toggle("sp-dark", dark);
  html.classList.toggle("dark", dark);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", dark ? BAR.dark : BAR.light));
}

/** Keeps the page in the chosen mode (and follows the phone when set to "Phone setting"). */
export function SalesTheme() {
  useEffect(() => {
    const sync = () => apply(read());
    sync();
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    mq?.addEventListener?.("change", sync);
    window.addEventListener(CHANGED, sync);
    window.addEventListener("storage", sync);
    return () => {
      mq?.removeEventListener?.("change", sync);
      window.removeEventListener(CHANGED, sync);
      window.removeEventListener("storage", sync);
      // leaving the Sales Portal for the ERP: its own theme provider takes over
      document.documentElement.classList.remove("sp-dark", "dark");
    };
  }, []);
  return null;
}

/** [choice ("light" | "dark" | "system"), setChoice, resolved ("light" | "dark")] */
export function useSalesTheme() {
  const [choice, setChoiceState] = useState("system");
  const [resolved, setResolved] = useState("light");

  useEffect(() => {
    const sync = () => {
      const c = read();
      setChoiceState(c);
      setResolved(resolve(c));
    };
    sync();
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    mq?.addEventListener?.("change", sync);
    window.addEventListener(CHANGED, sync);
    return () => {
      mq?.removeEventListener?.("change", sync);
      window.removeEventListener(CHANGED, sync);
    };
  }, []);

  const setChoice = useCallback((c) => {
    try {
      if (c === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, c);
    } catch {
      unsaved = c; // storage unavailable: still switch for this visit
    }
    apply(c);
    setChoiceState(c);
    setResolved(resolve(c));
    window.dispatchEvent(new Event(CHANGED));
  }, []);

  return [choice, setChoice, resolved];
}
