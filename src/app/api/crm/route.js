// import dbConnect from "../../../../lib/mongoose"
// import Customer from '../../../../models/Customer'
// import Invoice from '../../../../models/Invoices'
// import moment from 'moment'



// export async function GET(request) {
//   try {
//     const authHeader = request.headers.get('authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return new Response(JSON.stringify({ message: 'Unauthorized' }), {
//         status: 401,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }
//     const token = authHeader.split(' ')[1];
//     await dbConnect()
//     const CustomerList = await Customer.findByTenant(token);
//     // fetch bills for only current month
//    const startOfYear = moment().startOf('year').toDate();
//     const endOfYear = moment().endOf('year').toDate();

//     const Bills = await Invoice.find({
//       tenantId: token,
//       // startDate: { $gte: startOfYear, $lte: endOfYear },
//       billStatus: { $nin: ["Cancelled", "Draft"] },
//     });

//     return new Response(JSON.stringify({ CustomerList: CustomerList, Bills: Bills }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }