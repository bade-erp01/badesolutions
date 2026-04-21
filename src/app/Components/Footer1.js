"use client";
import React, { useEffect, useRef } from "react";
import Marquee from "react-fast-marquee";
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";

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

      {/* Social Icons */}
      <div className="flex justify-center space-x-6 mb-6">
        <Link href="https://facebook.com" target="_blank">
          <FaFacebookF className="text-white hover:text-indigo-400 transition" />
        </Link>
        <Link href="https://twitter.com" target="_blank">
          <FaTwitter className="text-white hover:text-indigo-400 transition" />
        </Link>
        <Link href="https://linkedin.com" target="_blank">
          <FaLinkedinIn className="text-white hover:text-indigo-400 transition" />
        </Link>
        <Link href="https://instagram.com" target="_blank">
          <FaInstagram className="text-white hover:text-indigo-400 transition" />
        </Link>
      </div>

      {/* Newsletter Signup */}
      <form className="max-w-md mx-auto mb-6">
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Subscribe to our newsletter
        </label>
        <div className="flex">
          <input
            type="email"
            id="email"
            placeholder="you@example.com"
            className="w-full px-4 py-2 rounded-l-md bg-gray-800 text-white border border-gray-700 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-500 transition"
          >
            Subscribe
          </button>
        </div>
      </form>

      {/* Copyright */}
      <div className="text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Business Automated Dynamic Enterprise. All rights reserved.
      </div>
    </footer>
  );
}
