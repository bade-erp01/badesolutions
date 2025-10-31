"use client"
import { useState, useEffect,Suspense } from "react";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";



const FinancialOverview = ({ data }) => {
  
  const [isLoading, setIsLoading] = useState(true); // Suspense state

  if (!data || typeof data !== 'object') {
    return <p className="text-red-500">No financial data provided.</p>;
  }


  const allAccounts = Object.entries(data)
  .filter((key) => key !== 'accountCode' )
  .flatMap(([_, category]) =>
    Object.entries(category)
      .filter(([key]) => ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].includes(key))
      .map(([_, account]) => account)
  );
 
  // second flat map
   const accs = allAccounts.flatMap((category) =>// this one gets displayed
    Object.entries(category)
      .filter(([key]) => key !== 'accountCode')
      .map(([_, account]) => account)
  );

  useEffect(()=>{
    setIsLoading(false)
  },[])


  return (
    <Suspense fallback={ <SuspenenseFallBack pagedata={'Charts of account'}/>}>
          <div className="text-white text-xs">
            <div className="mx-auto">
              {/* Filter Component */}
              <div className="border border-white/10 bg-gradient-to-br from-[#6c6c6e] to-[#78787a] p-4 shadow-xl">
                {/* Header */}
                <div className="border-b pb-4 mb-6">
                  <h1 className="text-2xl font-bold text-gray-200">Charts of Account</h1>
                </div>
              </div>
    
              {/* Table Container */}
              <div className="bg-gray-600 shadow-lg border border-white/10">
                {isLoading ? ( // Show loading fallback while data is being fetched
                  <SuspenenseFallBack pagedata={"Charts of Account"}/>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead className="bg-white/10 text-white uppercase text-xs sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left">Code</th>
                            <th className="px-4 py-3 text-left">Description</th>
                            <th className="px-4 py-3 text-left">Account Type</th>
                            <th className="px-4 py-3 text-left">Financial Statement</th>
                          </tr>
                        </thead>
                        <tbody>
                          {accs.sort((a, b) => a.AccountType.localeCompare(b.AccountType)).map((account, index) => (
                            <tr key={index} className="border-b hover:bg-gray-500">
                              <td className="px-4 py-2">{account.code}</td>
                              <td className="px-4 py-2">{account.description}</td>
                              <td className="px-4 py-2">{account.AccountType}</td>
                              <td className="px-4 py-2">{account.reportsTo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
    
                  </>
                )}
              </div>
            </div>
          </div>
        </Suspense>
  );
};

export default FinancialOverview;
