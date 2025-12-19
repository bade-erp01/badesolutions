import React from "react";
import Marquee from "react-fast-marquee";
import Link from "next/link"

export default function Footer2() {
  return (
    <footer className="w-full bg-gray-900 text-white p-1">
      <Marquee
        gradient={false}
        speed={40}
        className="px-4"
      >
        {/* <span className="text-xs md:text-base text-gray-200">
          📢 You can request a customized business email that reflects your brand identity.{" "}
        </span> */}
        {/* <Link
            href="/contact-sales"
            className="text-indigo-400 underline hover:text-indigo-300 ml-2"
          >
            Contact Sales
          </Link> */}
        {/* {" "} |  {" "} */}
        <span className="text-xs md:text-base text-gray-200">
          🎄 Season’s Greetings from B.A.D.E.  
          Thank you for trusting our ERP solutions to power your success this year. We look forward to helping you streamline, grow, and achieve even more in the year ahead. Wishing you joy, prosperity, and continued success!.{" "}
        </span>
      </Marquee>
    </footer>
  );
}
