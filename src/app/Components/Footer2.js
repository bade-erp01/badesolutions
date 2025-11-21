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
          A recent security patch update has been successfully completed.  
          We appreciate your understanding, as these updates are essential for protecting your information.
        </span>
      </Marquee>
    </footer>
  );
}
