import SingleInvoice from './page';
import { fetchUser } from '../../../../../../../Functions/useerDataRefresh';
import Invoice from '../../../../../../../models/Invoices'
import {Dencrypt} from '../../../../../../../Functions/Functions'
import Customer from  '../../../../../../../models/Customer'

export default async function StoreLayout({ params }) {
  const userInfo = await fetchUser();
  const Inv = await Invoice.findById(Dencrypt(await params?.id)).lean()
  const cust = await Customer.findById(Inv.customer)

  return (
    <div>
      <SingleInvoice userInfo={userInfo} SinglebillItem={JSON.stringify(Inv)} customerList={JSON.stringify(cust)} />
    </div>
  );
}

