import { ObjectId } from 'mongodb';
import dbConnect from "../../../../../lib/mongoose"
import { NextResponse } from 'next/server';
import Vendor from '../../../../../models/Vendors';
import { WHouse } from '../../../../../models/Stores';
import {Dencrypt,formatMongooseError,Encrypt} from '../../../../../Functions/Functions'
import Account from '../../../../../models/BankAccount';
import CreditCustomerPayment from '../../../../../models/Creditpayment';
import  sendEmailNotification from '../../../../../EmailTrigers/sendEmailNotification';

export async function GET(req, {params}) {
  try {
    const { id } = await params;

     const authHeader = req.headers.get("authorization");
     if (!authHeader || !authHeader.startsWith("Bearer ")) {
       return new Response(JSON.stringify({ message: "Unauthorized" }), {
         status: 401,
         headers: { "Content-Type": "application/json", },
       });
     }

    const token = authHeader.split(' ')[1];
    const tenantId = Dencrypt(token);

    await dbConnect();
    const vendorId = Dencrypt(id);
    
    if (!ObjectId.isValid(vendorId)) {
      return Response.json({ error: 'Invalid vendor ID' }, { status: 400 });
    }
    
    // find customer tenant id findByTenant
    const vendor = await Vendor.findById(vendorId)
    const WH = await WHouse.findByTenant(tenantId)
    
    if(!vendor || !WH){
      return Response.json(
      { error: 'No Not found' },
      { status: 404 }
    );
    }

    return Response.json({vendor,WH}, { status: 200 });

  } catch (error) {
    return Response.json(
      { error: formatMongooseError(error) },
      { status: 500 }
    );
  }
}



//post payment
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const customerId = Dencrypt(body.customer);
    const cust = await Customer.findById(customerId);

    const refrecechecker = await CreditCustomerPayment.findByTenant(cust.tenantId)

    const existingref = refrecechecker.find((ref)=>{
      return ref.paymentReferenceNo === body.paymentReferenceNo
    })

     if (existingref) {
      return NextResponse.json({ error: `"payment Reference" already exists.` }, { status:503 });
    }



    // Find customer
    if (!cust) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Calculate new debt and account balance
    const newDebt = cust.Debt - Number(body.Amount);
    const account = await Account.findById(cust.BankJournal);
    const newBalance = Number(account.Balance) + Number(body.Amount);

    // Record payment
    const payment = await CreditCustomerPayment.createForTenant(cust.tenantId,{
      PaymentDate: body.Date,
      Accountant: body.Accountant,
      bankAccount: cust.BankJournal,
      paymentReferenceNo: body.paymentReferenceNo,
      crAmount: body.Amount,
      drAmount: 0,
      cr: true,
      BillNo: cust._id,
      customer: cust._id,
      collectionRef: 'PMNT',
      previousBalance: newBalance,
      remarks: `Payment recorded on ${body.Date}`,
      status: 'pending',
      image:'https://img.icons8.com/dusk/64/cash-in-hand.png'
    });

    if (!payment) {
      throw new Error('Failed to create payment');
    }

    return NextResponse.json({
      message: 'Payment successfully registered and pending confirmation.',
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: formatMongooseError(err) }, { status: 500 });
  } 
}
