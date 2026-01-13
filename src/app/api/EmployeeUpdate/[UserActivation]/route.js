import { ObjectId } from 'mongodb';
import dbConnect from "../../../../../lib/mongoose"
import { NextResponse } from 'next/server';
import userS from '../../../../../models/Users';
import {Dencrypt,Encrypt,formatMongooseError} from '../../../../../Functions/Functions'

export async function PATCH(req, { params }) {
  try {
    const Params = await params;

    if (!ObjectId.isValid(Dencrypt(Params.UserActivation))) {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 });
    }

    await dbConnect(Encrypt("BadeAdmin"))
    const user = await userS.findById(Dencrypt(Params.UserActivation)).select("status").lean();
    
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 404 });
    }

    const status = user.status

    const getUpdateStatus = () => {
        if(status === "suspended"){
            return "active"
        }else{
            return "suspended"
        }
    }
    
    // UPDATE THE USER status
    const updated = await userS.findByIdAndUpdate(user._id, {$set:{status : getUpdateStatus()} });

    return NextResponse.json({ message:'User access updated' }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: formatMongooseError(err) }, { status: 500 });
  }
}
