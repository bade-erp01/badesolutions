import SingleCustomerpage from './page';
import { fetchUser } from '../../../../../../../Functions/useerDataRefresh';
import {Dencrypt} from '../../../../../../../Functions/Functions'
import axios from 'axios'

export default async function StoreLayout2({ params }) {
  const userData = await fetchUser();
  const decoy = await params
  
  //   send request t get single customer
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  const res = await axios.get(`${baseUrl}/api/crm/SingleLead?id=${Dencrypt(decoy.id)}`, {
      headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${userData.business.tenantId}`},
     cache: 'no-store', // Ensures fresh data on every request
      //   next: {
      //   revalidate: 60 ,// revalidate every 60 seconds
      //   cache: "force-cache"
      // }
    })
    
    const data = await res.data

  return (
    <div>
      <SingleCustomerpage userInfo={userData} data={data} cust={data.result} />
    </div>
  );
}

