import LandingPage from "./LandingPage";
import { ORG_NAME, SITE_NAME, SITE_URL, SOCIAL_PROFILES, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "B.A.D.E ERP | Cloud ERP Software for Businesses in Nigeria",
  absoluteTitle: true,
  description:
    "B.A.D.E is a cloud ERP for Nigerian businesses. Manage inventory, accounting, POS and sales, HR and payroll, CRM, warehouses and NRS e-invoicing in one secure system.",
  path: "/",
});

// Structured data: tells Google who runs the site and what the product is.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: ORG_NAME,
      alternateName: ["B.A.D.E", "BADE", SITE_NAME],
      url: SITE_URL,
      logo: `${SITE_URL}/icons/icon-512.png`,
      areaServed: "NG",
      sameAs: Object.values(SOCIAL_PROFILES),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-NG",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Enterprise Resource Planning (ERP)",
      operatingSystem: "Web browser (installable on Android and iOS)",
      description:
        "Cloud ERP for inventory, accounting, POS and sales, HR and payroll, CRM, warehouses and NRS e-invoicing.",
      featureList: [
        "Inventory and warehouse management",
        "Accounting and financial reporting",
        "Point of sale (POS) and sales management",
        "HR and payroll",
        "CRM",
        "Sales force app for field sales teams",
        "NRS e-invoicing integration",
      ],
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- static JSON built above, no user data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }}
      />
      <LandingPage />
    </>
  );
}
