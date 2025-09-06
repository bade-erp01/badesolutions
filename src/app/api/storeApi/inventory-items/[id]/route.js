import { ObjectId } from 'mongodb';
import dbConnect from "../../../../../../lib/mongoose"
import { NextResponse } from 'next/server';
import {Dencrypt,formatMongooseError} from '../../../../../../Functions/Functions'
import {storeProduct} from '../../../../../../models/Stores';

export async function GET(req, {params}) {
  try {
    const {id} = await params;

    await dbConnect();
    const storeProductId = Dencrypt(id);
    
    if (!ObjectId.isValid(storeProductId)) {
      return Response.json({ error: 'Invalid customer ID' }, { status: 400 });
    }
    
    // find customer tenant id findByTenant
    const product = await storeProduct.findById(storeProductId).lean()
    
    if(!product){
       return Response.json({ error: 'Product not fund' }, { status: 404 });
    }

    return Response.json(product, { status: 200 });

  } catch (error) {
    return Response.json(
      { error: formatMongooseError(error) },
      { status: 500 }
    );
  }
}