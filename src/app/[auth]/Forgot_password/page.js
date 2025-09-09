"use client";

import { useState } from "react";
import Image from "next/image";
import Nav1 from "@/app/Components/Nav1";
import Footer1 from "@/app/Components/Footer1";
import {useRouter} from "next/navigation"
import {ErrorMessage,SuccessToast,plsWait } from "../../../../Functions/Mics"
import {EXPRESS_PRIVATE_URL} from '../../../../Functions/Functions'
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();


  const handleChange = (e) => {
    setEmail(e.target.value);
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    plsWait("Hold on a minute...");

    try {
      const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/v1/Reset_Password/${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer `,
        },
      });

      const data = await res.json();

      if (data.message) {
        SuccessToast(data.message);
        setEmail("");
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      ErrorMessage(err.message);
    }
  };


  return (
    <>
      <Nav1 />
      <div className="min-h-screen flex items-center justify-center  p-4">
        <div className="max-w-4xl w-full flex flex-col md:flex-row items-center bg-white shadow-lg">
          {/* Left Section: Illustration */}
          <div className="hidden md:flex w-1/2 items-center justify-center p-8">
            <Image
              src="/lock.jpg"
              alt="Forgot Password Image"
              width={350}
              height={350}
              loading="eager"
              quality={100}
              priority={true}
              className="rounded-md"
            />
          </div>

          {/* Right Section: Forgot Password Form */}
          <div className="w-full md:w-1/2 p-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Forgot Password?
            </h1>
            <p className="text-gray-500 mt-2">
              Enter your email to receive a reset link.
            </p>

            <form className="mt-6" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                required
                autoComplete="email"
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 mb-4"
              />

              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-md mt-4 hover:bg-gray-800 transition"
              >
                Send Reset Link
              </button>

              <p className="text-center mt-4 text-gray-500">
                Remember your password?{" "}
                <Link href="/Login" className="text-blue-500">
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      <Footer1 />
    </>
  );
}
