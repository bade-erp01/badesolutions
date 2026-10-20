import { redirect } from "next/navigation";
import { fetchUser } from "../../../../Functions/whoIsSalesPerson";
import { serverApi } from "@/lib/serverApi";
import SubscriptionReminder from "@/app/Components/SubscritionReminder";
import BirthdayGreetings from "@/app/Components/BithdayToast";
import ListScreen from "../_ui/ListScreen";

export const metadata = {
  title: "My customers",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const userData = await fetchUser();

  // Redirect if either user OR business is missing
  if (!userData?.user || !userData?.business || userData.user.status !== "active") {
    redirect(userData?.reason === "elsewhere" ? "/SalesPortal/Login?reason=elsewhere" : "/SalesPortal/Login");
  }

  let items = [];
  let error = "";
  try {
    const res = await serverApi(`/api/Sales_Portal/Route/${userData.user._id}`, {
      cache: "no-store", // personal, changing data: always fresh (it was cached for 60 s, so new lines showed late)
    });
    if (res.ok) {
      items = res.data?.customers || [];
    } else {
      error = "Couldn't load your customers. Please try again.";
    }
  } catch {
    error = "Couldn't load your customers. Please try again.";
  }

  return (
    <>
      <ListScreen userData={userData} module="Customers" items={items} error={error} />
      <SubscriptionReminder Business={userData.business} />
      <BirthdayGreetings Business={userData.business} user={userData.user} />
    </>
  );
}
