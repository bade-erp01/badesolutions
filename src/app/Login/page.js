"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  LogOut,
} from "lucide-react";

import Nav1 from "../Components/Nav1";
import Footer1 from "../Components/Footer1";

import { SuccessToast, ErrorMessage } from "../../../Functions/Mics";

import {
  loginSuccess,
  loginFailure,
  logout as logoutAction,
} from "../../../lib/User";

import {
  Encrypt,
  Dencrypt,
} from "../../../Functions/Functions";

import OneSignal from "react-onesignal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login({
  userInfo,
  businessInfo,
  url,
  SessionId,
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [weekday, setWeekday] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("Your area");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [loading, setLoading] = useState(false);

  /*
   * ============================================================
   * DATE / LOCATION
   * ============================================================
   */

  useEffect(() => {
    const now = new Date();

    const day = now.getDate();

    setDate(`${day}${getOrdinal(day)}`);

    setWeekday(
      now.toLocaleDateString(undefined, {
        weekday: "long",
      }),
    );

    setTime(
      now.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );

    if (!navigator.geolocation) {
      setLocation("Your area");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );

          if (!response.ok) {
            throw new Error(
              "Location lookup failed",
            );
          }

          const data = await response.json();

          setLocation(
            data?.address?.city ||
              data?.address?.town ||
              data?.address?.village ||
              data?.address?.state ||
              "Your area",
          );
        } catch {
          setLocation("Your area");
        }
      },
      () => {
        setLocation("Your area");
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      },
    );
  }, []);

  function getOrdinal(number) {
    if (number > 3 && number < 21) {
      return "th";
    }

    switch (number % 10) {
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

  /*
   * ============================================================
   * FORM
   * ============================================================
   */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * ============================================================
   * ONESIGNAL
   * ============================================================
   */

  const registerOneSignal = async (user) => {
    try {
      if (!user?._id) {
        return;
      }

      const appId =
        process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;

      if (!appId) {
        
        return;
      }

      /*
       * Initialize OneSignal
       */
      await OneSignal.init({
        appId,
      });

      /*
       * Associate the OneSignal subscription
       * with the authenticated BADE user.
       */
      await OneSignal.login(
        String(user._id),
      );

      /*
       * Optional tag.
       *
       * This can be useful when you want to
       * filter/segment users in OneSignal.
       */
      await OneSignal.User.addTag(
        "_id",
        String(user._id),
      );

    } catch (error) {

    }
  };

  /*
   * ============================================================
   * LOGIN
   * ============================================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.email ||
      !formData.password
    ) {
      ErrorMessage(
        "Email and password are required",
      );

      return;
    }

    try {
      setLoading(true);

      /*
       * Authenticate with BADE backend
       */
      const response = await fetch(
        `${url}/api/v1/Login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            formData: Encrypt(formData),
          }),
        },
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid server response",
        );
      }

      /*
       * Login failed
       */
      if (!response.ok) {
        throw new Error(
          data?.error || "Login failed",
        );
      }

      /*
       * Validate login response
       */
      if (
        !data?.Newcustomer ||
        !data?.Tenant
      ) {
        throw new Error(
          "Invalid login response",
        );
      }

      /*
       * Decrypt user
       */
      const decryptedUser = Dencrypt(
        data.Newcustomer,
      );

      /*
       * Clear any previous session first.
       */
      await dispatch(
        logoutAction(),
      );

      /*
       * Register the authenticated user
       * with OneSignal.
       *
       * This is deliberately separate from Redux
       * because OneSignal is an external side effect.
       */
      await registerOneSignal(
        decryptedUser,
      );

      /*
       * Store the authenticated BADE session.
       */
      dispatch(
        loginSuccess({
          user: decryptedUser,

          business: data.Tenant,

          SessionId:
            data.SessionId,

          rustyRoof:
            data.rustyRoof,
        }),
      );

      /*
       * Clear form
       */
      setFormData({
        email: "",
        password: "",
      });

      /*
       * Show splash
       */
      setShowSplash(true);

      /*
       * Build dashboard URL
       */
      const sanitizedCompanyName =
        data.Tenant
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(
            /[^a-z0-9-]/g,
            "",
          );

      const dashboardUrl =
        `/${sanitizedCompanyName}/V4`;

      /*
       * Redirect after splash
       */
      setTimeout(() => {
        setLoading(false);

        window.location.assign(
          dashboardUrl,
        );
      }, 5000);
    } catch (error) {
      console.error(
        "Login error:",
        error,
      );

      setShowSplash(false);

      setLoading(false);

      setFormData({
        email: "",
        password: "",
      });

      ErrorMessage(
        error?.message ||
          "Something went wrong",
      );

      dispatch(
        loginFailure(
          error?.message ||
            "Login failed",
        ),
      );
    }
  };

  /*
   * ============================================================
   * SESSION
   * ============================================================
   */

  const isLoggedIn =
    userInfo &&
    businessInfo &&
    SessionId === userInfo?.SessionId;

  const logout = async () => {
    try {
      SuccessToast(
        "Signing out...",
      );

      /*
       * Clear Redux session.
       */
      await dispatch(
        logoutAction(),
      );

      SuccessToast(
        "You have been logged out successfully.",
      );

     router.push('/')
    } catch (error) {
      ErrorMessage(
        "Logout failed. Please try again.",
      );
    }
  };

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <main
      className="
        min-h-screen
        bg-cover
        bg-center
        bg-fixed
        bg-no-repeat
        text-zinc-950
      "
      style={{
        backgroundImage:
          "url('/bg.jpg')",
      }}
    >
      {/* =====================================================
          SPLASH
      ====================================================== */}

      <AnimatePresence>
        {showSplash && (
          <BadeSplashScreen />
        )}
      </AnimatePresence>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <Nav1
        user={userInfo}
        business={businessInfo}
        page={
          userInfo
            ? "dashboard"
            : "Bade"
        }
      />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <section
        className="
          relative
          min-h-[calc(100vh-80px)]
          overflow-hidden
          bg-white/10
        "
      >
        {/* Very subtle overlay.
            The original bg.jpg remains visible. */}

        <div className="pointer-events-none absolute inset-0 bg-white/10" />

        <div
          className="
            relative
            mx-auto
            flex
            min-h-[calc(100vh-80px)]
            max-w-7xl
            items-center
            px-4
            py-10
            sm:px-6
            lg:px-8
          "
        >
          {!isLoggedIn ? (
            <div
              className="
                grid
                w-full
                items-center
                gap-10
                lg:grid-cols-[1.05fr_0.95fr]
                lg:gap-20
              "
            >
              {/* =================================================
                  LEFT SIDE
              ================================================== */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: -30,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.6,
                }}
                className="hidden lg:block"
              >
                <div className="max-w-xl">
                  {/* Logo */}

                  <div className="mb-10 flex items-center gap-4">
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-2xl
                        bg-black
                        shadow-xl
                      "
                    >
                      <Image
                        src="/bade.jpg"
                        alt="B.A.D.E"
                        width={56}
                        height={56}
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />
                    </div>

                    <div>
                      <p className="text-lg font-bold tracking-tight">
                        B.A.D.E
                      </p>

                      <p
                        className="
                          text-xs
                          uppercase
                          tracking-[0.2em]
                          text-zinc-500
                        "
                      >
                        Enterprise Platform
                      </p>
                    </div>
                  </div>

                  {/* Heading */}

                  <h1
                    className="
                      text-5xl
                      font-semibold
                      leading-[1.05]
                      tracking-[-0.04em]
                      text-zinc-950
                      xl:text-6xl
                    "
                  >
                    Everything your
                    <br />
                    business needs,
                    <span className="block text-zinc-400">
                      in one place.
                    </span>
                  </h1>

                  <p
                    className="
                      mt-7
                      max-w-lg
                      text-base
                      leading-7
                      text-zinc-600
                    "
                  >
                    Access your business
                    operations, workflows,
                    reports and enterprise
                    tools through one secure
                    workspace.
                  </p>

                  {/* Features */}

                  <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <Feature
                      icon={
                        <ShieldCheck className="h-5 w-5" />
                      }
                      title="Secure workspace"
                      description="Your business data stays protected."
                    />

                    <Feature
                      icon={
                        <Sparkles className="h-5 w-5" />
                      }
                      title="Built for velocity"
                      description="Move from operations to insights faster."
                    />
                  </div>

                  {/* Date / Location */}

                  <div
                    className="
                      mt-12
                      rounded-3xl
                      border
                      border-black/5
                      bg-white/75
                      p-6
                      shadow-sm
                      backdrop-blur-xl
                    "
                  >
                    <div className="flex items-end justify-between gap-5">
                      <div>
                        <p
                          className="
                            text-xs
                            font-medium
                            uppercase
                            tracking-[0.2em]
                            text-zinc-400
                          "
                        >
                          Today
                        </p>

                        <div
                          className="
                            mt-2
                            text-3xl
                            font-semibold
                            tracking-tight
                          "
                        >
                          {weekday}
                        </div>

                        <div className="text-lg text-zinc-400">
                          {date}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-medium tracking-tight">
                          {time}
                        </p>

                        <div
                          className="
                            mt-2
                            flex
                            items-center
                            justify-end
                            gap-1.5
                            text-xs
                            text-zinc-500
                          "
                        >
                          <MapPin className="h-3.5 w-3.5" />

                          <span>
                            {location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* =================================================
                  LOGIN CARD
              ================================================== */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                }}
                className="w-full"
              >
                <div className="mx-auto w-full max-w-md">
                  <div
                    className="
                      rounded-[2rem]
                      border
                      border-black/10
                      bg-white/95
                      p-6
                      shadow-[0_25px_80px_-30px_rgba(0,0,0,0.4)]
                      backdrop-blur-xl
                      sm:p-8
                    "
                  >
                    {/* Mobile Logo */}

                    <div className="mb-8 flex items-center justify-between lg:hidden">
                      <Link
                        href="/"
                        className="flex items-center gap-3"
                      >
                        <div
                          className="
                            flex
                            h-11
                            w-11
                            overflow-hidden
                            rounded-xl
                            bg-black
                          "
                        >
                          <Image
                            src="/bade.jpg"
                            alt="B.A.D.E"
                            width={44}
                            height={44}
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />
                        </div>

                        <div>
                          <p className="font-bold">
                            B.A.D.E
                          </p>

                          <p
                            className="
                              text-[10px]
                              uppercase
                              tracking-widest
                              text-zinc-400
                            "
                          >
                            Enterprise
                          </p>
                        </div>
                      </Link>
                    </div>

                    {/* Header */}

                    <div className="mb-8">
                      <div
                        className="
                          mb-5
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          bg-zinc-950
                          text-white
                          shadow-lg
                        "
                      >
                        <LockKeyhole className="h-5 w-5" />
                      </div>

                      <h2
                        className="
                          text-3xl
                          font-semibold
                          tracking-[-0.03em]
                        "
                      >
                        Welcome back
                      </h2>

                      <p
                        className="
                          mt-2
                          text-sm
                          leading-6
                          text-zinc-500
                        "
                      >
                        Sign in to continue to
                        your business workspace.
                      </p>
                    </div>

                    {/* Form */}

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      {/* Email */}

                      <div>
                        <label
                          htmlFor="email"
                          className="
                            mb-2
                            block
                            text-sm
                            font-medium
                            text-zinc-800
                          "
                        >
                          Email address
                        </label>

                        <div className="relative">
                          <Mail
                            className="
                              pointer-events-none
                              absolute
                              left-4
                              top-1/2
                              h-4
                              w-4
                              -translate-y-1/2
                              text-zinc-400
                            "
                          />

                          <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            className="
                              h-12
                              rounded-xl
                              border-zinc-200
                              bg-zinc-50
                              pl-11
                              shadow-none
                              transition
                              focus-visible:border-zinc-400
                              focus-visible:ring-1
                              focus-visible:ring-zinc-400
                            "
                          />
                        </div>
                      </div>

                      {/* Password */}

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label
                            htmlFor="password"
                            className="
                              text-sm
                              font-medium
                              text-zinc-800
                            "
                          >
                            Password
                          </label>

                          <Link
                            href="/auth/Forgot_password"
                            className="
                              text-xs
                              font-medium
                              text-zinc-500
                              transition
                              hover:text-zinc-950
                          "
                          >
                            Forgot password?
                          </Link>
                        </div>

                        <div className="relative">
                          <LockKeyhole
                            className="
                              pointer-events-none
                              absolute
                              left-4
                              top-1/2
                              h-4
                              w-4
                              -translate-y-1/2
                              text-zinc-400
                            "
                          />

                          <Input
                            id="password"
                            name="password"
                            type={
                              showPassword
                                ? "text"
                                : "password"
                            }
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={
                              formData.password
                            }
                            onChange={
                              handleChange
                            }
                            disabled={loading}
                            required
                            className="
                              h-12
                              rounded-xl
                              border-zinc-200
                              bg-zinc-50
                              pl-11
                              pr-11
                              shadow-none
                              transition
                              focus-visible:border-zinc-400
                              focus-visible:ring-1
                              focus-visible:ring-zinc-400
                            "
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword(
                                (previous) =>
                                  !previous,
                              )
                            }
                            className="
                              absolute
                              right-3
                              top-1/2
                              -translate-y-1/2
                              rounded-lg
                              p-1.5
                              text-zinc-400
                              transition
                              hover:bg-zinc-200
                              hover:text-zinc-900
                            "
                            aria-label={
                              showPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Login Button */}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="
                          group
                          h-12
                          w-full
                          rounded-xl
                          bg-zinc-950
                          text-sm
                          font-medium
                          text-white
                          shadow-lg
                          shadow-zinc-950/10
                          transition-all
                          hover:bg-zinc-800
                        "
                      >
                        {loading ? (
                          <>
                            <Loader2
                              className="
                                mr-2
                                h-4
                                w-4
                                animate-spin
                              "
                            />

                            Signing you in...
                          </>
                        ) : (
                          <>
                            Sign in

                            <ArrowRight
                              className="
                                ml-2
                                h-4
                                w-4
                                transition-transform
                                group-hover:translate-x-1
                              "
                            />
                          </>
                        )}
                      </Button>

                      {/* Divider */}

                      <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-zinc-100" />
                        </div>

                        <div className="relative flex justify-center">
                          <span
                            className="
                              bg-white
                              px-3
                              text-[10px]
                              uppercase
                              tracking-widest
                              text-zinc-400
                            "
                          >
                            Or
                          </span>
                        </div>
                      </div>

                      {/* Sales Portal */}

                      <Link
                        href="/SalesPortal"
                        className="
                          group
                          flex
                          h-12
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-zinc-200
                          bg-white
                          text-sm
                          font-medium
                          text-zinc-800
                          transition
                          hover:border-zinc-300
                          hover:bg-zinc-50
                        "
                      >
                        Access Sales Portal

                        <ArrowRight
                          className="
                            h-4
                            w-4
                            transition-transform
                            group-hover:translate-x-1
                          "
                        />
                      </Link>
                    </form>

                    {/* Footer */}

                    <div className="mt-8 border-t border-zinc-100 pt-6">
                      <p
                        className="
                          text-center
                          text-[11px]
                          leading-5
                          text-zinc-400
                        "
                      >
                        Business Automated
                        Dynamic Enterprise
                      </p>
                    </div>
                  </div>

                  {/* Refer and Earn */}

                  <Link
                    href="/Marketers"
                    className="
                      group
                      mt-4
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-black/5
                      bg-white/80
                      px-5
                      py-4
                      text-xs
                      font-medium
                      text-zinc-600
                      shadow-sm
                      backdrop-blur
                      transition
                      hover:bg-white
                      hover:text-zinc-950
                    "
                  >
                    Refer and Earn

                    <ArrowRight
                      className="
                        h-3.5
                        w-3.5
                        transition-transform
                        group-hover:translate-x-1
                      "
                    />
                  </Link>
                </div>
              </motion.div>
            </div>
          ) : (
            /* =================================================
               ALREADY LOGGED IN
            ================================================== */

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="mx-auto w-full max-w-lg"
            >
              <div
                className="
                  rounded-[2rem]
                  border
                  border-black/5
                  bg-white/95
                  p-8
                  shadow-[0_25px_80px_-30px_rgba(0,0,0,0.3)]
                  backdrop-blur-xl
                "
              >
                <div className="flex items-start gap-5">
                  <Image
                    src={
                      userInfo?.image ||
                      businessInfo?.companyLogo ||
                      "/bade.jpg"
                    }
                    alt="User"
                    width={76}
                    height={76}
                    className="
                      h-[76px]
                      w-[76px]
                      rounded-2xl
                      object-cover
                      shadow-md
                    "
                  />

                  <div className="min-w-0 flex-1">
                    <p
                      className="
                        text-xs
                        font-medium
                        uppercase
                        tracking-[0.15em]
                        text-zinc-400
                      "
                    >
                      Active session
                    </p>

                    <h3
                      className="
                        mt-1
                        truncate
                        text-xl
                        font-semibold
                        tracking-tight
                      "
                    >
                      Welcome back,{" "}
                      {userInfo?.firstName ||
                        "User"}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      {businessInfo?.companyName ||
                        "Your business workspace"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <Link
                    href="/"
                    className="
                      flex
                      h-12
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-zinc-200
                      text-sm
                      font-medium
                      transition
                      hover:bg-zinc-50
                    "
                  >
                    Home
                  </Link>

                  <Button
                    type="button"
                    onClick={logout}
                    className="
                      h-12
                      rounded-xl
                      bg-red-500
                      text-white
                      hover:bg-red-600
                    "
                  >
                    <LogOut className="mr-2 h-4 w-4" />

                    Sign out
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <Footer1 />
    </main>
  );
}

/*
 * ============================================================
 * FEATURE COMPONENT
 * ============================================================
 */

function Feature({
  icon,
  title,
  description,
}) {
  return (
    <div className="flex gap-3">
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-white
          shadow-sm
          ring-1
          ring-black/5
        "
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-zinc-800">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * BADE SPLASH SCREEN
 * ============================================================
 */

export function BadeSplashScreen() {
  const [visible, setVisible] =
    useState(true);

  const [glow, setGlow] =
    useState(false);

  const timeout = 5000;

  useEffect(() => {
    const glowTimer = setTimeout(() => {
      setGlow(true);
    }, 1200);

    const redirectTimer =
      setTimeout(() => {
        setVisible(false);
      }, timeout);

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(
        redirectTimer,
      );
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            overflow-hidden
            bg-zinc-950
          "
        >
          {/* Background glow */}

          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]
            "
          />

          <motion.div
            initial={{
              scale: 0.85,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            className="
              relative
              flex
              flex-col
              items-center
            "
          >
            {/* Logo */}

            <div
              className="
                absolute
                inset-0
                rounded-full
                bg-white/10
                blur-3xl
              "
            />

            <motion.div
              animate={{
                scale: glow
                  ? [1, 1.04, 1]
                  : 1,
              }}
              transition={{
                duration: 1.8,
                repeat: glow
                  ? Infinity
                  : 0,
                ease: "easeInOut",
              }}
              className="
                relative
                flex
                h-20
                w-20
                items-center
                justify-center
                overflow-hidden
                rounded-3xl
                bg-white
                shadow-2xl
              "
            >
              <Image
                src="/bade.jpg"
                alt="B.A.D.E"
                width={80}
                height={80}
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            </motion.div>

            {/* Brand */}

            <motion.h1
              animate={{
                textShadow: glow
                  ? [
                      "0 0 10px rgba(255,255,255,0.2)",
                      "0 0 30px rgba(255,255,255,0.5)",
                      "0 0 50px rgba(255,255,255,0.8)",
                    ]
                  : "0 0 0px rgba(255,255,255,0)",
              }}
              transition={{
                duration: 1.5,
                repeat: glow
                  ? Infinity
                  : 0,
                ease: "easeInOut",
              }}
              className="
                relative
                mt-7
                text-2xl
                font-black
                uppercase
                tracking-[0.4em]
                text-white
              "
            >
              B.A.D.E
            </motion.h1>

            {/* Description */}

            <motion.p
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.4,
              }}
              className="
                mt-3
                text-center
                text-[10px]
                uppercase
                tracking-[0.3em]
                text-zinc-500
              "
            >
              Business Automated
              Dynamic Enterprise
            </motion.p>

            {/* Progress */}

            <div
              className="
                mt-10
                h-[2px]
                w-[220px]
                overflow-hidden
                rounded-full
                bg-white/10
              "
            >
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: "100%",
                }}
                transition={{
                  duration:
                    timeout / 1000,
                  ease: "linear",
                }}
                className="
                  h-full
                  bg-white
                "
              />
            </div>

            <p
              className="
                mt-4
                text-[10px]
                uppercase
                tracking-[0.25em]
                text-zinc-600
              "
            >
              Preparing your workspace
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}