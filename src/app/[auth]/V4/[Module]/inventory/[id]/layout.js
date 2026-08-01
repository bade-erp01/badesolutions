import SingleStoreProductpage from "./page";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import { Encrypt } from "../../../../../../../Functions/Functions";
import BackButton from "@/app/Components/BackBotton";
import Notch from "@/app/Components/Notch";
import SideNavWrapper from "@/app/Components/sideNavWrapper";

export default async function StoreLayout({ params }) {
  try {
    const userInfo = await fetchUser();
    const param = await params;
    const baseUrl = process.env.EXPRESS_PRIVATE_URL;
    const res = await fetch(`${baseUrl}/api/SingleStorePoduct/${param.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
        access: `${Encrypt(userInfo.user._id)}`,
        sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
      },
    });

    const StoreProd = await res.json();

    return (
      <div className="flex flex-col">
        {/* Sidebar */}
        <Notch>
          <BackButton />
          <hr />
          <ul className="divide-y divide-gray-700">
            <li className="py-3 px-4 text-xs text-italic">
              <div className="flex justify-between items-center">
                <span className="text-italic">
                  Exp Date: {StoreProd.ExpDate}
                </span>
              </div>
              <hr className="border-gray-500" />
            </li>

            <li className="py-3 px-4 text-xs text-italic">
              <div className="flex justify-between items-center">
                <span className="text-italic">
                  Last purch. Date: {StoreProd.LastBatchDate}
                </span>
              </div>
              <hr className="border-gray-500" />
            </li>

            <li className="py-3 px-4 text-xs text-italic">
              <div className="flex justify-between items-center">
                <span className="text-italic">
                  Current Batch: {StoreProd.BatchNo}
                </span>
              </div>
              <hr className="border-gray-500" />
            </li>
          </ul>
        </Notch>

        {/* Main Content */}
        <main className="flex-1">
          <SingleStoreProductpage
            userInfo={userInfo}
            storeProduct={StoreProd}
          />
        </main>
      </div>
    );
  } catch (err) {
    return <p className="">Error Loading data. Try again</p>;
  }
}
