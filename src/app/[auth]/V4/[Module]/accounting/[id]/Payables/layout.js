import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import { Encrypt } from "../../../../../../../../Functions/Mics";
import Notch from "@/app/Components/Notch";
import BackButton from "@/app/Components/BackBotton";
import Page from "./page";
import Link from "next/link";
import { CreditCardIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import PayableRegister from "@/app/Components/Reports/PayableRegister";
import { notFound } from "next/navigation";
import SharePdfMinimal from "@/app/Components/ShareViaBluthoot";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description: "Automate, Optimize, and Scale Your Business Operations",
  keywords: [
    "Business Automation",
    "Enterprise Solutions",
    "B.A.D.E",
    "AI-powered Business",
    "Workflow Optimization",
    "Process Automation",
    "ERP in Nigeria",
    "Bernard fidels ogoh",
    "ERP in Abuja",
    "ERP in Lagos",
    "ERP in Port Harcourt",
    "Locally built ERP",
    "ERP for SMEs",
    "ERP for Enterprises",
    "ERP for Startups",
    "ERP for Corporates",
    "AI-powered ERP",
    "AI-driven Business Solutions",
    "AI Automation",
    "Affordable ERP",
    "Scalable ERP Solutions",
  ],
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
  const AccountingFinder = userData.user.Apps.find((app) => {
    return app.Name === "Accounting";
  });

  if (!AccountingFinder) {
    return notFound();
  }

  // check if user has access to crm and cash register
  const StoreFinder = userData.user.Apps.find((app) => {
    return app.Name === "Stores Operations";
  });

  // fetch all credit payment from all bank account
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const [vendors, Banks] = await Promise.all([
    fetch(`${baseUrl}/api/Vendors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
        sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
      },
      next: { revalidate: 120 }, // Revalidate every 2 minutes
    }),

    //  get all banks
    fetch(`${baseUrl}/api/Bank/Accounts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        dbConnect: `Bearer ${userData.business.rustyRoof}`,
        access: `${Encrypt(userData.user._id)}`,
        // sessionKey: `Bearer ${Encrypt(userData.SessionId)}`
      },
      next: { revalidate: 120 }, // Revalidate every 2 minutes
    }),
  ]);

  const VendorList = await vendors.json();
  const BanksList = await Banks.json();

  try {
    return (
      <div className="flex flex-col">
          {/* BLACK SIDEBAR */}
          <Notch>
            <BackButton />
            <hr className="border-gray-100 mb-4" />
              {(userData.user.creditOfficer || userData.user.isAccountant) && (
                <>
                  <Link
                    href={`/${userData.business.companyName.replace(/\s+/g, "")}/${Encrypt(userData.user._id)}/${moduleList.module}/${moduleList.module}/Vendor-CreditNote/Vendor-CreditNote`}
                    title={"Credit Notes"}
                    className="flex items-center gap-3 p-3 rounded-md hover:transition"
                  >
                    <CreditCardIcon className="h-5 w-5 text-gray-100" />
                    <span className="text-xs">Vendor Credit Notes</span>
                  </Link>

                  <Link
                    href={`/${userData.business.companyName.replace(/\s+/g, "")}/${Encrypt(userData.user._id)}/${moduleList.module}/${moduleList.module}/Vendor-DebitNote/Vendor-DebitNote`}
                    title={"Debit Notes"}
                    className="flex items-center gap-3 p-3 rounded-md hover:transition"
                  >
                    <BanknotesIcon className="h-5 w-5" />
                    <span className="text-xs">Vendor Debit Notes</span>
                  </Link>
                </>
              )}

              {StoreFinder && (
                <Link
                  href={`/${userData.business.companyName}/${Encrypt(userData.user._id)}/${StoreFinder.url
                    .toLowerCase()
                    .replace(/\s+/g, "")}/${StoreFinder.url
                    .toLowerCase()
                    .replace(/\s+/g, "")}`}
                  title={StoreFinder.Description || StoreFinder.description}
                  className="flex items-center gap-3 p-3 rounded-md hover:transition"
                >
                  <span className="text-xs">{StoreFinder.Name}</span>
                </Link>
              )}

              <PayableRegister
                banks={BanksList}
                customers={VendorList}
                userData={userData}
                baseUrl={baseUrl}
              />
              <Separator />

              <VendorBadges VendorList={VendorList} />
          </Notch>

          {/* Main Content */}
          <main className="flex-1">
            <Page
                VendorList={VendorList}
                userData={userData}
                baseUrl={baseUrl}
                BanksList={BanksList}
              />
          </main>
        </div>
    );
  } catch (err) {
    return (
      <div className="">
        Failed to load. Please try again later.
      </div>
    );
  }
}

export function VendorBadges({ VendorList }) {
  return (
    <div
      className="flex flex-wrap gap-2  overflow-y-auto p-2 border rounded-md"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgb(227, 219, 228) transparent",
      }}
    >
      {VendorList.map((vendor, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="flex items-center gap-2"
          title={`${vendor.Name}`}
        >
          <span className="font-medium">
            {vendor.Name.length > 10
              ? vendor.Name.slice(0, 10) + "..."
              : vendor.Name}
          </span>
          <span className="text-xs ">
            ₦{Number(vendor.Balance || 0).toLocaleString("en-NG")}
          </span>
        </Badge>
      ))}
    </div>
  );
}
