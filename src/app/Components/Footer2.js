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
        </span> 
        {" "} |  {" "}
        <span className="text-xs md:text-base text-gray-200">
          📢 Promote your businesses within the BADE ecosystem by giving them visibility to other active users.{" "}
        </span>
        {" "} |  {" "}
       <span>Whatsapp Support on +234 704 4889 034</span>
        {" "} |  {" "} */}
        <span>  
          May this blessed day bring you joy, peace, and endless blessings. As we celebrate Sallah, may your heart be filled with gratitude, your home with happiness, and your life with ease. Wishing you and your loved ones a wonderful celebration filled with harmony and prosperity. Eid Mubarak! 🌙✨
        </span>
        {" "} |  {" "}
      </Marquee>
    </footer>
  );
}
