// Shared SEO settings for the public marketing pages.
//
// Every public page gets its own canonical URL from pageMetadata(). Don't put a
// canonical in the root layout: every page that doesn't set one inherits it, and a
// root canonical tells Google that page is a duplicate of the homepage.

export const SITE_URL = "https://badesolutions.com.ng";
export const SITE_NAME = "B.A.D.E ERP";
export const ORG_NAME = "Business Automated Dynamic Enterprise";

// Official social profiles: the footer icons, and sameAs in the homepage structured data.
export const SOCIAL_PROFILES = Object.freeze({
  x: "https://x.com/BADEERP",
  facebook: "https://www.facebook.com/badeErp/",
  instagram: "https://www.instagram.com/bade.solution/",
});
export const WHATSAPP_URL = "https://wa.me/2347044889034";

// Search terms the site targets. Google ignores the keywords meta tag; these only
// help other engines. What counts is the same words in titles, descriptions,
// headings and page copy.
export const CORE_KEYWORDS = [
  "ERP software Nigeria",
  "cloud ERP Nigeria",
  "business management software Nigeria",
  "inventory management software Nigeria",
  "accounting software Nigeria",
  "POS software Nigeria",
  "HR and payroll software Nigeria",
  "CRM software Nigeria",
  "sales force automation",
  "warehouse management software",
  "NRS e-invoicing",
  "ERP for SMEs",
  "B.A.D.E ERP",
  ORG_NAME,
];

/**
 * Metadata for one public page.
 * @param {{ title: string, description: string, path: string, keywords?: string[], absoluteTitle?: boolean }} page
 *   path is the page's own URL path, e.g. "/Pricing" ("/" for the homepage).
 */
export function pageMetadata({ title, description, path, keywords = [], absoluteTitle = false }) {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: [...new Set([...keywords, ...CORE_KEYWORDS])],
    alternates: { canonical: path },
    // Child metadata replaces the parent's openGraph/twitter objects whole, so
    // every field is set here. The share image comes from src/app/opengraph-image.js.
    openGraph: {
      type: "website",
      locale: "en_NG",
      url: path,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

// For pages that must stay out of search results but keep their links followable.
export const NOINDEX = { index: false, follow: true };
