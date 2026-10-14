import Notch from "@/app/Components/Notch";
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import { Separator } from "@/components/ui/separator";
import {Encrypt} from "../../../../../../../../Functions/Mics"
import { notFound } from 'next/navigation';
import BackButton from "@/app/Components/BackBotton";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Automate, Optimize, and Scale Your Business Operations",
  keywords: [/* ...keywords omitted for brevity... */],
  author: "Business Automated Dynamic Enterprise",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, theme-color=#f4a8ff",
  ogTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  ogDescription: "Streamline your business with AI-driven automation",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "/assets/bade.png",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription: "Automate and optimize your enterprise",
  twitterImage: "/assets/bade.png",
  favicon: "favicon.ico",
};

export default async function AccountingPage({ children, params }) {
  const userData = await fetchUser();
  const moduleList = await params;
  
    // check if user has access to crm and cash register
    const AccountingFinder = userData.user.Apps.find(app=>{
      return app.Name === "Accounting"
    })
  
    if(!AccountingFinder){
      return notFound()
    }

  try {
  
    return (
      <div className="flex flex-col">
        <Notch>
          <BackButton/>
          <Separator className="my-2" />
        </Notch>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    );
  } catch (err) {
    return (
      <div className="text-black p-6">
        Failed to load. Please try again later.
      </div>
    );
  }
}
