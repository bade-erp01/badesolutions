export default function manifest() {
  return {
    id: "/",
    name: "B.A.D.E ERP | Business Automated Dynamic Enterprise",
    short_name: "BADE",
    description:
      "Cloud ERP for inventory, accounting, HR, payroll, sales, CRM and operations.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#000000",
    theme_color: "#0f172a",
    categories: ["business", "productivity", "finance"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
