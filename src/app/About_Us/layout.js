import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "About Us: The Company Behind B.A.D.E ERP",
  description:
    "Learn about Business Automated Dynamic Enterprise (B.A.D.E), the Nigerian technology company building intelligent, scalable and easy-to-use cloud ERP software.",
  path: "/About_Us",
  keywords: ["About BADE", "BADE Technologies", "Nigerian ERP company"],
});

export default function AboutPage({children}) {
  return (<>{children}</>);
}