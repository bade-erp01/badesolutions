import localFont from "next/font/local";
import "./globals.css";
import ClientProvider from "./ClientProvider";
import PostHogProvider from "./Components/PostHogProvider";
import { Analytics } from "@vercel/analytics/next"
import { headers } from "next/headers";
import { CORE_KEYWORDS, ORG_NAME, SITE_NAME, SITE_URL } from "@/lib/seo";

// Self-hosted (latin, variable weight) instead of next/font/google: the Google
// loader crashes the build when Google Fonts returns a file URL without an
// extension ("Cannot read properties of null (reading '1')").
const geistSans = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
});
const dmSans = localFont({
  src: "./fonts/dm-sans-latin-wght-normal.woff2",
  variable: "--font-dm-sans",
  weight: "100 1000",
});

// Defaults for every page. Public pages override title, description and canonical
// with pageMetadata() (src/lib/seo.js); there is deliberately no canonical here.
export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "B.A.D.E ERP | Cloud ERP Software for Businesses in Nigeria",
    template: `%s | ${SITE_NAME}`,
  },

  description:
    "B.A.D.E is a cloud ERP for Nigerian and African businesses: inventory, accounting, POS, sales, HR and payroll, CRM, warehouses and NRS e-invoicing in one system.",

  keywords: CORE_KEYWORDS,

  authors: [{ name: ORG_NAME, url: SITE_URL }],
  creator: ORG_NAME,
  publisher: ORG_NAME,
  category: "Business Software",
  applicationName: SITE_NAME,

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  // The share image comes from src/app/opengraph-image.js.
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: SITE_NAME,
    title: "B.A.D.E ERP | Cloud ERP Software for Businesses in Nigeria",
    description:
      "Run inventory, accounting, POS, sales, HR, payroll and CRM from one cloud ERP built for Nigerian businesses.",
  },

  twitter: {
    card: "summary_large_image",
    title: "B.A.D.E ERP | Cloud ERP Software for Businesses in Nigeria",
    description:
      "Run inventory, accounting, POS, sales, HR, payroll and CRM from one cloud ERP built for Nigerian businesses.",
  },

  icons: {
    icon: [{ url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" }],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  appleWebApp: {
    capable: true,
    title: "BADE",
    statusBarStyle: "black-translucent",
  },

  formatDetection: {
    telephone: false,
  },

  // Google Search Console / Bing Webmaster "HTML tag" verification codes (set on the host).
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } }
      : {}),
  },

  other: {
    "color-scheme": "light",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};


export default async function RootLayout({ children }) {
  // The CSP nonce (src/middleware.js) is per request, so pages can't be
  // prerendered: static HTML would carry no nonce and its scripts would be blocked.
  // Next adds the nonce to its own scripts; use `x-nonce` for any <Script nonce>.
  await headers();

  return (
    // suppressHydrationWarning: theme scripts (the ERP's next-themes, the Sales Portal's
    // dark mode) set <html class> before React loads. It covers this element's own attributes only.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${inter.className} 
          ${dmSans.variable} 
          text-sm lg:text-base
          antialiased overflow-x-hidden
        `}
      >
        <div className="relative min-h-dvh flex flex-col isolate bg-gray-100">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
              className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#2e282b] to-[#2b2b30] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
            /> 
          </div> 
          <ClientProvider>
            <PostHogProvider>
              {children}
              <Analytics />
            </PostHogProvider>
          </ClientProvider>
        </div>
      </body>
    </html>
  );
}
