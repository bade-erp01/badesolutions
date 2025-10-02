import BusinessDatas from './page';
import { fetchUser } from '../../../../../Functions/useerDataRefresh';
import dbConnect from "../../../../../lib/mongoose"
import Nav1 from '@/app/Components/Nav1';
import BackButton from '@/app/Components/BackBotton';
import Link from "next/link"
import Image from 'next/image';
import Footer2 from '@/app/Components/Footer2';
import Business from "../../../../../models/Business";
import { notFound } from 'next/navigation';

export default async function SetUpLayout({children, params }) {
    const userData = await fetchUser();
    const moduleList = await params;

  const business = await Business.findById(moduleList.id).lean()

  if(!business) return notFound()

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
          <Nav1
            user={userData.user}
            business={userData.business}
            page={`${business.companyName}`}
          />
    
          <div
            className="flex flex-1 text-white bt-2"
          >
            {/* Sidebar (collapsible on mobile) */}
            <aside
              className={`bg-[#1e1e20]/70 backdrop-blur-md 
                  text-white px-4 py-6 transition-all duration-300 overflow-y-auto md:block`}
              style={{ maxHeight: "600px", overflowY: "scroll" }}
            >
            <BackButton />
              <hr />
              <nav className="space-y-4  overflow-y-auto ">
                <br/>
                <Link
                 href={`/`}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <h3 className=" text-xs">Next Renual Fee: ₦{business.SubcriptionAmount.toLocaleString()}</h3>
                </Link>
    
      
                {userData?.user?.isAdmin && (
                  <Link
                    href={`/auth/Apps`}
                    className="flex items-center gap-3 p-3 bg-amber-600 rounded-md hover:bg-gray-700 transition  text-xs"
                  >
                    <Image
                      src="https://img.icons8.com/avantgarde/100/apple-app-store.png"
                      width={24}
                      height={24}
                      alt="Settings"
                    />
                    <small>App Store</small>
                  </Link>
                )}
              </nav>
    
              
            </aside>{" "}
            {/* Main Content Area */}
            <main className="flex-1 ">
              <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg  relative z-10 h-[500px] overflow-y-auto">
                <BusinessDatas data={business} userInfo={userData} />
                {/* {children} */}
              </section>
            </main>
          </div>
          <Footer2 />
        </div>
  );
}