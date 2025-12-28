import CustomerCategoryPieChart from "@/app/Components/CustomerCategory";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Card from "@/app/Components/Card";
import axios from "axios";
import { Encrypt } from '../../../../../../Functions/Functions';

export default async function CustomerListpage({ params }) {
  const userData = await fetchUser();
  try {
    let customerListWithImages = [];
    const moduleParams = await params;
    try {
      const baseUrl = process.env.EXPRESS_PRIVATE_URL;

      const res = await axios.get(`${baseUrl}/api/crm`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
          access: `${Encrypt(userData.user._id)}`,
        },
      });

      customerListWithImages = res.data; // ✅ Fix: axios returns data in `res.data`, not `res.json()`
    } catch (error) {
      return (
        <div className="text-red-500 p-6">
          Failed to load CRM layout. Please try again later.
        </div>
      );
    }

    return (
      <div className=" ">
        {/* Dashboard */}
        {userData.user.c_levelDash && (
          <div className="shadow-xl bg-white/60 backdrop-blur-md transition-all duration-700 mb-5">
            <CustomerCategoryPieChart customersList={customerListWithImages} userData={userData} />
          </div>
        )}

        {/* Customer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {customerListWithImages.sort((a, b) => a.Username.localeCompare(b.Username)).map((element) => (
            <Card
              key={element._id}
              data={element}
              module={moduleParams.module}
            />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    
    return <div className="text-black">Failed to load customer data.</div>;
  }
}
