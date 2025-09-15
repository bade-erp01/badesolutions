import mongoose from 'mongoose';
import dbConnect from '../../../../../../lib/mongoose';
import Invoice from '../../../../../../models/Invoices';
import { WHouse, storeProduct } from '../../../../../../models/Stores';
import Customer from '../../../../../../models/Customer';
import {NextResponse} from "next/server"

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // ✅ Validate the ID format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid invoice ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

    const invoice = await Invoice.findById(id).lean();
    // check if there is invoice before proceeding
    if (!invoice) {
      return new NextResponse(JSON.stringify({ error: 'Invoice not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const wareHouse = await WHouse.findById(invoice.whId).lean();
    const customer = await Customer.findById(invoice.customer).lean();
    //find store product that match the tenantId of the warehouse and Whid match the warehouse_id
    const products = await storeProduct.findByTenant(wareHouse.tenantId, {
      $and: [
        { WHIDS: wareHouse._id },
        { isActivated: true }
      ]
    }).lean();


    return new NextResponse(JSON.stringify({invoice,customer,wareHouse,products}), {
      status: 200,
      headers: { 'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=180, stale-while-revalidate=300'
      },
    });
  } catch (error) {

    return new NextResponse(JSON.stringify({ error: 'Server error. Please try again later.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
