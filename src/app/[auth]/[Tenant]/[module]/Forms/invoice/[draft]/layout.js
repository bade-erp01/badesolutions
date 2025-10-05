import DraftInvoicePage from './page';
import { fetchUser } from '../../../../../../../../Functions/useerDataRefresh';
import axios from 'axios';
import { notFound } from 'next/navigation';

export default async function StoreLayout2({ params }) {
  const userData = await fetchUser();
  const decoy = await params;

  const baseUrl = process.env.EXPRESS_PRIVATE_URL;

  try {
    const res = await axios.get(`${baseUrl}/api/Invoice/${decoy.draft}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userData.business.tenantId}`,
        dbConnect:`Bearer ${userData.business.rustyRoof}`,
      }
    });

    const data = await res.data;

    // 🚫 If invoice data is missing or undefined
    if (!data ) {
      return notFound();
    }

    return (
      <div>
        <DraftInvoicePage user={userData.user} customer={data.cust} bill={data.Inv} products={data.products} Business={userData.business} Whouse={data.wareHouse} />
      </div>
    );
  } catch (error) {
    return notFound(); // Or show a more graceful error component if you prefer
  }
}
