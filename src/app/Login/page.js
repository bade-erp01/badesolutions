"use client";
import { useEffect, useState } from "react";
import Nav1 from "../Components/Nav1";
import Image from "next/image";
import Link from "next/link";
import Footer1 from "../Components/Footer1";
import { plsWait, SuccessToast, ErrorMessage } from "../../../Functions/Mics";
import { loginSuccess, loginFailure } from "../../../lib/User";
import { useDispatch, useSelector } from "react-redux";
import { Encrypt, Dencrypt } from "../../../Functions/Functions";
import Footer2 from "../Components/Footer2";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function Login({ userInfo, businessInfo, url, SessionId }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [weekday, setWeekday] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("Loading location...");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showSplash, setShowSplash] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return ErrorMessage("Email and password are required");
    }

    try {
      setLoading(true);
      const response = await fetch(`${url}/api/v1/Login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData: Encrypt(formData),
        }),
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

      dispatch(
        loginSuccess({
          user: decryptedUser,
          business: data.Tenant,
          SessionId: data.SessionId,
          rustyRoof:data.rustyRoof
        })
      );

      setShowSplash(true);
      setFormData({ email: "", password: "" });

      const sanitizedCompanyName = data.Tenant
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      const dashboardUrl = `/${sanitizedCompanyName}/${Encrypt(
        decryptedUser._id
      )}`;

      setTimeout(() => {
        setLoading(false);
        router.push(dashboardUrl);
      }, 5000);
    } catch (error) {
      setShowSplash(false);
      setLoading(false);
      setFormData({ email: "", password: "" });

      ErrorMessage(error.message || "Something went wrong");
      dispatch(loginFailure(error.message || "Login failed"));
    }
  };

  const isLoggedIn = userInfo && businessInfo && SessionId === userInfo?.SessionId;

  return (
    <div
      className="min-h-screen bg-cover bg-fixed bg-no-repeat"
      style={{
        backgroundImage: "url('/bg.jpg')",
      }}
    >
      <AnimatePresence>
        {showSplash && <BadeSplashScreen />}
      </AnimatePresence>

      <Nav1
        user={userInfo}
        business={businessInfo}
        page={userInfo ? "dashboard" : "Bade"}
      />

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col md:flex-row gap-8 items-end relative z-10">
          {!isLoggedIn ? (
            <Card className="w-[380px] max-w-full bg-white/90 backdrop-blur-md border-0 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <Link href="/" className="flex items-center gap-3">
                  <Image
                    src="/bade.jpg"
                    alt="Bade Logo"
                    width={48}
                    height={48}
                    className="rounded-xl shadow-sm"
                  />
                </Link>
                <h2 className="text-3xl font-semibold text-gray-900">Log in</h2>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-12 bg-gray-50 border-gray-200 focus:border-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/Forgot_password"
                        className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-12 bg-gray-50 border-gray-200 focus:border-gray-400"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-medium bg-black hover:bg-gray-900 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                  <Link
                    href="/SalesPortal"
                    className="mt-2 inline-block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white border border-white/20 rounded py-3 px-6 font-medium  transition"
                  >
                    Access Sale portal →
                  </Link>
                </form>

                {/* Event Card */}
                <div className="mt-8 bg-white rounded-3xl p-8 relative overflow-hidden border border-gray-100">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full opacity-60 blur-2xl" />

                  <div className="flex justify-between gap-4 items-start relative z-10">
                    <div>
                      <div className="text-4xl font-bold text-gray-800 leading-none">
                        {weekday}
                      </div>
                      <div className="text-3xl font-light text-gray-400 -mt-1">
                        {date}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600 mt-2">
                      <div>
                        {time}
                        <br />
                        <span className="text-xs text-gray-500">How&apos;s {location} today?</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/Marketers"
                    className="mt-8 inline-block w-full text-center bg-black text-white border border-white/20 rounded-full py-3 px-6 font-medium hover:bg-gray-900 transition"
                  >
                    Refer and Earn →
                  </Link>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                  Business Automated Dynamic Enterprise!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-sm w-full bg-white shadow-xl p-6 flex items-center gap-5">
              <Image
                src={userInfo?.image || businessInfo?.companyLogo || "/bade.jpg"}
                alt="User"
                width={72}
                height={72}
                className="rounded-2xl shadow-md object-cover"
              />
              <div>
                <h3 className="font-semibold text-xl text-amber-950">
                  Welcome back, {userInfo?.firstName || "User"}!
                </h3>
                <p className="text-gray-600 mt-1">Glad to see you again.</p>
              </div>
            </Card>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 -z-10 flex items-end justify-center pointer-events-none">
          <div className="w-[420px] h-[420px] bg-gradient-to-br from-[#f5ede7] to-[#e7e3df] rounded-full absolute left-1/2 -translate-x-1/2 bottom-0 blur-3xl opacity-70" />
          <div className="w-40 h-40 bg-gradient-to-br from-orange-200 to-orange-400 rounded-full absolute left-12 bottom-12 blur-2xl opacity-60" />
          <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-300 rounded-full absolute right-20 bottom-24 blur-xl opacity-50" />
        </div>
      </div>

      {userInfo && businessInfo ? <Footer2 /> : <Footer1 />}
    </div>
  );
}



// demo screen brfore login
export function BadeSplashScreen() {
  const [visible, setVisible] = useState(true);
  const [glow, setGlow] = useState(false);
  const timeout = 10000

  useEffect(() => {
    const glowTimer = setTimeout(() => {
      setGlow(true);
    }, 1800);

    let navigationTimer;

    const redirectTimer = setTimeout(() => {
      setVisible(false);
    }, timeout);

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(redirectTimer);

      if (navigationTimer) {
        clearTimeout(navigationTimer);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex flex-col items-center"
          >
            <div className="absolute inset-0 rounded-full bg-white/10 blur-3xl" />

            <motion.h1
              animate={{
                textShadow: glow
                  ? [
                      "0 0 10px rgba(255,255,255,0.5)",
                      "0 0 25px rgba(255,255,255,0.8)",
                      "0 0 50px rgba(255,255,255,1)",
                    ]
                  : "0 0 0px rgba(255,255,255,0)",
                scale: glow ? [1, 1.03, 1] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: glow ? Infinity : 0,
                ease: "easeInOut",
              }}
              className="relative text-xl font-black uppercase tracking-[0.4em] text-white md:text-md"
            >
              B.A.D.E
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-center text-sm uppercase tracking-[0.3em] text-zinc-500"
            >
              Business Automated Dynamic Enterprise
            </motion.p>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "220px" }}
              transition={{ duration: timeout / 1000, ease: "linear" }}
              className="mt-8 h-[2px] rounded-full bg-white/70"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


