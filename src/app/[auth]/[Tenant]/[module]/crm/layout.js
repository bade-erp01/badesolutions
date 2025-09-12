import CustomerListpage from './page';
import { fetchUser } from '../../../../../../Functions/useerDataRefresh';
import Customers from '../../../../../../models/Customer';
import Nav1 from '@/app/Components/Nav1';
import BackButton from '@/app/Components/BackBotton';
import DebtorsReportModal from "@/app/Components/Reports/DebtorsReport";
import ReceivablesAgingModal from "@/app/Components/Reports/AgingSchedul";
import Link from "next/link";
import { Encrypt } from '../../../../../../Functions/Mics';
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import BulkUploader from "@/app/Components/BulkUploadProduct";
import Footer2 from '@/app/Components/Footer2';
import {
  ChartPieIcon,
  ClipboardDocumentListIcon,
  PlusCircleIcon
} from "@heroicons/react/24/outline";

export default async function crmLayout({ children, params }) {
  try {
    const userData = await fetchUser();
    const moduleParams = params;

    const customerList = await Customers.findByTenant(userData.business.tenantId).lean();

    return (
      <div className="flex flex-col h-screen">
        <Nav1
          user={userData.user}
          business={userData.business}
          page={moduleParams.module}
          Module={customerList}
        />

        <div className="flex flex-1 overflow-hidden text-white">
          {/* Sidebar */}
          <aside className="bg-[#1e1e20]/70 backdrop-blur-md w-72 px-4 py-6 overflow-hidden">
            <BackButton />
            <hr />
            <nav className="space-y-4">
              {userData?.user?.createCustomer && (
                <Link
                  href={`/${userData.business.companyName
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")}/${Encrypt(userData.user._id)}/Module/Forms/${moduleParams.module.toLowerCase()}`}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <PlusCircleIcon className="h-6 w-6 text-gray-100" />
                  <span className="text-xs">Create Customer</span>
                </Link>
              )}

              {userData?.user?.raiseInvoice && (
                <Link
                  href={`/${userData.business.companyName
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")}/${Encrypt(userData.user._id)}/invoice/invoice`}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <ClipboardDocumentListIcon className="h-6 w-6 text-gray-100" />
                  <span className="text-xs">Invoicing</span>
                </Link>
              )}

              {userData?.user?.isAdmin && (
                <>
                  <BulkUploader
                    tenantId={userData.business.tenantId}
                    collectionName="customer"
                  />
                  {customerList.length > 0 && (
                    <ExcelDownloadBtn
                      data={customerList}
                      page="CRM list"
                    />
                  )}
                </>
              )}

              <DebtorsReportModal data={customerList} />
              <ReceivablesAgingModal data={customerList} />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-6">
              {children}
            </section>
          </main>
        </div>

        <Footer2 />
      </div>
    );
  } catch (error) {
    console.error("CRM Layout failed to load:", error);
    return <div className="text-red-500 p-6">Failed to load CRM layout.</div>;
  }
}
