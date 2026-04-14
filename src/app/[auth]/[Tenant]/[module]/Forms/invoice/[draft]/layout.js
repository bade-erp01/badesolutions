import DraftInvoicePage from './page';
import { fetchUser } from '../../../../../../../../Functions/useerDataRefresh';
import axios from 'axios';
import { notFound } from 'next/navigation';
import Nav1 from "@/app/Components/Nav1"
import BackButton from "@/app/Components/BackBotton"
import Footer2 from "@/app/Components/Footer2";
import { Encrypt } from '../../../../../../../../Functions/Functions';
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";


export default async function StoreLayout2({ params }) {
  const userData = await fetchUser();
  const decoy = await params;

  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  try {
    const res = await axios.get(`${baseUrl}/api/Invoice/${decoy.draft}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
      },
      next: { revalidate: 120 } // cache for 2 minutes
    });

    const data = await res.data;

    // 🚫 If invoice data is missing or undefined
    if (!data ) {
      return notFound();
    }

    return (
         <div className="flex flex-col">
           {/* Navigation Bar */}
           <Nav1
            user={userData.user}
            business={userData.business}
            page={`${data.Inv.billStatus.toLowerCase() === "draft" 
            ? "Draft" : data.Inv.billStatus.slice(0,3).toUpperCase()} / ${data.Inv.billReferenceNo} / ${data.Inv.invoicelocation}`}/>

       
           {/* Main Content Area */}
           <div className="flex flex-2 max-h-[83vh] overflow-y-hidden">
            {/* Aside (Left Sidebar) */}
            <aside className="w-72 bg-[#1e2939] text-white px-4 py-4 overflow-hidden">
             <BackButton />
             <hr className="my-4 border-gray-700" />
             <nav className="flex-grow">
               <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
               
                <ul className="divide-y divide-gray-700">
                 {data.Inv.ActivityLog?.map((log, index) => {
                   return (
                    <li key={index} className="py-3 px-4 text-xs">
                     <div className="flex justify-between items-center">
                       <span>{log.logMsg}</span>
                     </div>
                     <hr className="border-gray-500" />
                    </li>
                   );
                 }) || <li className="py-3 px-4 text-sm">No activity logs.</li>}
                </ul>
               </div>
               <Separator className="my-4 border-gray-700" />
                <ProgressDemo count={data.Inv.orders?.length || 0} />
             </nav>
            </aside>
       
            {/* Main Content (Right Side) */}
            <main className="flex-1 overflow-hidden">
             <section className=" flex-2 max-w-screen-xl h-[83vh] overflow-y-scroll"> 
              <DraftInvoicePage user={userData.user} customer={data.cust} bill={data.Inv} products={data.products} Business={userData.business} Whouse={data.wareHouse} />
             </section>
            </main>
           </div>
       
           {/* Footer */}
           <Footer2 />
         </div>
        );
  } catch (error) {
    return notFound(); // Or show a more graceful error component if you prefer
  }
}


export function ProgressDemo({count}) {

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <h2 className="text-md font-semibold">{200 - count} Order available </h2>
      <Progress value={(count / 200) * 100} className="h-4  [&>div]:bg-yellow-500" />
      <p className="text-sm text-gray-200">
        {count} / 200 orders added to this invoice.
      </p>

    </div>
  );
}