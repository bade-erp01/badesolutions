"use client";
import "animate.css";
import React, { useState, useEffect } from "react";
import dummyData from "../../../data/dummyData.json";
import Image from "next/image";
import { EXPRESS_PRIVATE_URL } from "../../../../Functions/Functions";
import Nav1 from "@/app/Components/Nav1";
import Footer2 from "@/app/Components/Footer2";
import {
  plsWait,
  ErrorMessage,
  AppDescription,
} from "../../../../Functions/Mics";
import { Encrypt } from "../../../../Functions/Functions";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronDown, ChevronUp, Shield, Zap } from "lucide-react";
import { safeUrlOrNull } from "@/lib/security/safeUrl";

const ModulesPage = ({ userInfo }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      {/* <Nav1
        user={userInfo.user}
        business={userInfo.business}
        page={`App Store`}
      /> */}
      <div className="min-h-dvh bg-linear-to-br from-slate-50 via-white to-slate-100 pt-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="outline" className="mx-auto">
              <Zap className="w-3 h-3 mr-2" />
              Explore Our Ecosystem
            </Badge>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">
              Powerful Modules for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
                Your Business
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Unlock the full potential of your business with our expertly
              crafted modules. From seamless integrations to advanced
              functionalities, designed to streamline operations and drive
              growth.
            </p>

            <div className="flex items-center justify-center gap-2 text-center text-sm text-slate-500 pt-4">
              <Shield className="w-4 h-4 shrink-0" />
              Secured with industry-leading standards
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        {isMounted && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dummyData.map((item, index) => (
                <ModuleCard
                  key={item.id || index}
                  item={item}
                  userInfo={userInfo}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer2 />
    </>
  );
};

const ModuleCard = ({ item, userInfo }) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const TenantId = userInfo?.business._id || "";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePayment = async (module) => {
    try {
      if (!userInfo) {
        window.location.href = "/Pricing";
        return;
      }

      setIsLoading(true);
      plsWait(`Setting up installation for ${module.Name} Module.`);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const request = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/Payment_Collection`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await Encrypt(TenantId)}`,
            sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
            access: `${Encrypt(userInfo.user._id)}`,
          },
          body: JSON.stringify(module),
        }
      );

      const response = await request.json();

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const target = safeUrlOrNull(response.data);
        if (!target) throw new Error("Invalid payment link");
        window.location.href = target;
      }
    } catch (err) {
      console.log(err.message);
      ErrorMessage(`Something went wrong...Please try again`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <Card className="group relative overflow-hidden border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-xl md:hover:scale-105 animate__animated animate__fadeInUp animate__faster">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 flex-1">
            {item.icon && (
              <Image
                src={
                  item.icon.startsWith("http")
                    ? item.icon
                    : `/assets/${item.icon}`
                }
                alt={item.Name}
                width={48}
                height={48}
                className="shrink-0 rounded-lg"
              />
            )}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl text-slate-900 break-words">
                {item.Name}
              </CardTitle>
              {item.installed && (
                <Badge className="mt-2 bg-green-100 text-green-800 border-green-300">
                  ✓ Installed
                </Badge>
              )}
            </div>
          </div>
        </div>
        <CardDescription className="text-slate-600">
          {expanded ? item.Description : `${item.Description.slice(0, 60)}...`}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* Apps List */}
        {expanded && item.apps?.length > 0 && (
          <>
            <Separator className="bg-slate-200" />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Apps in Module ({item.apps.length})
              </p>
              <div className="grid gap-2">
                {item.apps.map((app, index) => (
                  <Dialog key={app.id || index}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="justify-start text-left h-auto min-h-10 p-2 whitespace-normal hover:bg-slate-100"
                        onClick={() => AppDescription(app, item.Name)}
                      >
                        <Image
                          src={app.icon}
                          width={20}
                          height={20}
                          alt={app.Name}
                          className="mr-2 shrink-0"
                        />
                        <span className="text-sm text-slate-700">
                          {app.Name}
                        </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{app.Name}</DialogTitle>
                        <DialogDescription>
                          {app.Description}
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-slate-600 hover:text-slate-900"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Read More
            </>
          )}
        </Button>

        <Separator className="bg-slate-200" />

        {/* Pricing & CTA */}
        {!item.installed && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Price</p>
                <p className="text-2xl font-bold text-slate-900">
                  ₦{item.Amount.toLocaleString()}
                </p>
              </div>
              <Image
                height={40}
                width={100}
                src="/assets/paystack-logo-png_seeklogo-409509-removebg-preview.png"
                alt="Paystack"
                className="opacity-70"
              />
            </div>

            <Button
              onClick={() => handlePayment(item)}
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 text-base"
            >
              {isLoading ? "Processing..." : "Start Your Experience"}
            </Button>
          </>
        )}

        {!userInfo && !item.installed && (
          <Button
            onClick={() => (window.location.href = "/Pricing")}
            variant="outline"
            className="w-full border-slate-300"
          >
            View Plans
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ModulesPage;
