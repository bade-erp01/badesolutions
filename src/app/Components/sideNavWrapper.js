"use client"

import { useState, useRef, useEffect } from "react"
import { Menu, X } from "lucide-react"

export default function SideNavWrapper({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  const sidebarRef = useRef(null)

  // ---------------------------------------------------
  // CLOSE WHEN CLICKING OUTSIDE
  // ---------------------------------------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      )
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [isOpen])

  // ---------------------------------------------------
  // CLOSE ON ESC KEY
  // ---------------------------------------------------
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener(
        "keydown",
        handleEscape
      )
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      )
    }
  }, [isOpen])

  return (
    <>
      {/* FLOATING MENU BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="
            lg:hidden
            fixed
            bottom-9
            right-6
            z-50
            h-14
            w-14
            rounded-sm
            bg-[#1e1e20]
            text-white
            shadow-2xl
            border
            border-white/10
            flex
            items-center
            justify-center
            hover:scale-105
            active:scale-95
            transition-all
            duration-300
          "
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* BACKDROP */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden z-40 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* MOBILE SIDEBAR */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-72 bg-[#1e1e20]/95 backdrop-blur-xl text-white px-4 py-6 transition-transform duration-300 z-50 lg:hidden shadow-2xl ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => setIsOpen(false)}
          className="
            absolute
            top-4
            right-4
            h-10
            w-10
            rounded-full
            bg-white/5
            border
            border-white/10
            flex
            items-center
            justify-center
            text-white
            hover:bg-white/10
            transition-colors
          "
        >
          <X className="h-5 w-5" />
        </button>

        {/* SIDEBAR CONTENT */}
        <div
          className="h-full overflow-y-auto pr-1"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor:
              "#453d46ff transparent",
          }}
        >
          {children}
        </div>
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside
        className="
          hidden
          lg:block
          w-72
          bg-[#1e1e20]/70
          backdrop-blur-md
          text-white
          px-4
          py-6
          transition-all
          duration-300
        "
        style={{
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor:
            "#453d46ff transparent",
        }}
      >
        {children}
      </aside>
    </>
  )
}