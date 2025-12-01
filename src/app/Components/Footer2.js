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
        <span className="text-xs md:text-base text-gray-200">
          📢 You can request a customized business email that reflects your brand identity.{" "}
        </span>
        {" "} |  {" "}
        <span className="text-xs md:text-base text-gray-200">
          “Season’s Greetings from all of us @B.A.D.E. Thank you for your support this year. Wishing you continued success and happiness in the year ahead.”{" "}
          {/* <Link
            href="/contact-sales"
            className="text-indigo-400 underline hover:text-indigo-300 ml-2"
          >
            Contact Sales
          </Link> */}
        </span>
      </Marquee>
    </footer>
  );
}
