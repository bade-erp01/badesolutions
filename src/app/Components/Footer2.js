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
           Elevate your brand with a professional business email.
        </span>
        {" "} | {" "}
        <span className="text-xs md:text-base text-gray-200">
           Gain visibility in the BADE ecosystem and attract new opportunities.
        </span>
        {" "} |  {" "}
       <span>Whatsapp Support on +234 704 4889 034</span>
        {" "} |  {" "}
      </Marquee>
    </footer>
  );
}
