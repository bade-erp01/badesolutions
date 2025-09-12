// import dbConnect from '../../../../../lib/mongoose';
// import {WHouse} from '../../../../../models/Stores';
// import {Dencrypt} from '../../../../../Functions/Functions';
// import PurchaseOrder from '../../../../../models/purchaseOrders'
// import { ObjectId } from 'mongodb';

// // fet purchse by warehoue
// export async function GET(request) {
//   try {
//     await dbConnect();

//     const url = new URL(request.url);
//     const category = url.searchParams.get('category') || 'all';
//     const page = parseInt(url.searchParams.get('page') || '1');
//     const limit = parseInt(url.searchParams.get('limit') || '10');

//     const authHeader = request.headers.get('authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return new Response(JSON.stringify({ message: 'Unauthorized' }), {
//         status: 401,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }
//     const tenantId = authHeader.split(' ')[1];


//     const allBills = await PurchaseOrder.findByTenant(Dencrypt(tenantId))
//       .sort({ billReferenceNo: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .lean();

//     const filteredBills = category === 'all'
//       ? allBills
//       : allBills.filter(bill => bill.status.toLowerCase() === category.toLowerCase());

//     const totalCount = await PurchaseOrder.findByTenant(Dencrypt(tenantId)).countDocuments();

//     // check for orders
//     const PendingOrders = await PurchaseOrder.findByTenant(Dencrypt(tenantId),
//     //  {$and: [{ status: { $eq: "Draft" } }],}
//     ).sort({ status: 1 })

//     const responsePayload = {
//       deliveredBills: filteredBills,
//       PendingOrders,
//       display:'Purchase',
//       pagination: {
//         currentPage: page,
//         currentCategory:category,
//         next: page * limit < totalCount ? { page: page + 1, limit } : null,
//         previous: page > 1 ? { page: page - 1, limit } : null,
//       },
//     };

//     return new Response(JSON.stringify(responsePayload), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });

//   } catch (error) {
//     return new Response(
//       JSON.stringify({ message: 'Internal Server Error', error: error.message }),
//       {
//         status: 500,
//         headers: { 'Content-Type': 'application/json' },
//       }
//     );
//   }
// }


// // update purchase order by ID
// export async function PATCH(request) {
//   try {
//     await dbConnect();

//     // const authHeader = request.headers.get('authorization');
//     // if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     //   return new Response(JSON.stringify({ message: 'Unauthorized' }), {
//     //     status: 401,
//     //     headers: { 'Content-Type': 'application/json' },
//     //   });
//     // }
//     // const tenantId = authHeader.split(' ')[1];

//     const requestBody = await request.json();
//     console.log(requestBody)
//     const { id, updateData } = requestBody;

//     if (!id || !updateData) {
//       return new Response(JSON.stringify({ message: 'Invalid request data' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const updatedOrder = await PurchaseOrder.findByTenantAndUpdate(
//       Dencrypt(tenantId),
//       { _id: ObjectId(id) },
//       { $set: updateData },
//       { new: true }
//     );

//     if (!updatedOrder) {
//       return new Response(JSON.stringify({ message: 'Purchase order not found' }), {
//         status: 404,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     return new Response(JSON.stringify(updatedOrder), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });

//   } catch (error) {
//     return new Response(
//       JSON.stringify({ message: 'Internal Server Error', error: error.message }),
//       {
//         status: 500,
//         headers: { 'Content-Type': 'application/json' },
//       }
//     );
//   }
// }

