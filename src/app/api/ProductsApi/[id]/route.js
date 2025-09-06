import { ObjectId } from 'mongodb';
import dbConnect from "../../../../../lib/mongoose"
import { NextResponse } from 'next/server';
import Vendor from '../../../../../models/Vendors';
import PRODUCTS from '../../../../../models/Products'
import {Dencrypt,formatMongooseError} from '../../../../../Functions/Functions'

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }

    await dbConnect()
    const Product = await PRODUCTS.findById(id).lean();
    
    if (!Product) {
      return NextResponse.json({ error: 'No Product found' }, { status: 404 });
    }
    
    const Vend = await Vendor.findByTenant(Product.tenantId);

    return NextResponse.json({ Product, Vend }, { status: 200 });

  } catch (err) {
    consolle.log(err.message)
    return NextResponse.json({ error: formatMongooseError(err) }, { status: 500 });
  }
}
