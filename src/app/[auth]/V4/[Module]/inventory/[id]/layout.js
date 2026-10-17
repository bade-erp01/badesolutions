import SingleStoreProductpage from "./page";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import { serverApi } from "@/lib/serverApi";
import BackButton from "@/app/Components/BackBotton";
import Notch from "@/app/Components/Notch";
import SideNavWrapper from "@/app/Components/sideNavWrapper";

export default async function StoreLayout({ params }) {
  try {
    const userInfo = await fetchUser();
    const param = await params;
    const res = await serverApi(`/api/SingleStorePoduct/${param.id}`);

    const StoreProd = res.data;
    if (!StoreProd) throw new Error(res.error);

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
