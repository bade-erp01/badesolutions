"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { logoutOneSignal } from "../Components/OneSignalProvider";

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
import { Encrypt, Dencrypt } from "../../../Functions/Functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login({ userInfo, businessInfo, url }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [weekday, setWeekday] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("Your area");

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [loading, setLoading] = useState(false);


  /* ---------- DATE / LOCATION ---------- */
  useEffect(() => {
    const now = new Date();
    const day = now.getDate();
    setDate(`${day}${getOrdinal(day)}`);
    setWeekday(now.toLocaleDateString(undefined, { weekday: "long" }));
    setTime(
      now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    );

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
          );
          if (!res.ok) return;
          const data = await res.json();
          setLocation(
            data?.address?.city ||
              data?.address?.town ||
              data?.address?.village ||
              data?.address?.state ||
              "Your area"
          );
        } catch {
          /* ignore */
        }
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 }
    );
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------- LOGIN ---------- */
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      ErrorMessage("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      // plain over HTTPS; credentials so the browser keeps the session cookies
      const response = await fetch(`${url}/api/v1/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email, password: formData.password, location: formData.location }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Login failed");
      }

      if (!data?.Newcustomer || !data?.Tenant) {
        throw new Error("Invalid login response");
      }

      const decryptedUser = Dencrypt(data.Newcustomer);

      await dispatch(logoutAction());

      // OneSignal login (external_id) happens in OneSignalProvider on the
      // dashboard, which this page hard-navigates to.

      dispatch(
        loginSuccess({
          user: decryptedUser,
          business: data.Tenant,
        })
      );

      setFormData({ email: "", password: "" });
      setShowSplash(true);

      const sanitizedCompanyName = data.Tenant.toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const dashboardUrl = `/${sanitizedCompanyName}/V4`;

      setTimeout(() => {
        setLoading(false);
        window.location.assign(dashboardUrl);
      }, 5000);
    } catch (error) {
      setShowSplash(false);
      setLoading(false);
      setFormData({ email: "", password: "" });
      ErrorMessage(error?.message || "Something went wrong");
      dispatch(loginFailure(error?.message || "Login failed"));
    }
  };

  // fetchUser() only returns a user when the backend session is valid
  const isLoggedIn = Boolean(userInfo && businessInfo);

  const logout = async () => {
    try {
      await logoutOneSignal();

      await dispatch(logoutAction());
      SuccessToast("You have been logged out successfully.");
      router.push("/");
    } catch {
      ErrorMessage("Logout failed. Please try again.");
    }
  };

  return (
    <main className="min-h-dvh bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <AnimatePresence>{showSplash && <BadeSplashScreen />}</AnimatePresence>

      <Nav1
        user={userInfo}
        business={businessInfo}
        page={userInfo ? "dashboard" : "Bade"}
      />

      <section className="relative min-h-[calc(100dvh-80px)] overflow-hidden">
        {/* Soft background — works in light & dark */}
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 dark:opacity-80"
          style={{ backgroundImage: "url('/bg.jpg')" }}
        />
        <div className="pointer-events-none absolute inset-0 dark:bg-gradient-to-b dark:from-zinc-950/90 dark:via-zinc-950/80 dark:to-zinc-950" />

        <div className="relative mx-auto flex min-h-[calc(100dvh-80px)] max-w-7xl items-center px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
          {!isLoggedIn ? (
            <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              {/* LEFT */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="hidden lg:block"
              >
                <div className="max-w-xl">
                  <div className="mb-10 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-zinc-950 shadow-xl dark:bg-white">
                      <Image
                        src="/bade.jpg"
                        alt="B.A.D.E"
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-lg font-bold tracking-tight">B.A.D.E</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                        Enterprise Platform
                      </p>
                    </div>
                  </div>

                  <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-6xl">
                    Everything your
                    <br />
                    business needs,
                    <span className="block text-zinc-400 dark:text-zinc-500">
                      in one place.
                    </span>
                  </h1>

                  <p className="mt-7 max-w-lg text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    Access operations, workflows, reports and tools through one
                    secure workspace.
                  </p>

                  <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <Feature
                      icon={<ShieldCheck className="h-5 w-5" />}
                      title="Secure workspace"
                      description="Your business data stays protected."
                    />
                    <Feature
                      icon={<Sparkles className="h-5 w-5" />}
                      title="Built for velocity"
                      description="Move from operations to insights faster."
                    />
                  </div>

                  <div className="mt-12 rounded-3xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
                    <div className="flex items-end justify-between gap-5">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
                          Today
                        </p>
                        <div className="mt-2 text-3xl font-semibold tracking-tight">
                          {weekday}
                        </div>
                        <div className="text-lg text-zinc-400">{date}</div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-medium tracking-tight">
                          {time}
                        </p>
                        <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-zinc-500">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* LOGIN CARD */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="w-full"
              >
                <div className="mx-auto w-full max-w-md">
                  <div className="rounded-[1.75rem] border border-zinc-200/90 bg-white/95 p-5 shadow-xl shadow-zinc-950/5 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-black/40 sm:p-8">
                    <div className="mb-8 flex items-center justify-between lg:hidden">
                      <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-11 w-11 overflow-hidden rounded-xl bg-zinc-950 dark:bg-white">
                          <Image
                            src="/bade.jpg"
                            alt="B.A.D.E"
                            width={44}
                            height={44}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold">B.A.D.E</p>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-400">
                            Enterprise
                          </p>
                        </div>
                      </Link>
                    </div>

                    <div className="mb-8">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg dark:bg-white dark:text-zinc-950">
                        <LockKeyhole className="h-5 w-5" />
                      </div>
                      <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                        Welcome back
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                        Sign in to continue to your business workspace.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
                        >
                          Email address
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
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
                            className="h-12 rounded-xl border-zinc-200 bg-zinc-50 pl-11 shadow-none focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/80"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label
                            htmlFor="password"
                            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
                          >
                            Password
                          </label>
                          <Link
                            href="/auth/Forgot_password"
                            className="shrink-0 text-xs font-medium text-zinc-500 transition hover:text-zinc-950 dark:hover:text-white"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            required
                            className="h-12 rounded-xl border-zinc-200 bg-zinc-50 pl-11 pr-11 shadow-none focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/80"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-700 dark:hover:text-white"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
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

                      <Button
                        type="submit"
                        disabled={loading}
                        className="group h-12 w-full rounded-xl bg-zinc-950 text-sm font-medium text-white shadow-lg shadow-zinc-950/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing you in...
                          </>
                        ) : (
                          <>
                            Sign in
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>

                      <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-zinc-100 dark:border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-3 text-[10px] uppercase tracking-widest text-zinc-400 dark:bg-zinc-900">
                            Or
                          </span>
                        </div>
                      </div>

                      <Link
                        href="/SalesPortal"
                        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        Access Sales Portal
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </form>

                    <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                      <p className="text-center text-[11px] leading-5 text-zinc-400">
                        Business Automated Dynamic Enterprise
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/Careers"
                    className="group mt-4 flex items-center justify-center gap-2 rounded-2xl border border-zinc-200/80 bg-white/80 px-5 py-4 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                  >
                    Careers
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            </div>
          ) : (
            /* ALREADY LOGGED IN */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto w-full max-w-lg"
            >
              <div className="rounded-[1.75rem] border border-zinc-200/80 bg-white/95 p-5 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95 sm:p-8">
                <div className="flex items-start gap-4 sm:gap-5">
                  <Image
                    src={
                      userInfo?.image ||
                      businessInfo?.companyLogo ||
                      "/bade.jpg"
                    }
                    alt="User"
                    width={76}
                    height={76}
                    className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-md sm:h-[76px] sm:w-[76px]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-zinc-400">
                      Active session
                    </p>
                    <h3 className="mt-1 truncate text-xl font-semibold tracking-tight">
                      Welcome back, {userInfo?.firstName || "User"}
                    </h3>
                    <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
                      {businessInfo?.companyName || "Your business workspace"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <Link
                    href="/"
                    className="flex h-12 items-center justify-center rounded-xl border border-zinc-200 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Home
                  </Link>
                  <Button
                    type="button"
                    onClick={logout}
                    className="h-12 rounded-xl bg-red-500 text-white hover:bg-red-600"
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

      <Footer1 />
    </main>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-zinc-800 dark:ring-white/10">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export function BadeSplashScreen() {
  const [visible, setVisible] = useState(true);
  const [glow, setGlow] = useState(false);
  const timeout = 5000;

  useEffect(() => {
    const glowTimer = setTimeout(() => setGlow(true), 1200);
    const redirectTimer = setTimeout(() => setVisible(false), timeout);
    return () => {
      clearTimeout(glowTimer);
      clearTimeout(redirectTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-zinc-950"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)]" />
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex flex-col items-center px-6"
          >
            <motion.div
              animate={{ scale: glow ? [1, 1.04, 1] : 1 }}
              transition={{
                duration: 1.8,
                repeat: glow ? Infinity : 0,
                ease: "easeInOut",
              }}
              className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <Image
                src="/bade.jpg"
                alt="B.A.D.E"
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </motion.div>

            <motion.h1
              className="relative mt-7 text-2xl font-black uppercase tracking-[0.4em] text-white"
            >
              B.A.D.E
            </motion.h1>

            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              Business Automated Dynamic Enterprise
            </p>

            <div className="mt-10 h-[2px] w-[220px] max-w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: timeout / 1000, ease: "linear" }}
                className="h-full bg-white"
              />
            </div>

            <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-zinc-600">
              Preparing your workspace
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}