"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { Squares2X2Icon } from "@heroicons/react/24/solid";
import { MessageCircle } from "lucide-react";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import { useUser } from "@/components/UserProvider";

export default function Notch({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useUser();

  /*
   * ============================================================
   * DRIVER.JS TOUR
   * ============================================================
   */

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,

      animate: true,

      doneBtnText: "Don't show this again",

      allowClose: true,

      overlayClickBehavior: "close",

      onDestroyed: () => {
        localStorage.setItem("sidePan", "true");
      },
    });

    driverObj.setSteps([
      {
        element: ".sidePan",

        popover: {
          title: "Pop Menu",

          description: "Access Reports and other features from our pop pane.",

          side: "right",
        },
      },
    ]);

    driverObj.drive();
  };

  /*
   * ============================================================
   * START TOUR ON FIRST VISIT
   * ============================================================
   */

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("sidePan");

    if (hasSeenTour) {
      return;
    }

    const timer = setTimeout(() => {
      startTour();
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  /*
   * ============================================================
   * WHATSAPP SUPPORT
   * ============================================================
   */

  const openWhatsApp = () => {
    const firstName = user?.user?.firstName || "User";

    const companyName = user?.business?.companyName || "unknown business";

    const message = `Hello Bade support, My name is ${firstName} from ${companyName}, please i need help`;

    const whatsappUrl = `https://wa.me/2347044889034?text=${encodeURIComponent(
      message,
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  /*
   * ============================================================
   * COMPONENT
   * ============================================================
   */

  return (
    <div
      className="
        sidePan

        fixed
        bottom-6
        right-6

        z-50
      "
    >
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* ====================================================
            TRIGGER BUTTON
        ===================================================== */}

        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="
              group relative flex h-14 w-14 shrink-0 items-center
              justify-center
              rounded-2xl
              border
              border-zinc-950
              bg-zinc-950
              p-0
              text-white
              shadow-[0_10px_25px_rgba(0,0,0,0.35),0_4px_10px_rgba(0,0,0,0.2)]
              transition-all
              duration-200
              ease-out
              hover:-translate-y-1
              hover:bg-zinc-900
              hover:shadow-[0_16px_35px_rgba(0,0,0,0.4),0_6px_14px_rgba(0,0,0,0.25)]
              active:translate-y-0
              active:scale-95
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-zinc-950
              focus-visible:ring-offset-2
              dark:border-zinc-200
              dark:bg-zinc-100
              dark:text-zinc-950
              dark:shadow-[0_10px_25px_rgba(0,0,0,0.55),0_4px_10px_rgba(0,0,0,0.35)]
              dark:hover:bg-white
              dark:hover:shadow-[0_16px_35px_rgba(0,0,0,0.65),0_6px_14px_rgba(0,0,0,0.4)]
              dark:focus-visible:ring-zinc-100
            "
          >
            <Squares2X2Icon
              className="
                h-7
                w-7
                transition-transform
                duration-200
                ease-out
                group-hover:scale-110
              "
            />
          </Button>
        </DialogTrigger>

        {/* ====================================================
            DIALOG
        ===================================================== */}

        <DialogContent
          className="
            w-[calc(100%-2rem)]
            max-w-md
            rounded-2xl
            border
            border-zinc-200
            bg-white
            p-6
            shadow-2xl
            dark:border-zinc-800
            dark:bg-zinc-950
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
            "
          >

            <div
              className="
                flex
                flex-col
                gap-4
              "
            >
              {children}
            </div>

            <div
              className="
                border-t
                border-zinc-100

                pt-4

                dark:border-zinc-800
              "
            >
              <Button
                type="button"
                onClick={openWhatsApp}
                className="
                  h-11

                  w-full

                  gap-2

                  rounded-xl

                  bg-green-600

                  font-medium

                  text-white

                  shadow-lg

                  shadow-green-600/20

                  transition-all
                  duration-200

                  hover:bg-green-700

                  hover:shadow-green-600/30

                  active:scale-[0.98]
                "
              >
                <MessageCircle className="h-5 w-5" />
                Contact Support on WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
