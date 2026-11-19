import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Why B.A.D.E: One ERP for Inventory, Accounting and Sales",
  description:
    "Scattered tools and spreadsheets cost you visibility. See how B.A.D.E ERP unifies inventory, accounting, POS, HR and payroll, and CRM for Nigerian businesses.",
  path: "/why-bade",
  keywords: ["why use ERP", "ERP benefits", "replace spreadsheets with ERP"],
});

export default function WhyBadeLayout({ children }) {
  return children;
}
