"use client";
import { useEffect, useState } from "react";
import Nav1 from "@/app/Components/Nav1";
import Image from "next/image";
import Link from "next/link";
import Footer1 from "@/app/Components/Footer1";
import {
  plsWait,
  SuccessToast,
  ErrorMessage,
} from "../../../../Functions/Mics";
import { loginSuccess, loginFailure } from "../../../../lib/SalesPortalUser";
import { useDispatch, useSelector } from "react-redux";
import { Encrypt, Dencrypt } from "../../../../Functions/Functions";
import Footer2 from "@/app/Components/Footer2";
import { useRouter } from "next/navigation";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Login({ userInfo, businessInfo, url, SessionId }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [weekday, setWeekday] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("Loading location...");
  const [formData, setFormData] = useState({ email: "", password: "" });
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

    setLoading(true);
    plsWait("Verifying Credentials. Please wait...");

    try {
      const response = await fetch(`${url}/Sales_Portal/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData: Encrypt(formData) }),
      });

      const data = await response.json();

      if (response.ok && data.Newcustomer) {
        dispatch(
          loginSuccess({
            salesPerson: Dencrypt(data.Newcustomer),
            SessionId: data.SessionId,
          })
        );

        SuccessToast("Login successful");
        plsWait("Login successful, Redirecting...");

        setFormData({ email: "", password: "" });

        router.push("/SalesPortal/Dashboard");
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      setFormData({ email: "", password: "" });
      ErrorMessage(error.message || "Login failed");
      dispatch(loginFailure(error.message || "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn =
    userInfo &&
    businessInfo &&
    SessionId &&
    Dencrypt(SessionId) === userInfo?.SessionId;

  return (
    <div
      className="min-h-dvh bg-cover bg-center bg-no-repeat md:bg-fixed"
      style={{
        backgroundImage:
          "url('/kvistholt-photography-oZPwn40zCK4-unsplash.jpg')",
      }}
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">SP</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                SalesPortal
              </h1>
              <p className="text-xs text-slate-500 -mt-1">
                Enterprise sales productivity suite
              </p>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative overflow-hidden min-h-dvh flex items-center justify-center p-4">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-end relative z-10 w-full md:w-auto">
          {!isLoggedIn ? (
            <Card className="w-[380px] max-w-full bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <Link href="/" className="flex items-center gap-3">
                  <Image
                    src="/bade.jpg"
                    alt="Bade Logo"
                    width={48}
                    height={48}
                    className="rounded-xl"
                  />
                </Link>
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Log in</h2>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-12 bg-slate-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/Forgot_password"
                        className="text-sm text-slate-500 hover:text-slate-700 hover:underline"
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
                      className="h-12 bg-slate-50"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Sign in to SalesPortal"
                    )}
                  </Button>
                </form>

                {/* Date & Location Card */}
                <Card className="bg-white border border-slate-100">
                  <CardContent className="p-5 sm:p-8 relative overflow-hidden">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-slate-700 to-slate-500 rounded-full opacity-60 blur-2xl" />

                    <div className="flex justify-between items-start gap-3 relative z-10">
                      <div>
                        <div className="text-4xl font-bold text-slate-800 leading-none">
                          {weekday}
                        </div>
                        <div className="text-3xl font-light text-slate-400 -mt-1">
                          {date}
                        </div>
                      </div>
                      <div className="text-right text-sm text-slate-600 min-w-0 break-words">
                        {time}
                        <br />
                        <span className="text-xs">How&apos;s {location} today?</span>
                      </div>
                    </div>

                    <Link
                      href="/Careers"
                      className="mt-8 block w-full text-center bg-slate-900 text-white rounded-full py-3 font-medium hover:bg-slate-800 transition"
                    >
                      Careers →
                    </Link>
                  </CardContent>
                </Card>

                <p className="text-center text-xs text-slate-500">
                  Business Automated Dynamic Enterprise!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-sm w-full bg-white shadow-2xl p-5 sm:p-8">
              <div className="flex items-center gap-4 sm:gap-5">
                <Image
                  src={
                    userInfo?.image ||
                    businessInfo?.companyLogo ||
                    "/bade.jpg"
                  }
                  alt="Profile"
                  width={72}
                  height={72}
                  className="rounded-2xl shadow-md shrink-0"
                />
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 break-words">
                    Welcome back, {userInfo?.firstName || "Sales Rep"}!
                  </h3>
                  <p className="text-slate-600 mt-1">Glad to see you again</p>
                </div>
              </div>

              <Button
                asChild
                className="w-full mt-8 h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
              >
                <Link href="/SalesPortal/Dashboard">
                  Go to Dashboard →
                </Link>
              </Button>
            </Card>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 -z-10 flex items-end justify-center pointer-events-none">
          <div className="w-[min(420px,100vw)] h-[420px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-full absolute left-1/2 -translate-x-1/2 bottom-0 blur-3xl opacity-70" />
          <div className="w-40 h-40 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full absolute left-12 bottom-12 blur-2xl opacity-60" />
        </div>
      </div>

      {userInfo && businessInfo ? <Footer1 /> : <Footer2 />}
    </div>
  );
}