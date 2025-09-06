import dbConnect from '../../../../lib/mongoose';
import Business from '../../../../models/Business';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export async function GET(request) {
  try {
    await dbConnect();
    // const businesses = await Business.find();
    // return new Response(JSON.stringify(businesses), {
    //   status: 200,
    //   headers: { 'Content-Type': 'application/json' },
    // });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const plainPassword = Math.random().toString(36).slice(-8); // Generate an 8-character password
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized: No token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.TenantToken);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    
    // check if the module already exsist in the business Module list
    // const Biz = await Business.findByTenant(decoded.id)
    const Biz = await Business.findOne({tenantId:decoded.id})
    
    
    if(!Biz){
      throw new Error('Somethings Went terribly wrong')
    }

    // Batch update instead of looping async for each app
    const moduleArray = body.apps.map(({ id, Name, url, icon, installed, Description, alt, Amount }) => ({
      id, Name, url, icon, installed, Description, alt, Amount
    }));

     // Efficient update using `$addToSet` with `$each`
    const updateQuery = {
      $addToSet: { modules: { $each: moduleArray } }
    };

    const result = await Business.updateOne({ tenantId: decoded.id }, updateQuery);
 
    // run the payment api here
    // ✅ Prepare payment payload securely
    const payload = {
      email: Biz.email,
      amount: Number(body.Amount) * 100, // Convert to kobo
      callback_url: `http://localhost:3001/`,
      metadata: {
        customer_id: `${Biz.companyName}${Biz.tenantId}`,
        description: `BADE MODULE PAYMENT ${body.Name}`,
        order:body
        },
        reference: `${plainPassword}`,
        currency: "NGN",
      };
      
      // ✅ Make the payment request
      const response = await axios.post("https://api.paystack.co/transaction/initialize", payload, {
        headers: {
          Authorization: `Bearer sk_test_42066a7b8c1579c5f947ad9b3519420f5860dfb7`, // ✅ Uses decrypted API key
          "Content-Type": "application/json",
        },
        timeout: 10000, // ✅ 10s timeout for better error handling
      });
     

    if (response.data?.data?.reference && response.data?.data?.authorization_url) {
       return new Response(JSON.stringify({ data: response.data.data.authorization_url }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
    } else {
      console.error("⚠️ Paystack Initialization Failed:", response.data);
     throw new Error("⚠️ Failed to initialize payment.")
    }
   
  } catch (error) {
    console.log(error)
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...updateData } = body;
    const updatedBusiness = await Business.findByIdAndUpdate(id, updateData, { new: true });
    return new Response(JSON.stringify(updatedBusiness), {
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

export async function PATCH(request) {
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
    
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.EMAILTOKEN);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    //CHECK IF THE BUSINESSIS ALREADY ACTIVATEDD
    const biz =  await Business.findById(decoded.id)

    if (biz.isActive){
      throw new Error('Account is already Active.')
    }
    

    const updatedBusiness = await Business.findByIdAndUpdate(decoded.id, body, { new: true });
    return new Response(JSON.stringify({message:updatedBusiness}), {
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

export async function DELETE(request) {
  try {
    await dbConnect();
    const { id } = await request.json();
    const deletedBusiness = await Business.findByIdAndDelete(id);
    return new Response(JSON.stringify(deletedBusiness), {
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