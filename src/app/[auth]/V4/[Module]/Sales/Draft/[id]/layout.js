import DraftInvoicePage from "./page";
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import axios from "axios";
import { notFound } from "next/navigation";
import BackButton from "@/app/Components/BackBotton";
import { Encrypt } from "../../../../../../../../Functions/Functions";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Notch from "@/app/Components/Notch";

export default async function StoreLayout2({ params }) {
  const userData = await fetchUser();
  const decoy = await params;

  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  try {
    const res = await axios.get(`${baseUrl}/api/Invoice/${decoy.id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
        sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
      },
      next: { revalidate: 120 }, // cache for 2 minutes
    });

    const data = await res.data;

    // If invoice data is missing or undefined
    if (!data) {
      return notFound();
    }

    return (
      <div className="flex flex-col">
        <Notch>
          <BackButton />
          <hr className="my-4 border-gray-700" />
          <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-700">
              {data.Inv.ActivityLog?.map((log, index) => {
                return (
                  <li key={index} className="py-3 px-4 text-xs">
                    <div className="flex justify-between items-center">
                      <span>{log.logMsg}</span>
                    </div>
                    <hr className="border-gray-500" />
                  </li>
                );
              }) || <li className="py-3 px-4 text-sm">No activity logs.</li>}
            </ul>
          </div>
          <Separator className="my-4 border-gray-700" />
          <ProgressDemo count={data.Inv.orders?.length || 0} />
        </Notch>

        {/* Main Content (Right Side) */}
        <main className="flex-1">
          <DraftInvoicePage
            user={userData.user}
            customer={data.cust}
            bill={data.Inv}
            products={data.products}
            Business={userData.business}
            Whouse={data.wareHouse}
          />
        </main>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}

export function ProgressDemo({ count }) {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <h2 className="text-md font-semibold">{200 - count} Order available </h2>
      <Progress
        value={(count / 200) * 100}
        className="h-4  [&>div]:bg-yellow-500"
      />
      <p className="text-sm text-gray-200">
        {count} / 200 orders added to this invoice.
      </p>
    </div>
  );
}
