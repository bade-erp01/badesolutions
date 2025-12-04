// import { ObjectId } from 'mongodb';
// import moment from 'moment';
// import dbConnect from "../../../../../lib/mongoose"
// import { NextResponse } from 'next/server';
// import CustomerReport from '../../../../../models/customerReport';
// import Customer from '../../../../../models/Customer';
// import EMPLOYEES from "../../../../../models/Users";
// import Business from "../../../../../models/Business";
// import {Dencrypt,formatMongooseError,Encrypt} from '../../../../../Functions/Functions'
// import Account from '../../../../../models/BankAccount';
// import CreditCustomerPayment from '../../../../../models/Creditpayment';
// import  sendEmailNotification from '../../../../../EmailTrigers/sendEmailNotification';
// import jwt from "jsonwebtoken";

// export async function GET(req, {params}) {
//   try {
//     const { id } = await params;
//     await dbConnect();
//     const customerId = Dencrypt(id);
//     const { searchParams } = new URL(req.url);
//     const start = searchParams.get("Start");
//     const end =  searchParams.get("End");
    
//     if (!ObjectId.isValid(customerId)) {
//       return Response.json({ error: 'Invalid customer ID' }, { status: 400 });
//     }
    
//     // find customer tenant id findByTenant
//     const cust = await Customer.findById(customerId)
    
//     if(!cust){
//       return Response.json({ error: 'Customer not found' }, { status: 404 });
//     }
    
//     const generateDates = (end, start) => {
//       const dates = [];
//       let currentDate = moment(start);
//       while (currentDate <= moment(end)) {
//         dates.push(currentDate.format("YYYY-MM-DD"));
//         currentDate = currentDate.add(1, "days");
//       }
//       return dates;
//     };
    
//     const transcationsRaw = await CustomerReport.findByTenant(cust.tenantId, {
//       customerId,
//     }).lean();
    
    
    
    
//     const transcations = transcationsRaw.filter((payment) => {
//       const dates = generateDates(
//         new Date(end),
//         new Date(start)
//       );
//       const formattedDate = moment(new Date(payment.Date)).format("YYYY-MM-DD");
//       return dates.includes(formattedDate);
//     });

//     const responsePayload = {
//       transcations,
//     };

//     return Response.json(responsePayload, { status: 200 });

//   } catch (error) {
//     return Response.json(
//       { error: formatMongooseError(error) },
//       { status: 500 }
//     );
//   }
// }



// //post payment
// export async function POST(req) {
//   try {
//     await dbConnect();
//     const body = await req.json();
//     const customerId = Dencrypt(body.customer);
//     const cust = await Customer.findById(customerId);

//     const refrecechecker = await CreditCustomerPayment.findByTenant(cust.tenantId)

//     const existingref = refrecechecker.find((ref)=>{
//       return ref.paymentReferenceNo === body.paymentReferenceNo
//     })

//      if (existingref) {
//       return NextResponse.json({ error: `"payment Reference" already exists.` }, { status:503 });
//     }



//     // Find customer
//     if (!cust) {
//       return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
//     }

//     // Calculate new debt and account balance
//     const newDebt = cust.Debt - Number(body.Amount);
//     const account = await Account.findById(cust.BankJournal);
//     const newBalance = Number(account.Balance) + Number(body.Amount);

//     // Record payment
//     const payment = await CreditCustomerPayment.createForTenant(cust.tenantId,{
//       PaymentDate: body.Date,
//       Accountant: body.Accountant,
//       bankAccount: cust.BankJournal,
//       paymentReferenceNo: body.paymentReferenceNo,
//       crAmount: body.Amount,
//       drAmount: 0,
//       cr: true,
//       BillNo: cust._id,
//       customer: cust._id,
//       collectionRef: 'PMNT',
//       previousBalance: newBalance,
//       type: body.type,
//       remarks: `Payment recorded on ${body.Date}`,
//       status: 'pending',
//       image:'https://img.icons8.com/dusk/64/cash-in-hand.png'
//     });

//     if (!payment) {
//       throw new Error('Failed to create payment');
//     }

//     return NextResponse.json({
//       message: 'Payment successfully registered and pending confirmation.',
//       data:payment._id
//     }, { status: 200 });

//   } catch (err) {
//     return NextResponse.json({ error: formatMongooseError(err) }, { status: 500 });
//   } 
// }

// // put request to update customer activitylog
// export async function PUT(req, {params}) {
//   try {
//     await dbConnect();
//     const body = await req.json();
//     const customerId = Dencrypt(params.id);
//     const cust = await Customer.findById(customerId);


//     if (!cust) {
//       return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
//     }

//     const  Encrypt2 = (arg) =>{
//       return jwt.sign(
//         { id: arg },
//         "THESTARTUPWAY", // ✅ Use a secure secret key
//       );
//     }

//     // Update activity log
//     const activity = {
//       activity: body.activity,
//       datetime: moment(body.datetime).format('YYYY-MM-DD HH:mm:ss'),
//       notes: body.notes,
//       status: 'Pending',
//       raisedBy: body.raisedBy,
//       assignTo: Encrypt2(body.assignTo),
//     };

//     // find by id and update activity log
//     const updatedCustomer = await Customer.findByIdAndUpdate(customerId, {
//       $push: {
//         ActivityLog: {
//           $each: [activity],
//           $position: 0
//         }
//       }
//     }, { new: true });


//     // find the staff assigned and push notifiation to the otification array
//     const staff = await EMPLOYEES.findById(body.assignTo);
//     if (staff) {
//       // construct the base url
//       const business = await Business.findOne({ tenantId: cust.tenantId });
//       const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/${business.companyName}/${Encrypt(staff._id)}/crm/${Encrypt(cust._id)}`;

//       // push notification to the staff
//       await EMPLOYEES.findByIdAndUpdate(staff._id, {
//       $push: {
//         Notification: {
//           $each: [{
//             Title: `${body.raisedBy} has assigned a new task to you.`,
//             BASE_URL: BASE_URL,
//             status: 'Unseen'
//           }],
//           $position: 0
//         }
//       }
//     }, { new: true });

//       // send email notification to the staff
//       await sendEmailNotification(staff.Email, {
//         subject: `New Task Assigned: ${body.activity}`,
//         html: `<p>You have been assigned a new task by ${body.raisedBy}.</p><p>Click <a href="${BASE_URL}">here</a> to view the task.</p>`
//       });
//     }

//     if (!updatedCustomer) {
//       return NextResponse.json({ error: 'Failed to update activity log' }, { status: 500 });
//     }

//     return NextResponse.json({ message: 'Activity Scheduled.' }, { status: 200 });

//   } catch (err) {
//     console.log(err.message);
//     return NextResponse.json({ error: formatMongooseError(err) }, { status: 500 });
//   }
// }