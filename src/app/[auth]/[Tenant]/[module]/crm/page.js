import CustomerCategoryPieChart from "@/app/Components/CustomerCategory";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Card from "@/app/Components/Card";
import axios from "axios";

export default async function CustomerListpage({ params }) {
  try {
    let userData;
    let customerListWithImages = [];
    const moduleParams = await params;
    try {
      userData = await fetchUser();
      const baseUrl = process.env.EXPRESS_PRIVATE_URL;

      const res = await axios.get(`${baseUrl}/api/crm`, {
        headers: {
          "Content-Type": "application/json",
          dbConnect: `Bearer ${userData.business.rustyRoof}`,
          Authorization: `Bearer ${userData.business.tenantId}`,
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
          <div className="bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 backdrop-blur-md mb-5">
            <CustomerCategoryPieChart customersList={customerListWithImages} />
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
    return <div>Failed to load customer data.</div>;
  }
}
