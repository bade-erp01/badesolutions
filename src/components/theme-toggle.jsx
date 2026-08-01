'use client';

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
    >
      <Sun className="h-5 w-5 transition-all dark:scale-0" />
      <Moon className="absolute top-3 left-3 h-5 w-5 scale-0 transition-all dark:scale-100" />
    </button>
  );
}