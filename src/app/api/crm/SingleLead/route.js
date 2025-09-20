import { ObjectId } from 'mongodb';
import moment from 'moment';
import dbConnect from "../../../../../lib/mongoose"
import Customer from '../../../../../models/Customer'
import EMPLOYEES from '../../../../../models/Users';
import {WHouse} from '../../../../../models/Stores';
import bankAccount from '../../../../../models/BankAccount';
const NaijaStates = require("naija-state-local-government");
import Location from '../../../../../models/Location';
import CustomerReport from '../../../../../models/customerReport';
import Invoice from '../../../../../models/Invoices';
// import Contacts from '../../../../models/Assets';

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('id');
    const tenantId = req.headers.get('authorization')?.split(' ')[1];


    if (!ObjectId.isValid(customerId)) {
      return Response.json({ error: 'Invalid customer ID' }, { status: 400 });
    }

    const currentYear = moment().format('YYYY');

    const generateDates = (end, start) => {
      const dates = [];
      let currentDate = moment(start);
      while (currentDate <= moment(end)) {
        dates.push(currentDate.format("YYYY-MM-DD"));
        currentDate = currentDate.add(1, "days");
      }
      return dates;
    };

    const result = await Customer.findOne({ _id: new ObjectId(customerId) }).lean();
    const employees = await EMPLOYEES.findByTenant(tenantId).lean();
    const wh = await WHouse.findByTenant(tenantId).lean();
    const Accounts = await bankAccount.findByTenant(tenantId).lean();
    const Region = await Location.findByTenant(tenantId).lean();
    // const Contact = await Contacts.findByTenant(tenantId).lean();

    const transcationsRaw = await CustomerReport.findByTenant(tenantId, {
      customerId,
    }).lean();
    
    const startOfMonth = moment().startOf("month");
    const endOfMonth = moment().endOf("month");
    
    const transcations = transcationsRaw.filter((payment) => {
      const paymentDate = moment(payment.Date);
      return paymentDate.isBetween(startOfMonth, endOfMonth, "day", "[]");
    });

    const invoicesRaw = await Invoice.findByTenant(tenantId, {
      customer: customerId,
     $and: [
          { billStatus: { $ne: "Draft" } },
          { billStatus: { $ne: "Cancelled" } },
        ], 
    }).sort({ _id: 1 }).lean();

    const dates = generateDates(
      moment().endOf('month').format('YYYY-MM-DD'),
      moment().startOf('month').format('YYYY-MM-DD')
    );

    const invoicetranscations = invoicesRaw.filter((payment) => {
      const formattedDate = moment(payment.startDate).format('YYYY-MM-DD');
      return dates.includes(formattedDate);
    });
    
    
    
    const SandS = invoicesRaw.filter((invoices) => {
      return invoices.startDate.substring(0, 4) === currentYear;
    });

    const responsePayload = {
      result,
      employees,
      wh,
      Accounts,
      Region,
      SandS,
      transcations,
      invoicetranscations,
    };

    return Response.json(responsePayload, { status: 200 });

  } catch (error) {
    return Response.json(
      { error: 'Something went wrong', message: error.message },
      { status: 500 }
    );
  }
}
