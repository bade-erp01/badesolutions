import SingleStoreProductpage from './page';
import { fetchUser } from '../../../../../../../Functions/useerDataRefresh';
import {Encrypt} from '../../../../../../../Functions/Functions'

export default async function StoreLayout({ params }) {
 try{
   const userInfo = await fetchUser();
  const param = await params
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const res = await fetch(`${baseUrl}/api/SingleStorePoduct/${param.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ userInfo.business.tenantId}`,
       dbConnect:`Bearer ${userInfo.business.rustyRoof}`,
       access:`${Encrypt(userInfo.user._id)}`
    }
  })

  const StoreProd = await res.json()

  return (
    <div>
      <SingleStoreProductpage userInfo={userInfo} storeProduct={StoreProd} />
    </div>
  );
 }catch(err){
   return (
    <p className='text-black'>
    Error Loading data. Try again later
    </p>
  );
 }
}

