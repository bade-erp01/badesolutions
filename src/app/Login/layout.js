import { pageMetadata } from "@/lib/seo";

import {fetchUser} from "../../../Functions/useerDataRefresh"
import Login from './page'

export const metadata = pageMetadata({
  title: "Log In to B.A.D.E ERP",
  description: "Log in to your B.A.D.E ERP account to manage your business.",
  path: "/Login",
});

export default async function layout({ children,params }) {
  
    const userData = await fetchUser();
    const userInfo = userData.user;
    const businessInfo = userData.business; 
    const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  return <>
        < Login userInfo={userInfo} businessInfo={businessInfo} url={baseUrl}/>
        </>;
}
