export const metadata = {
  title: "About Us | Business Automated Dynamic Enterprise [B.A.D.E]",
  description:
    "Learn about BADE Technologies — a forward-thinking tech company delivering intelligent, scalable, and user-friendly ERP solutions. Built on innovation, integrity, and impact.",
  keywords: [
    "About BADE",
    "BADE Technologies",
    "Business Automated Dynamic Enterprise",
    "ERP Company",
    "Enterprise Resource Planning",
    "Business Automation Company",
    "About Us",
  ],
  authors: [{ name: "Business Automated Dynamic Enterprise" }],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  metadataBase: new URL("https://badesolutions.com.ng"),
  alternates: {
    canonical: "/about",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://badesolutions.com.ng/about",
    siteName: "B.A.D.E Technologies",
    title: "About Us | BADE Technologies",
    description:
      "Discover who we are, what we do, and why businesses choose BADE for intelligent ERP solutions that drive growth and efficiency.",
    images: [
      {
        url: "/assets/bade.png",
        width: 1200,
        height: 630,
        alt: "About BADE Technologies",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "About Us | BADE Technologies",
    description:
      "Learn about BADE — delivering intelligent, scalable ERP solutions built on innovation, integrity, and impact.",
    images: ["/assets/bade.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function AboutPage({children}) {
  return (<>{children}</>);
}