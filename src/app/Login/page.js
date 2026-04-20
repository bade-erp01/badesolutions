"use client";
import { useEffect, useState,useRef } from "react";
import Nav1 from "../Components/Nav1";
import Image from "next/image";
import Link from "next/link";
import Footer1 from "../Components/Footer1";
import { plsWait, SuccessToast, ErrorMessage } from "../../../Functions/Mics";
import { loginSuccess, loginFailure } from "../../../lib/User";
import { useDispatch, useSelector } from "react-redux";
import {Encrypt,Dencrypt} from "../../../Functions/Functions"
import Footer2 from "../Components/Footer2";
import { useRouter } from "next/navigation";
// import ReCAPTCHA from "react-google-recaptcha";

export default function Login({userInfo,businessInfo,url,SessionId}) {
  const dispatch = useDispatch();
  // const recaptchaRef = useRef();
  // const userInfo = useSelector((state) => state.user.userInfo);
  // const businessInfo = useSelector((state) => state.user.businessInfo);
  const router = useRouter();
  const [date, setDate] = useState("");
  const [weekday, setWeekday] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("Loading location...");
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    const now = new Date();
    setDate(now.getDate() + getOrdinal(now.getDate()));
    setWeekday(now.toLocaleDateString(undefined, { weekday: "short" }));
    setTime(
      now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    );
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            setLocation(
              data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.state ||
                "Your area"
            );
          } catch {
            setLocation("Your area");
          }
        },
        () => setLocation("Your area")
      );
    } else {
      setLocation("Your area");
    }
  }, []);

  function getOrdinal(n) {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  // login form

  const handleChange = async (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value,location });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const token = await recaptchaRef.current.executeAsync();
    // recaptchaRef.current.reset();
    plsWait("Verifying Credentials. Please wait...");

    try {
      const response = await fetch(`${url}/api/v1/Login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({formData:Encrypt(formData)}),
      });

      const data = await response.json();

      if (response.ok && data.Newcustomer) {
        dispatch(loginSuccess({ user: Dencrypt(data.Newcustomer), business: data.Tenant, SessionId:data.SessionId}));
        // reset the form
        SuccessToast('Login successful')
        plsWait("Login successful, Redirecting...");

        // Reset the form
        setFormData({ email: "", password: "" }); // or setFormData(initialState)

        const sanitizedCompanyName = data.Tenant.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

        const dashboardUrl = `/${sanitizedCompanyName}/${Encrypt(data.Newcustomer._id)}`;
        // Redirect using Next.js router
        router.push(dashboardUrl);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      setFormData({ email: "", password: "" });
      ErrorMessage(error.message);
      dispatch(loginFailure(error.message));
    }
  };

  return (
    <div
      style={{
        backgroundImage: "url('/bg.jpg')",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <Nav1
        user={userInfo}
        business={businessInfo}
        page={userInfo ? `dashboard` : "Bade"}
      />
      <div className="min-h-screen flex items-center justify-center  p-4">
        <div className="flex flex-col md:flex-row gap-8 items-end relative z-10">
          {/* Login Card */}
          {
          !SessionId  ||
          SessionId !== userInfo?.SessionId ||
          !userInfo ||
          !businessInfo? (
            <div className="bg-white/80 backdrop-blur-md rounded-md shadow-xl p-8 w-[340px] max-w-full flex flex-col gap-6">
              <div className="flex justify-between items-center mb-2">
                <Link href="/" className="font-bold text-xl text-gray-900">
                  <Image
                    src="/bade.jpg"
                    alt="Bade Logo"
                    width={40}
                    height={40}
                    className="rounded shadow-sm"
                  />
                </Link>
                <h2 className="text-2xl font-semibold hover:underline text-gray-700 mb-2">
                  Log in
                </h2>
              </div>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                  <span className="mr-2 text-gray-400">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M16 16c0-2.21-3.58-4-8-4s-8 1.79-8 4" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    onChange={handleChange}
                    placeholder="e-mail address"
                    className="bg-transparent outline-none flex-1 text-gray-700 placeholder-gray-400"
                    value={formData.email}
                    name="email"
                    required
                  />
                </div>
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                  <span className="mr-2 text-gray-400">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="11" width="18" height="7" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    name="password"
                    placeholder="password"
                    className="bg-transparent outline-none flex-1 text-gray-700 placeholder-gray-400"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Link
                    href="/auth/Forgot_password"
                    className="ml-2 text-xs text-gray-500 hover:underline"
                  >
                    I forgot
                  </Link>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <button className="bg-black text-white rounded p-2 ml-2 shadow-md">
                    Login
                  </button>
                </div>
              </form>
              {/* Event Card */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 w-[340px] max-w-full flex flex-col gap-6 relative overflow-auto">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full opacity-60 blur-2xl z-0" />

                <div className="flex justify-between gap-4 items-start relative z-10">
                  <div>
                    <div className="text-2xl font-bold text-gray-700 leading-none">
                      {weekday}
                    </div>
                    <div className="text-2xl font-light text-gray-400 -mt-2 mb-4">
                      {date}
                    </div>
                  </div>
                  <div className="relative z-10 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 font-medium">
                        {time} <br />
                        How&apos;s {location} today?
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/Marketers"
                  className="text-white/80 bg-black border z-20 border-white/20 rounded-full px-6 py-2 font-medium hover:bg-dark/20 hover:border hover:border-gray-300 transition"
                >
                  Refer and Earn →
                </Link>
                {/* </div> */}
              </div>
              {/* New In Card */}
              <p className="text-xs text-gray-400 text-center mt-2">
                Business Automated Dynamic Enterprise!
              </p>
            </div>
          ) : (
            <div className="max-w-sm w-full bg-white rounded-xl shadow-lg p-4 flex items-center gap-4">
              <Image
                src={userInfo?.image || businessInfo?.companyLogo || "/bade.jpg"}
                alt="Logo"
                width={60}
                height={60}
                className="rounded-full shadow-md"
                quality={100}
                loading="eager"
              />
              <div>
                <h3 className="text-amber-950 font-semibold text-md leading-tight">
                  Welcome Back {userInfo?.firstName || "Guest"}..!!
                </h3>
                <p className="text-sm text-gray-600">Glad to see you again</p>
              </div>
            </div>
          )}
        </div>
        {/* Decorative spheres and background */}
        <div className="absolute inset-0 -z-10 flex items-end justify-center">
          <div className="w-[420px] h-[420px] bg-gradient-to-br from-[#f5ede7] to-[#e7e3df] rounded-full absolute left-1/2 -translate-x-1/2 bottom-0 blur-2xl opacity-80" />
          <div className="w-40 h-40 bg-gradient-to-br from-orange-200 to-orange-400 rounded-full absolute left-12 bottom-12 blur-xl opacity-70" />
          <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-300 rounded-full absolute right-20 bottom-24 blur-lg opacity-60" />
          <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full absolute left-32 bottom-32 blur-md opacity-50" />
        </div>
      </div>
      {userInfo && businessInfo ? <Footer2 /> : <Footer1 />}
    </div>
  );
}
