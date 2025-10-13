import React, { Suspense, lazy } from 'react';
import { fetchUser } from '../../../../../../../Functions/useerDataRefresh';
import { Dencrypt } from '../../../../../../../Functions/Functions';
import axios from 'axios';
import Employee from "../../../../../../../models/Users";
import SuspenenseFallBack from '@/app/Components/SuspenenseFallBack';

const SingleCustomerpage = lazy(() => import('./page'));

export default async function StoreLayout2({ params }) {
  const userData = await fetchUser();
  const decoy = await params;
  let data = {};
  const staffRaw = await Employee.findByTenant(userData.business.tenantId);
  const StringedStaff = JSON.stringify(staffRaw);
  const ParsedStaff = JSON.parse(StringedStaff);

  try {
    const baseUrl = process.env.EXPRESS_PRIVATE_URL;

    const res = await axios.get(`${baseUrl}/api/crm/${Dencrypt(decoy.id)}`, {
      headers: {
        'Content-Type': 'application/json',
        dbConnect: `Bearer ${userData.business.rustyRoof}`,
        Authorization: `Bearer ${userData.business.tenantId}`,
      },
    });

    data = await res.data; // ✅ No need to await this
  } catch (err) {
    return (
      <div className="text-red-500 p-6">
        Failed to load. Please try again later.
      </div>
    );
  }

  return (
    <Suspense fallback={<SuspenenseFallBack  pagedata={`${data.result?.Username}`}/>}>
      <SingleCustomerpage
        userInfo={userData}
        data={data}
        cust={data.result}
        salesPerson={ParsedStaff}
      />
    </Suspense>
  );
}
