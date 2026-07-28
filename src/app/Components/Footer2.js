import React from "react";
import Marquee from "react-fast-marquee";

export default function Footer2() {
  return (
    <footer className="w-full bg-gray-900 text-white p-1">
      <Marquee gradient={false} speed={40} className="px-4">
        <span>
          🚨 Urgent Announcement: We will be upgrading all users to{" "}
          <strong>Bade version 4.1</strong> on the{" "}
          <strong>1st of August</strong>.
        </span>
        {"  "} | {"  "}
      </Marquee>
    </footer>
  );
}