import SingleStoreProductpage from "./page";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import { Encrypt } from "../../../../../../../Functions/Functions";
import Nav1 from "@/app/Components/Nav1";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import Link from "next/link";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

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
      },
    });

    const StoreProd = await res.json();

    return (
      <div className="flex flex-col min-h-screen overflow-hidden">
        <Nav1
          user={userInfo.user}
          business={userInfo.business}
          page={StoreProd.productName}
        />

        <div className="flex flex-1 text-white bt-2">
          {/* Sidebar */}
          <aside
            className="w-70 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[90dvh] md:block"
            style={{ overflowY: "auto" }}
          >
            <h2 className="text-lg font-bold mb-4">Product Management</h2>
            <hr />
            <nav className="space-y-4">
              <BackButton />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <section className="w-full max-w-7xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative z-10 max-h-[83dvh] overflow-y-auto">
              <SingleStoreProductpage
                userInfo={userInfo}
                storeProduct={StoreProd}
              />
            </section>
          </main>
        </div>

        <Footer2 />
      </div>
    );
  } catch (err) {
    return (
      <p className="text-black">
        Error Loading data. Try again later
      </p>
    );
  }
}
