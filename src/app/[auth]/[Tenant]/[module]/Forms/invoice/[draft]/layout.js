import DraftInvoicePage from './page';
import { fetchUser } from '../../../../../../../../Functions/useerDataRefresh';
import { Dencrypt } from '../../../../../../../../Functions/Functions';
import axios from 'axios';
import { notFound } from 'next/navigation';

export default async function StoreLayout2({ params }) {
  const userData = await fetchUser();
  const decoy = await params;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  try {
    const res = await axios.get(`${baseUrl}/api/storeApi/invoice/${Dencrypt(decoy.draft)}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userData.business.tenantId}`
      }
    });

    const data = await res.data;

    // 🚫 If invoice data is missing or undefined
    if (!data ) {
      return notFound();
    }

    return (
      <div>
        <DraftInvoicePage user={userData.user} customer={data.customer} bill={data.invoice} products={data.products} Business={userData.business} Whouse={data.wareHouse} />
      </div>
    );
  } catch (error) {
    return notFound(); // Or show a more graceful error component if you prefer
  }
}
