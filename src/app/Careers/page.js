"use client";

import { useState } from "react";
import Image from "next/image";
import Nav1 from "@/app/Components/Nav1";
import Footer1 from "@/app/Components/Footer1";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  BadgeDollarSign,
  Briefcase,
  Globe,
  Users,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function BecomeMarketerPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    experience: "",
    audience: "",
    location: "",
    marketingType: "",
    portfolio: "",
    motivation: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelect = (value) => {
    setFormData({
      ...formData,
      marketingType: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData);

    // send to API here
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Nav1 />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-200">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-zinc-100" />

        <div className="relative max-w-7xl mx-auto px-4 py-14 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700 mb-6">
                BADE Partner Program
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight">
                Join the BADE team.
              </h1>

              <p className="mt-6 text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
                Help businesses modernize operations with BADE ERP while earning
                recurring commissions and growing your professional network.
              </p>

              <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: TrendingUp,
                    title: "Recurring commission",
                  },
                  {
                    icon: Users,
                    title: "Business referrals",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Trusted ERP platform",
                  },
                  {
                    icon: Globe,
                    title: "Remote opportunities",
                  },
                ].map((item, i) => (
                  <Card
                    key={i}
                    className="rounded-2xl border-zinc-200 shadow-sm"
                  >
                    <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                      <div className="h-12 w-12 shrink-0 rounded-xl bg-blue-100 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-blue-700" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium text-sm">{item.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-zinc-200 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop"
                  alt="marketing"
                  width={1200}
                  height={900}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="w-full h-[320px] sm:h-[450px] lg:h-[650px] object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                <div className="absolute bottom-0 p-5 sm:p-8 text-white">
                  <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-blue-200">
                    Partner with BADE
                  </p>

                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mt-3">
                    Build income by connecting businesses to modern ERP systems.
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="py-14 sm:py-24 bg-zinc-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              Apply to become a marketer
            </h2>

            <p className="mt-4 text-zinc-600 max-w-2xl mx-auto">
              Complete the application below. Our partnership team will review
              your information and contact you shortly.
            </p>
          </div>

          <Card className="rounded-3xl border border-zinc-200 shadow-xl bg-white">
            <CardContent className="p-5 sm:p-8 md:p-10">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
              >
                {/* FULL NAME */}
                <div className="space-y-2">
                  <Label>Full name</Label>

                  <Input
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label>Email address</Label>

                  <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* PHONE */}
                <div className="space-y-2">
                  <Label>Phone number</Label>

                  <Input
                    name="phone"
                    placeholder="+234 800 000 0000"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* LOCATION */}
                <div className="space-y-2">
                  <Label>Location</Label>

                  <Input
                    name="location"
                    placeholder="Abuja, Nigeria"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* COMPANY */}
                <div className="space-y-2">
                  <Label>Company / Brand</Label>

                  <Input
                    name="company"
                    placeholder="Optional"
                    value={formData.company}
                    onChange={handleChange}
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* EXPERIENCE */}
                <div className="space-y-2">
                  <Label>Years of marketing experience</Label>

                  <Input
                    name="experience"
                    placeholder="e.g. 3 years"
                    value={formData.experience}
                    onChange={handleChange}
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* TYPE */}
                <div className="space-y-2">
                  <Label>Marketing channel</Label>

                  <Select onValueChange={handleSelect}>
                    <SelectTrigger className="w-full h-12 data-[size=default]:h-12 rounded-xl">
                      <SelectValue placeholder="Select marketing type" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="social-media">
                        Social media marketing
                      </SelectItem>

                      <SelectItem value="field-agent">
                        Field marketing
                      </SelectItem>

                      <SelectItem value="affiliate">
                        Affiliate marketing
                      </SelectItem>

                      <SelectItem value="agency">
                        Marketing agency
                      </SelectItem>

                      <SelectItem value="influencer">
                        Influencer marketing
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* AUDIENCE */}
                <div className="space-y-2">
                  <Label>Audience size / network</Label>

                  <Input
                    name="audience"
                    placeholder="e.g. 20k followers"
                    value={formData.audience}
                    onChange={handleChange}
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* PORTFOLIO */}
                <div className="md:col-span-2 space-y-2">
                  <Label>Portfolio / Website / Social links</Label>

                  <Input
                    name="portfolio"
                    placeholder="https://"
                    value={formData.portfolio}
                    onChange={handleChange}
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* MOTIVATION */}
                <div className="md:col-span-2 space-y-2">
                  <Label>
                    Why do you want to become a BADE marketer?
                  </Label>

                  <Textarea
                    name="motivation"
                    placeholder="Tell us about your experience and why you are interested..."
                    value={formData.motivation}
                    onChange={handleChange}
                    className="min-h-[160px] rounded-2xl"
                  />
                </div>

                {/* SUBMIT */}
                <div className="md:col-span-2 pt-4">
                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl text-base font-medium"
                  >
                    Submit application
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-14 sm:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
              Why partner with BADE?
            </h2>

            <p className="mt-4 text-zinc-600">
              A modern ERP ecosystem built for African businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BadgeDollarSign,
                title: "Competitive commissions",
                desc: "Earn recurring revenue from successful business referrals.",
              },

              {
                icon: Briefcase,
                title: "Professional growth",
                desc: "Expand your business network and strengthen your portfolio.",
              },

              {
                icon: Users,
                title: "Business demand",
                desc: "Businesses increasingly need centralized ERP infrastructure.",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="rounded-3xl border-zinc-200 shadow-sm"
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-blue-700" />
                  </div>

                  <h3 className="mt-6 text-lg sm:text-xl font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-zinc-600 leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer1 />
    </div>
  );
}