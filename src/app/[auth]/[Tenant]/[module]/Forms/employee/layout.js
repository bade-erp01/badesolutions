import NewEmployeeForm from "./page"
import { fetchUser } from '../../../../../../../Functions/useerDataRefresh';
import Nav1 from '@/app/Components/Nav1';
import BackButton from '@/app/Components/BackBotton';
import Link from "next/link"
import {notFound} from 'next/navigation';
import Footer2 from '@/app/Components/Footer2';

export default async function SetUpLayout({children, params }) {
    const userData = await fetchUser();

    if (!userData.user.isAdmin) {
      notFound();
    }

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
              </nav>
    
            </aside>{" "}
            {/* Main Content Area */}
            <main className="flex-1 ">
              <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-2 relative max-h-[82dvh] overflow-y-auto">
               <NewEmployeeForm userData={userData} />
              </section>
            </main>
          </div>
          <Footer2 />
        </div>
  );
}
