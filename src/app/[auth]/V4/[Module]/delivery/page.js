import { notFound } from "next/navigation";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import DeliveryApp from "./DeliveryApp";

export const metadata = {
  title: "Delivery | B.A.D.E",
  description: "Deliveries and delivery people",
};

// Delivery app (on its own, or with the Merchant app): every delivery, and the delivery people.
export default async function DeliveryPage({ params }) {
  const userData = await fetchUser();
  const user = userData?.user;
  const hasApp = user?.Apps?.some((app) => app.Name === "Delivery");
  if (!user || (!hasApp && !user.isAdmin)) return notFound();

  const { auth } = await params;
  return <DeliveryApp auth={auth} isAdmin={Boolean(user.isAdmin)} />;
}
