"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import { logout as logoutAction } from "../../../lib/User";
import { logout as serverLogout } from "@/lib/api";
import { SuccessToast, ErrorMessage } from "../../../Functions/Mics";
import { logoutOneSignal } from "@/app/Components/OneSignalProvider";

import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";

export default function Logout({ userData }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    try {
      setIsLoggingOut(true);

      SuccessToast("Signing out...");

      await logoutOneSignal();
      await serverLogout().catch(() => {}); // end the server session too
      await dispatch(logoutAction());

      SuccessToast("You have been logged out successfully.");

      router.push("/");
    } catch (e) {
      ErrorMessage("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const companySlug = userData?.business?.companyName
    ?.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const accountUrl = `/${companySlug}/account/${userData?.business?._id}`;

  return (
    <Button
      onClick={logout}
      disabled={isLoggingOut}
      variant="destructive"
      className="w-full justify-start gap-2 text-sm"
    >
      {isLoggingOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}

      <span>
        {isLoggingOut ? "Logging out..." : "Logout"}
      </span>
    </Button>
  );
}