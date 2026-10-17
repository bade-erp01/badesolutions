"use client";

// Back from a Paystack checkout for a BADE payment (renewal, licences, module): the backend
// confirms it and opens the app with ?payment=<result> (routes/publicRouter.js
// paystackReturn). Shows the result once, then removes it from the address bar.
// A successful payment also arrives as an in-app notification.

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const RESULTS = {
  applied: ["success", "Payment received", "Thank you! Your account has been updated."],
  "already-applied": ["success", "Payment received", "This payment has already been applied to your account."],
  pending: ["info", "Payment not completed", "The payment wasn't finished. You can try again at any time."],
  failed: ["error", "Payment failed", "Your payment didn't go through. No changes were made."],
  rejected: ["error", "Payment couldn't be applied", "We received a payment we couldn't match to your account. Please contact support."],
  unconfirmed: ["warning", "Confirming your payment", "We couldn't confirm it with Paystack yet. If you were charged, it will be applied automatically shortly."],
};

export default function PaymentReturnNotice() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const result = params.get("payment");

  useEffect(() => {
    if (!result) return;
    const [kind, title, description] = RESULTS[result] || RESULTS.unconfirmed;
    toast[kind](title, { description, duration: 10000 });
    const rest = new URLSearchParams(params);
    rest.delete("payment");
    router.replace(rest.size ? `${pathname}?${rest}` : pathname, { scroll: false });
  }, [result, params, pathname, router]);

  return null;
}
