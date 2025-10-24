import { ObjectId } from 'mongodb';
import dbConnect from "../../../../../../lib/mongoose"
import { NextResponse } from 'next/server';
import userS from '../../../../../../models/Users';
import {Dencrypt,formatMongooseError} from '../../../../../../Functions/Functions'
import {userOnboardingMail} from '../../../../../../EmailTrigers/OnboardUser';

export async function PATCH(req, { params }) {
  try {
    const Params = await params;

    if (!ObjectId.isValid(Dencrypt(Params.invite))) {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 });
    }

    await dbConnect()
    const user = await userS.findById(Dencrypt(Params.invite)).lean();
    
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 404 });
    }

    const status = user.firstTimeOnboard

    if(status === true){
        return NextResponse.json({ error: 'User is already onboarded' }, { status: 404 });
    } else {
        // send the onboarding mail 
        await userOnboardingMail(user);
    }

    return NextResponse.json({ message:'Invitation email will be sent to ' + user.Email }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: formatMongooseError(err) }, { status: 500 });
  }
}
