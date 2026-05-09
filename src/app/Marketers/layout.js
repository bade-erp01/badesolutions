export const metadata = {
  metadataBase: new URL("https://badesolutions.com.ng"),

  title: {
    default: "Business Automated Dynamic Enterprise (B.A.D.E)",
    template: "%s | B.A.D.E ERP",
  },

  description:
    "B.A.D.E ERP is a cloud-based enterprise resource planning platform that helps businesses manage inventory, accounting, sales, HR, operations, and automation from one centralized system.",

  keywords: [
    "ERP software Nigeria",
    "Cloud ERP",
    "Business automation",
    "Inventory management software",
    "Accounting software Nigeria",
    "Sales management system",
    "Enterprise resource planning",
    "Workflow automation",
    "HR and payroll software",
    "Business management platform",
    "Warehouse management",
    "CRM software",
    "Business Automated Dynamic Enterprise",
    "B.A.D.E ERP",
    "ERP for SMEs",
    "Nigerian ERP solution",
  ],

  authors: [
    {
      name: "Business Automated Dynamic Enterprise",
      url: "https://badesolutions.com.ng",
    },
  ],

  creator: "Business Automated Dynamic Enterprise",

  publisher: "Business Automated Dynamic Enterprise",

  applicationName: "B.A.D.E ERP",

  category: "Business Software",

  classification: "ERP Software",

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://badesolutions.com.ng",
  },

  openGraph: {
    title:
      "B.A.D.E ERP — Cloud-Based Enterprise Resource Planning Platform",

    description:
      "Manage inventory, finance, HR, sales, accounting, and operations from a single ERP platform designed for modern businesses.",

    url: "https://badesolutions.com.ng",

    siteName: "B.A.D.E ERP",

    images: [
      {
        url: "/assets/bade.png",
        width: 1200,
        height: 630,
        alt: "B.A.D.E ERP Platform",
      },
    ],

    locale: "en_US",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "B.A.D.E ERP — Business Automation Platform",

    description:
      "Centralize business operations with cloud-based ERP infrastructure built for scalability and automation.",

    images: ["/assets/bade.png"],

    creator: "@badesolutions",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  manifest: "/site.webmanifest",

  themeColor: "#ffffff",

  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },

  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}