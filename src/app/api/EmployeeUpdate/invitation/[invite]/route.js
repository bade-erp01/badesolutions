import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import userS from '../../../../../../models/Users';
import {Dencrypt,formatMongooseError} from '../../../../../../Functions/Functions'
import {Encrypt} from '../../../../../../Functions/Mics'
import {UserActivationMail} from '../../../../../../EmailTrigers/ActivateUser';
import dbConnect from '../../../../../../lib/mongoose';

export async function PATCH(req, { params }) {
  try {
    const Params = await params;

    if (!ObjectId.isValid(Dencrypt(Params.invite))) {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 });
    }

    await dbConnect(Encrypt("BadeAdmin"))
    const user = await userS.findById(Dencrypt(Params.invite)).lean();
    
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 404 });
    }

    const status = user.firstTimeOnboard

    if(status === true){
        return NextResponse.json({ error: 'User is already onboarded' }, { status: 404 });
    } else {
        // send the onboarding mail 
        await UserActivationMail(user);
    }

    return NextResponse.json({ message:'Invitation will be sent to ' + user.Email }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: formatMongooseError(err) }, { status: 500 });
  }
}
