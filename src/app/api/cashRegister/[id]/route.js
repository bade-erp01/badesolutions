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

    await dbConnect()
    const payment = await payments.findById(id).lean();
    
    if (!payment) {
      return NextResponse.json({ error: 'No payment found' }, { status: 404 });
    }
    
    const cust = await Customer.findById(payment.customer);
    const bank = await bankJournal.findById(payment.bankAccount);

    return NextResponse.json({ payment, cust, bank }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: formatMongooseError(err) }, { status: 500 });
  }
}
