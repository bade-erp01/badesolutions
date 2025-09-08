import { ObjectId } from 'mongodb';
import moment from 'moment';
import dbConnect from "../../../../../lib/mongoose"
import { NextResponse } from 'next/server';
import bankJournal from '../../../../../models/BankAccount';
import Customer from '../../../../../models/Customer';
import payments from '../../../../../models/Creditpayment'
import {Dencrypt,formatMongooseError} from '../../../../../Functions/Functions'

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }

    await dbConnect();
    const payment = await payments.findById(id).lean();

    if (!payment) {
      return NextResponse.json({ error: 'No payment found' }, { status: 404 });
    }

    const cust = await Customer.findById(payment.customer);

    let bank = null;
    try {
      bank = await bankJournal.findById(payment.bankAccount);
      if (!bank) {
        console.warn(`Bank account not found for ID: ${payment.bankAccount}`);
      }
    } catch (bankErr) {
      console.error(`Error fetching bank account: ${bankErr.message}`);
      // Optionally include partial response or a specific error
      return NextResponse.json({ 
        payment, 
        cust, 
        bank: null, 
        warning: 'Bank account lookup failed' 
      }, { status: 206 }); // 206 Partial Content
    }

    return NextResponse.json({ payment, cust, bank }, { status: 200 });

  } catch (err) {
    console.error(err.message);
    return NextResponse.json({ error: formatMongooseError(err) }, { status: 500 });
  }
}
