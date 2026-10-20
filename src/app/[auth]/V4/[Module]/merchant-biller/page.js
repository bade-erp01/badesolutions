import { notFound } from "next/navigation";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import MerchantBiller from "./MerchantBiller";

export const metadata = {
  title: "Merchant biller | B.A.D.E",
  description: "Raise bills for one merchant at a time and track their delivery",
};

// Merchant biller app: bills that start from a merchant (a vendor), then a customer.
export default async function MerchantBillerPage({ params }) {
  const userData = await fetchUser();
  const user = userData?.user;
  const hasApp = user?.Apps?.some((app) => app.Name === "Merchant biller");
  if (!user || (!hasApp && !user.isAdmin)) return notFound();

  const { auth } = await params;
  return <MerchantBiller auth={auth} userId={user._id} canInvoice={Boolean(user.raiseInvoice || user.isAdmin)} isAdmin={Boolean(user.isAdmin)} />;
}
