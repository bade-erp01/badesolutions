"use client";
import MainDash from "@/app/Components/MainDash";
import HrmDashboard from "@/app/Components/HrmDashboard";
import { useUser } from "@/components/UserProvider";
import moment from "moment";
import SubscriptionReminder from "@/app/Components/SubscritionReminder";
import BirthdayGreetings from "@/app/Components/BithdayToast";
import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Snowflake } from "lucide-react";
import "animate.css";
import { Badge } from "@/components/ui/badge";

import InvoiceRealtimeListener from "@/app/Components/InvoiceRealtimeListener";

export default function Dashboard() {
  const { user } = useUser();
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [loadingWeather, setLoadingWeather] = useState(true);

  const languages = [
    "en", // English
    // "fr", // French
    // "es", // Spanish
    // "de", // German
    "yo", // Yoruba
    "ha", // Hausa
    "ig", // Igbo
    "pi", // Nigerian Pidgin English
  ];

  const getRandomLanguage = () =>
    languages[Math.floor(Math.random() * languages.length)];

  // Weather Fetch Function
  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`,
      );

      if (!res.ok) throw new Error("Weather fetch failed");

      const data = await res.json();

      const current = data.current_weather;
      const today = data.daily;

      setWeather({
        temperature: Math.round(current.temperature),
        condition: getWeatherCondition(current.weathercode),
        maxTemp: Math.round(today.temperature_2m_max[0]),
        minTemp: Math.round(today.temperature_2m_min[0]),
        icon: getWeatherIcon(current.weathercode),
      });

      // Try to get city name (reverse geocoding)
      try {
        const geoRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
        );
        const geoData = await geoRes.json();
        setLocationName(geoData.city || geoData.locality || "");
      } catch (e) {
        setLocationName("");
      }
    } catch (error) {
      setWeather(null);
    } finally {
      setLoadingWeather(false);
    }
  };

  const getWeatherCondition = (code) => {
    if ([0].includes(code)) return "Clear sky";
    if ([1, 2, 3].includes(code)) return "Cloudy";
    if ([45, 48].includes(code)) return "Fog";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rain";
    if ([71, 73, 75, 85, 86].includes(code)) return "Snow";
    return "Cloudy";
  };

  const getWeatherIcon = (code) => {
    if ([0].includes(code)) return <Sun className="w-5 h-5 text-amber-500" />;
    if ([1, 2, 3].includes(code))
      return <Cloud className="w-5 h-5 text-gray-500" />;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
      return <CloudRain className="w-5 h-5 text-blue-500" />;
    if ([71, 73, 75, 85, 86].includes(code))
      return <Snowflake className="w-5 h-5 text-sky-300" />;
    return <Cloud className="w-5 h-5 text-gray-500" />;
  };

  // Get user location and weather
  useEffect(() => {
    if (!navigator.geolocation) {
      setLoadingWeather(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(latitude, longitude);
      },
      (error) => {
        console.warn("Geolocation denied or unavailable", error);
        setLoadingWeather(false);
      },
    );
  }, []);

  const getLocalizedGreeting = (name = "Guest", lang = getRandomLanguage()) => {
    const hour = moment().hour();
    const timeOfDay =
      hour >= 5 && hour < 12
        ? "morning"
        : hour >= 12 && hour < 17
          ? "afternoon"
          : hour >= 17 && hour < 22
            ? "evening"
            : "generic";

    const greetings = {
      en: {
        morning: "Good morning",
        afternoon: "Good afternoon",
        evening: "Good evening",
        generic: "Hello",
      },
      // fr: {
      //   morning: "Bonjour",
      //   afternoon: "Bon après-midi",
      //   evening: "Bonsoir",
      //   generic: "Salut"
      // },
      // es: {
      //   morning: "Buenos días",
      //   afternoon: "Buenas tardes",
      //   evening: "Buenas noches",
      //   generic: "Hola"
      // },
      // de: {
      //   morning: "Guten Morgen",
      //   afternoon: "Guten Tag",
      //   evening: "Guten Abend",
      //   generic: "Hallo"
      // },
      yo: {
        // Yoruba
        morning: "Ẹ káàárọ̀",
        afternoon: "Ẹ káàsán",
        evening: "Ẹ káalẹ́",
        generic: "Báwo ni?",
      },
      ha: {
        // Hausa
        morning: "Ina kwana",
        afternoon: "Ina wuni",
        evening: "Barka da yamma",
        generic: "Sannu",
      },
      ig: {
        // Igbo
        morning: "Ụtụtụ ọma",
        afternoon: "Ehihie ọma",
        evening: "Mgbede ọma",
        generic: "Kedu",
      },
      pi: {
        // Nigerian Pidgin English
        morning: "Good morning o",
        afternoon: "Good afternoon o",
        evening: "Good evening o",
        generic: "How far?",
      },
    };

    return `${greetings[lang]?.[timeOfDay] || greetings.en[timeOfDay]}, ${name}.`;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Business Overview
          </h1>
          <Badge
            variant="ghost"
            className="text-muted-foreground mt-1 text-sm whitespace-normal h-auto text-left"
          >
            {getLocalizedGreeting(user?.user?.firstName)}
          </Badge>
        </div>

        {/* Weather Display */}
        {!loadingWeather && weather && (
          <div className="flex items-center gap-3 rounded px-4 py-3 border-0">
            {weather.icon}
            <div>
              <div className="flex items-center gap-2 text-lg font-semibold">
                {weather.temperature}°C
                <span className="text-sm font-normal text-muted-foreground">
                  {weather.condition}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {locationName && `${locationName} • `}
                {weather.minTemp}° / {weather.maxTemp}°
              </div>
            </div>
          </div>
        )}
      </div>
      <InvoiceRealtimeListener
        onInvoiceCreated={(invoiceId) => {
          console.log("Invoice created:", invoiceId);
        }}
      />
      <SubscriptionReminder Business={user?.business} />
      <BirthdayGreetings Business={user?.business} user={user?.user} />

      {/* Dashboards */}
      {user?.user?.c_levelDash || user?.user?.isHRM ? (
        <>
          {user?.user?.c_levelDash && (
            <MainDash userData={user} />
          )}

          {user?.user?.isHRM && (
            <HrmDashboard userData={user} />
          )}
        </>
      ) : (
        <DemoDashboardPlaceholder />
      )}
    </div>
  );
}

export function DemoDashboardPlaceholder() {
  return (
    <div className="space-y-8 animate__animated animate__fadeInUp">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <p className="text-base text-zinc-500">
          You’re viewing a sample dashboard • Access Restricted
        </p>
      </div>

      {/* KPI Cards (Skeletons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Total Revenue", "YoY Growth", "MoM Growth", "Top Warehouse"].map(
          (label, idx) => (
            <div
              key={idx}
              className="dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 min-w-0"
            >
              <p className="text-sm">{label}</p>
              <div className="mt-2 h-6 w-24 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
              <p className="text-xs mt-1 text-zinc-400">Sample data</p>
            </div>
          ),
        )}
      </div>

      {/* Chart Placeholder */}
      <div className="dark:bg-zinc-900 rounded-3xl border p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">Monthly Sales Trend (Demo)</h3>
        </div>

        <div className="w-full h-[260px] sm:h-[380px] flex items-center justify-center">
          <div className="grid grid-cols-12 gap-1 sm:gap-2 w-full h-full items-end">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"
                style={{ height: `${Math.random() * 200 + 50}px` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Access Message */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          This is a demo view. Contact your administrator to request full
          dashboard access.
        </p>
      </div>
    </div>
  );
}
