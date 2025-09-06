import dbConnect from "../../../../lib/mongoose"
import Vendor from '../../../../models/Vendors'
import {Dencrypt} from "../../../../Functions/Functions"
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    await dbConnect();
    const VendorList = await Vendor.findByTenant(Dencrypt(token));

    return new NextResponse(JSON.stringify(VendorList), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache for 3 minutes, allow stale while revalidating 5mins
         'Cache-Control': 'public, max-age=180, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.log(error.message)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
