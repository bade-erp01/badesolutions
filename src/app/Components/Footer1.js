"use client";
import React, { useEffect, useRef } from "react";
import Marquee from "react-fast-marquee";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SOCIAL_PROFILES, WHATSAPP_URL } from "@/lib/seo";

const SOCIAL_LINKS = [
  { label: "B.A.D.E on X", href: SOCIAL_PROFILES.x, Icon: FaXTwitter },
  { label: "B.A.D.E on Facebook", href: SOCIAL_PROFILES.facebook, Icon: FaFacebookF },
  { label: "B.A.D.E on Instagram", href: SOCIAL_PROFILES.instagram, Icon: FaInstagram },
  { label: "Chat with B.A.D.E on WhatsApp", href: WHATSAPP_URL, Icon: FaWhatsapp },
];

export default function Footer2() {
  const footerRef = useRef(null);

  useEffect(() => {
    const node = footerRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // console.log("Footer is visible to the user");
          // Hook into analytics or trigger events here
        }
      },
      { threshold: 0.5 }
    );

    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, []);

  return (
    <footer ref={footerRef} className="bg-gray-900 text-white py-8 px-4 mt-auto">
      {/* Marquee Announcement */}
      {/* <Marquee gradient={false} speed={40} className="mb-4">
        <span className="text-sm md:text-base text-gray-200">
          📢 Request a customized business email that reflects your brand identity.{" "}
          <Link href="/contact-sales" className="text-indigo-400 underline hover:text-indigo-300 ml-2">
            Contact Sales
          </Link>
        </span>
      </Marquee> */}

      {/* Site links: crawlable links between the public pages */}
      <nav aria-label="Footer" className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-300">
        <Link href="/" className="hover:text-white">ERP software</Link>
        <Link href="/why-bade" className="hover:text-white">Why B.A.D.E</Link>
        <Link href="/Pricing" className="hover:text-white">Pricing</Link>
        <Link href="/About_Us" className="hover:text-white">About us</Link>
        <Link href="/Careers" className="hover:text-white">Careers</Link>
        <Link href="/Pricing" className="hover:text-white">Sign up</Link>
        <Link href="/Login" className="hover:text-white">Log in</Link>
      </nav>

      {/* Social Icons */}
      <ul className="flex justify-center gap-6 mb-6">
        {SOCIAL_LINKS.map(({ label, href, Icon }) => (
          <li key={href}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="block text-white transition hover:text-indigo-400"
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-200">
        &copy; {new Date().getFullYear()} Business Automated Dynamic Enterprise. All rights reserved.
      </div>
    </footer>
  );
}
