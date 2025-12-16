import NewEmployeeForm from "./page"
import { fetchUser } from '../../../../../../../Functions/useerDataRefresh';
import Nav1 from '@/app/Components/Nav1';
import BackButton from '@/app/Components/BackBotton';
import Link from "next/link"
import { Encrypt } from '../../../../../../../Functions/Mics';
import Image from 'next/image';
import Footer2 from '@/app/Components/Footer2';

export default async function SetUpLayout({children, params }) {
    const userData = await fetchUser();
    // const module = await params;

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
          <Nav1
            user={userData.user}
            business={userData.business}
            page={`${userData.business.companyName}`}
          />
    
          <div
            className="flex flex-1 text-white bt-2"
          >
            {/* Sidebar (collapsible on mobile) */}
            <aside
              className={`bg-[#1e1e20]/70 backdrop-blur-md 
                  text-white px-4 py-6 transition-all duration-300 overflow-y-auto md:block`}
              style={{overflowY: "hidden" }}
            >
            <BackButton />
              <hr />
              <nav className="space-y-4  overflow-y-auto ">
                <br/>
                <Link
                 href={`/`}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <h3>Next Renual Fee: ₦{userData.business.SubcriptionAmount.toLocaleString()}</h3>
                </Link>
    
      
                {userData?.user?.isAdmin && (
                  <Link
                    href={`/auth/Apps`}
                    className="flex items-center gap-3 p-3 bg-amber-600 rounded-md hover:bg-gray-700 transition"
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
              <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-2 relative max-h-[81dvh] overflow-y-auto">
               <NewEmployeeForm userData={userData} />
              </section>
            </main>
          </div>
          <Footer2 />
        </div>
  );
}

// export default async function EmployeeFormlayout() {
//     const userData = await fetchUser();
//   return (
//     <>
//    <Nav1  user={userData.user} business={userData.business} page={'Employee Form'} />
//     
//     <Footer2 />
//     </>
//   )
// }
