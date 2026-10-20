import { fetchUser } from "../../../../Functions/whoIsSalesPerson";
import Login from "./page";

export const metadata = {
  title: "Sign in",
  description: "Sign in to the BADE Sales Portal.",
};

export default async function layout() {
  const userData = await fetchUser();
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  return <Login userInfo={userData?.user} businessInfo={userData?.business} url={baseUrl} />;
}
