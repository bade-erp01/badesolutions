import { redirect } from "next/navigation";
import { fetchUser } from "../../../../Functions/whoIsSalesPerson";
import { serverApi } from "@/lib/serverApi";
import SubscriptionReminder from "@/app/Components/SubscritionReminder";
import BirthdayGreetings from "@/app/Components/BithdayToast";
import ListScreen from "../_ui/ListScreen";

export const metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const userData = await fetchUser();

  // Redirect if either user OR business is missing
  if (!userData?.user || !userData?.business || userData.user.status !== "active") {
    redirect(userData?.reason === "elsewhere" ? "/SalesPortal/Login?reason=elsewhere" : "/SalesPortal/Login");
  }

  let items = [];
  let error = "";
  try {
    const res = await serverApi("/api/Products", {
      cache: "no-store", // personal, changing data: always fresh (it was cached for 60 s, so new lines showed late)
    });
    if (res.ok) {
      // free-of-charge lines ("FOC…") are not products to sell
      items = (res.data?.productList || []).filter((p) => !(p.Name && p.Name.toLowerCase().startsWith("foc")));
    } else {
      error = "Couldn't load products. Please try again.";
    }
  } catch {
    error = "Couldn't load products. Please try again.";
  }

  return (
    <>
      <ListScreen userData={userData} module="Products" items={items} error={error} />
      <SubscriptionReminder Business={userData.business} />
      <BirthdayGreetings Business={userData.business} user={userData.user} />
    </>
  );
}
