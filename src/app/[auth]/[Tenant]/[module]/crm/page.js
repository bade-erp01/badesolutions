import CustomerCategoryPieChart from '@/app/Components/CustomerCategory';
import { fetchUser } from '../../../../../../Functions/useerDataRefresh';
import Card from '@/app/Components/Card';
import Customers from '../../../../../../models/Customer';
import Invoices from '../../../../../../models/Invoices';

export default async function CustomerListpage({ params }) {
  try {
    const userData = await fetchUser();
    const moduleParams = params;

    const [invoiceList, customerList] = await Promise.all([
      Invoices.find({ tenantId: userData.business.tenantId }).lean(),
      Customers.findByTenant(userData.business.tenantId).lean()
    ]);

    return (
      <div className=" ">
        {/* Dashboard */}
        {userData.user.c_levelDash && (
          <div className="bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 backdrop-blur-md mb-5">
            <CustomerCategoryPieChart customersList={customerList} invoiceList={invoiceList} />
          </div>
        )}

        {/* Customer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {customerList.map((element) => (
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
    console.error('Error loading customer list page:', error);
    return <div>Failed to load customer data.</div>;
  }
}
