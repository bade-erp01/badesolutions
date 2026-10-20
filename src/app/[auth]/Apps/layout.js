export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E] || Apps Store",
  description: "Business Automated Dynamic Enterprise [B.A.D.E] - Automate, Optimize, and Scale Your Business Operations",
  keywords: ["Business Automation", "Enterprise Solutions", "B.A.D.E", "AI-powered Business", "Workflow Optimization", "Process Automation"],
  author: "Business Automated Dynamic Enterprise",
  robots: "index, follow", // Allows search engines to index and follow links
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#f4a8ff", // Sets browser tab color (good for branding)
  ogTitle: "Business Automated Dynamic Enterprise [B.A.D.E] | Next-Level Automation",
  ogDescription: "Streamline your business with AI-driven automation, real-time insights, and scalability",
  ogImage: "favicon.ico", // Preview image when shared on social media
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "favicon.ico",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription: "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "favicon.ico",
  favicon: "favicon.ico",
};
import ModulesPage from './page'
import { fetchUser } from '../../../../Functions/useerDataRefresh';
import { notFound, redirect } from 'next/navigation';

export default async function Appslayout({children}) {
   const userInfo = await fetchUser();

   // logged out (no business in the session): log in first instead of crashing
   if (!userInfo?.business) redirect("/Login")
   if(userInfo.business.subscriptionplan !== "Standard")  return notFound()


  return <>
  {/* {children} */}
  <ModulesPage userInfo ={userInfo} />
  </>
}
