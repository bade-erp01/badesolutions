import { Geist, Geist_Mono, Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import ClientProvider from "./ClientProvider";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });

 export const metadata = {
  metadataBase: new URL("https://badesolutions.com.ng"),

  title: {
    default:
      "B.A.D.E ERP Software | Business Automated Dynamic Enterprise",
    template: "%s | B.A.D.E ERP",
  },

  description:
    "B.A.D.E is a cloud-based ERP platform for Nigerian and African businesses. Manage inventory, accounting, HR, payroll, sales, CRM, warehouses, and operations from one secure enterprise system.",

  keywords: [
    "ERP software Nigeria",
    "Cloud ERP",
    "Business automation software",
    "Inventory management system",
    "Accounting software Nigeria",
    "HR and payroll software",
    "CRM software",
    "Enterprise resource planning",
    "Warehouse management software",
    "Business management platform",
    "Sales management software",
    "SME ERP Nigeria",
    "B.A.D.E ERP",
    "Business Automated Dynamic Enterprise",
  ],

  authors: [
    {
      name: "Business Automated Dynamic Enterprise",
      url: "https://badesolutions.com.ng",
    },
  ],

  creator: "Business Automated Dynamic Enterprise",
  publisher: "Business Automated Dynamic Enterprise",

  category: "technology",

  applicationName: "B.A.D.E ERP",

  alternates: {
    canonical: "https://badesolutions.com.ng",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://badesolutions.com.ng",
    siteName: "B.A.D.E ERP",

    title:
      "B.A.D.E ERP Software | Automate and Scale Your Business Operations",

    description:
      "Run your entire business from one ERP platform. Manage inventory, accounting, HR, CRM, payroll, warehouses, and operations with B.A.D.E ERP.",

    images: [
      {
        url: "/assets/bade.png",
        width: 1200,
        height: 630,
        alt: "B.A.D.E ERP Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "B.A.D.E ERP Software | Cloud ERP for Modern Businesses",

    description:
      "Centralize your business operations with B.A.D.E ERP. Inventory, accounting, HR, CRM, payroll, analytics, and automation in one platform.",

    images: ["/assets/bade.png"],

    creator: "@badesolutions",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  manifest: "/site.webmanifest",

  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_CODE",
  },

  other: {
    "theme-color": "#ffffff",
    "color-scheme": "light",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${inter.className} 
          ${dmSans.variable} 
          text-sm sm:text-xs md:text-sm lg:text-base 
          antialiased
        `}
      >
        <div className="min-h-screen flex flex-col isolate bg-gray-100">
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
            {children}
            <Analytics />
          </ClientProvider>
        </div>
      </body>
    </html>
  );
}
