import dbConnect from '../../../../../lib/mongoose';
import {WHouse} from '../../../../../models/Stores';
import {Dencrypt} from '../../../../../Functions/Functions';
import ProductTransfer from '../../../../../models/ProductTransfers'
import { ObjectId } from 'mongodb';


export async function GET(request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const whId = url.searchParams.get('whId');
    const category = url.searchParams.get('category') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const tenantId = authHeader.split(' ')[1];

    if (!ObjectId.isValid(Dencrypt(whId))) {
      return new Response(JSON.stringify({ error: 'Invalid warehouse ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const warehouse = await WHouse.findOne({_id:Dencrypt(whId)}).lean();
    if (!warehouse) {
      return new Response(JSON.stringify({ error: 'Warehouse not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const allBills = await ProductTransfer.findByTenant(tenantId, {
      $and: [{ status: { $ne: "Draft" } }, { whId:warehouse._id }],
    })
      .sort({ billReferenceNo: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const filteredBills = category === 'all'
      ? allBills
      : allBills.filter(bill => bill.status.toLowerCase() === category.toLowerCase());

    const totalCount = await ProductTransfer.findByTenant(tenantId).countDocuments();

    // check for orders
    const PendingOrders = await ProductTransfer.findByTenant(tenantId, {
      $and: [{ status: { $eq: "Approved" } }, { whId:warehouse._id }],
    })

    const responsePayload = {
      deliveredBills: filteredBills,
      PendingOrders,
      display:'Product Transfers',
      pagination: {
        currentPage: page,
        currentCategory:category,
        next: page * limit < totalCount ? { page: page + 1, limit } : null,
        previous: page > 1 ? { page: page - 1, limit } : null,
      },
    };

    console.log(responsePayload)
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.log(error)
    return new Response(
      JSON.stringify({ message: 'Internal Server Error', error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
