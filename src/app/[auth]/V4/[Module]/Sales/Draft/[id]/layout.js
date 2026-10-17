import DraftInvoicePage from "./page";
import { fetchUser } from "../../../../../../../../Functions/useerDataRefresh";
import { serverApi } from "@/lib/serverApi";
import { notFound } from "next/navigation";

export default async function StoreLayout2({ params }) {
  const userData = await fetchUser();
  const decoy = await params;

  try {
    const res = await serverApi(`/api/Invoice/${decoy.id}`);
    if (!res.ok) throw new Error(res.error);

    const data = res.data;

    // If invoice data is missing or undefined
    if (!data) {
      return notFound();
    }

    return (
      <div className="flex flex-col">
        {/* Main Content (Right Side) */}
        <main className="flex-1 min-w-0">
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
