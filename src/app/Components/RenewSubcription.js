import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import RenewButton from "@/app/Components/Renew"

const RenewSubscription = ({ business }) => {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-300 px-4 overflow-hidden">
      
      {/* Decorative Gradient Shape */}
      <div
        style={{
          clipPath:
            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
        }}
        className="absolute left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
        aria-hidden="true"
      />

      {/* Subscription Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center animate-fade-in relative z-10">
        <div className="mb-6">
          <Image
            src={business.companyLogo || `/assets/bade.png`}
            alt="Logo"
            width={80}
            height={80}
            className="mx-auto"
          />
        </div>
        <h2 className="text-sm font-bold text-gray-800 mb-3">
          Dear {business.companyName?.toLowerCase() || "Valued user"}, Your Subscription Has Ended
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          To continue unlocking the full power of Business Automated Dynamic Enterprise (B.A.D.E), renew your subscription today.
        </p>
        <div className="text-left mb-6 space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <FaCheckCircle className="text-blue-500" />
            <span>Access advanced automation workflows</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <FaCheckCircle className="text-blue-500" />
            <span>Real-time business intelligence dashboards</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <FaCheckCircle className="text-blue-500" />
            <span>Priority support & feature updates</span>
          </div>
        </div>
        <RenewButton />
        <p className="mt-5 text-sm text-gray-500">
          Questions?{" "}
          <Link href="/Contact" className="text-blue-600 hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RenewSubscription;
