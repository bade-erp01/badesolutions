import React from "react";
import { notFound } from "next/navigation";
import CookiesPolicyAlert from "@/app/Components/Cookies";
import Page from "./page";
import { Dencrypt } from "../../../../Functions/Functions";
import BackButton from "@/app/Components/BackBotton";

/**
 * SEO Metadata
 */
export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description:
    "Business Automated Dynamic Enterprise [B.A.D.E] - Automate, Optimize, and Scale Your Business Operations",
  keywords: [
    "Business Automation",
    "Enterprise Solutions",
    "B.A.D.E",
    "AI-powered Business",
    "Workflow Optimization",
    "Process Automation",
  ],
  authors: [{ name: "Business Automated Dynamic Enterprise" }],
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title:
      "Business Automated Dynamic Enterprise [B.A.D.E] | Next-Level Automation",
    description:
      "Streamline your business with AI-driven automation, real-time insights, and scalability",
    url: "https://badesolutions.com.ng",
    siteName: "B.A.D.E",
    images: [
      {
        url: "/assets/bade.png",
        width: 1200,
        height: 630,
        alt: "B.A.D.E Enterprise Automation",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Automated Dynamic Enterprise [B.A.D.E]",
    description:
      "Automate and optimize your enterprise with cutting-edge business solutions",
    images: ["/assets/bade.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

/**
 * Force server-side rendering
 */
export const dynamic = "force-dynamic";

/**
 * Layout Component
 */
export default async function Layout({ params }) {
  /**
   * Await params properly in App Router
   */
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  /**
   * Validate slug existence
   */
  if (!slug) {
    notFound();
  }

  /**
   * Decrypt once only (optimization)
   */
  const decryptedUser = Dencrypt(slug);

  /**
   * Handle invalid/expired token
   */
  if (!decryptedUser || decryptedUser.LeaveDaysCount <= 0) {
    notFound();
  }

  /**
   * Base URL fallback safety
   */
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  return (
    <>
      <nav className="sticky top-0 z-20 w-full border-b border-slate-200 bg-[#fcfcfcda] p-3 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex flex-1 justify-start">
            <h1 className="text-md font-black tracking-tight text-slate-900">
              Timeout Invitation
            </h1>
          </div>

          <div className="flex flex-1 justify-center">
            
          </div>

         <div className="flex w-auto justify-end">
          <BackButton />
        </div>
        </div>
      </nav>
      <CookiesPolicyAlert />
      <Page baseUrl={baseUrl} user={decryptedUser} />
    </>
  );
}
