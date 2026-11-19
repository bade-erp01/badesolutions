import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "Careers: Sell B.A.D.E ERP and Earn Recurring Commissions",
  description:
    "Join the B.A.D.E team. Help Nigerian businesses modernise their operations with cloud ERP software while earning recurring commissions.",
  path: "/Careers",
  keywords: ["BADE careers", "software sales jobs Nigeria", "ERP sales commission"],
});

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <div className="bg-white text-zinc-900 antialiased">
      {children}
    </div>
  );
}