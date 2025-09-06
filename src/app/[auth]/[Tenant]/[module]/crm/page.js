import CustomerCategoryPieChart from '@/app/Components/CustomerCategory';
import { fetchUser } from '../../../../../../Functions/useerDataRefresh';
import Card from "@/app/Components/Card"


export default async  function CustomerListpage({ params}) {
   const userData = await fetchUser();
     const module = await params;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${baseUrl}/api/crm`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.business.tenantId}`,
      },
      next: {
        revalidate: 120, // Cache for 2 minutes
      },
    });
   
     const result = await res.json()

return (
  <div className=" ">
    {/* Header Section */}

    {/* Dashboard */}
    {userData.user.c_levelDash && (
      <div className="bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 backdrop-blur-md mb-5">
        <CustomerCategoryPieChart customers={result.CustomerList} invoice={result.Bills} />
      </div>
    )}

    {/* Customer Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
      {result.CustomerList.map((element) => (
        <Card
          key={element._id}
          data={element}
          module={`${module.module}`}
        />
      ))}
    </div>
  </div>
);

}

