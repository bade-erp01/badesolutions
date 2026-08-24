"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Squares2X2Icon } from "@heroicons/react/24/outline";
import { MessageCircle } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useUser } from "@/components/UserProvider";

export default function Notch({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const {user} = useUser()
  // Driver.js Tour
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
          title: `Pop Menu`,
          description: "Access Reports and other features from our pop pane",
          side: "right",
        },
      },
    ]);

    driverObj.drive();
  };

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("sidePan");
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const openWhatsApp = () => {
    window.open(`https://wa.me/+2347044889034?text=Hello Bade support, My name is ${user.user.firstName || "User"} from ${user.business.companyName || "unknown business"}, please i need help`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 sidePan">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="
              relative w-14 h-14 rounded-full 
              text-zinc-900 dark:text-white 
              hover:bg-zinc-100 dark:hover:bg-zinc-800 
              shadow-2xl 
              border-2 border-black
              bg-white dark:bg-zinc-950 
              backdrop-blur-xl bg-opacity-95 dark:bg-opacity-80
              before:absolute before:inset-0 before:rounded-full before:p-[1.5px]
              before:bg-gradient-to-br before:from-orange-300 before:via-yellow-300 before:to-emerald-400
              before:content-[''] before:-z-10
            "
          >
            <Squares2X2Icon className="w-12 h-12 text-black font-bold" />
          </Button>
        </DialogTrigger>

        <DialogContent className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex flex-col gap-4">
            {/* Children Content */}
            <div className="flex flex-col gap-4">{children}</div>

            {/* Contact Support via WhatsApp */}
            <Button
              onClick={openWhatsApp}
              className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="h-5 w-5" />
              Contact Support on WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}