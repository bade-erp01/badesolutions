import dbConnect from '../../../../../lib/mongoose';
import {Dencrypt} from "../../../../../Functions/Functions"
import vendorList from '../../../../../models/Vendors';
import {storeProduct,WHouse} from '../../../../../models/Stores';
import PurchaseOrder from "../../../../../models/purchaseOrders"
import { ObjectId } from 'mongodb';

export async function GET(request,{params}) {
  try {
      const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return new Response(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        const tenantId = authHeader.split(" ")[1];

        const { id } = await params;
    
        if (!ObjectId.isValid(Dencrypt(id))) {
          return new Response(JSON.stringify({ error: "Something went Wrong" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        await dbConnect();

        // find the purchase by id PurchaseOrder
        const purchase = await PurchaseOrder.findById(Dencrypt(id)).lean()
         if (!purchase) {
          return new Response(JSON.stringify({ error: "Purchase not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        const vendor = await vendorList.findById(purchase.Vendor).lean();
        const ProductList = await storeProduct.findByTenant(Dencrypt(tenantId), {
          WHIDS: purchase.WHID,
          // isActivated:true,
          isAservice: false,Vendor:purchase.Vendor
        }).lean();
        const Stores = await WHouse.findById(purchase.WHID).lean();

    return new Response(JSON.stringify({vendor,ProductList,Stores,purchase}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}