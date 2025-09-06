import dbConnect from '../../../../../lib/mongoose';
import Business from '../../../../../models/Business';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import { Encrypt, } from '../../../../../Functions/Mics';
import {Dencrypt} from '../../../../../Functions/Functions';

export async function GET(request,{params}) {
  const { id } = await params;
 
  try {
    await dbConnect();
    const businesses = await Business.findById(id);
    return new Response(JSON.stringify(businesses), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


export async function PATCH(request,{params}) {
  try {
    await dbConnect();
    const body = await request.json();
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized: No token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    
    const { id } = await params;

    //CHECK IF THE BUSINESSIS ALREADY ACTIVATED
    const biz =  await Business.findById(Dencrypt(id))

    if (!biz.isActive){
      throw new Error('Account update failed. Contact Support.')
    }
    
    const updatedBusiness = await Business.findByIdAndUpdate(biz._id, body, { new: true });
    return new Response(JSON.stringify({data:updatedBusiness, message:'Updated successfully'}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
