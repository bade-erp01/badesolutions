const BASE_URL = "https://badesolutions.com.ng";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/auth/SignUp"],
        disallow: [
          "/api/",
          "/ingest/", // PostHog proxy
          "/auth/",
          "/*/V4", // the ERP (needs a login; pages also send X-Robots-Tag: noindex)
          "/SalesPortal/",
          "/Order/",
          "/Search/",
          "/timeoff-request/",
          "/onboarding-success",
          "/onbarding-error",
          "/offline",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
