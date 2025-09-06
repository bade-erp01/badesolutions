import SingleStoreProductpage from './page';
import { fetchUser } from '../../../../../../../Functions/useerDataRefresh';
import {Dencrypt} from '../../../../../../../Functions/Functions'

export default async function StoreLayout({ params }) {
  const userInfo = await fetchUser();
  const param = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${baseUrl}/api/storeApi/inventory-items/${param.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ userInfo.business.tenantId}`
    }
  })

  const StoreProd = await res.json()

  return (
    <div>
      <SingleStoreProductpage userInfo={userInfo} storeProduct={StoreProd} />
    </div>
  );
}

