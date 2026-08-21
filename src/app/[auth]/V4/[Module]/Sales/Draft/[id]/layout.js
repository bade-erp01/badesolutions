import DraftInvoicePage from "./page";
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import axios from "axios";
import { notFound } from "next/navigation";
import { Encrypt } from "../../../../../../../../Functions/Functions";

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
    return <div>Something went wrong</div>;
  }
}
