import dbConnect from "../../../../lib/mongoose";
import mongoose from "mongoose";
import Users from "../../../../models/Users";
import Business from "../../../../models/Business";
import { formatMongooseError,Encrypt } from "../../../../Functions/Functions";
import { NextResponse } from 'next/server';
import * as yup from 'yup';


// Update other methods (POST, PUT, PATCH, DELETE) similarly to use Mongoose models instead of raw MongoDB client.
export async function POST(request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const token = authHeader.split(" ")[1];
    if (!mongoose.Types.ObjectId.isValid(token)) {
      return new Response(JSON.stringify({ error: "Something went wrong." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    
    // Example: using a simple manual validation here
    if (!body.Email || !body.telephone || !body.firstName || !body.lastName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // validate user input fields usin joi or yup or any other validation library for sql injection and xss attack
    const userValidationSchema = yup.object().shape({
      Email: yup.string().email('Invalid email').required('Email is required'),
      telephone: yup.string().matches(/^[0-9\s\-\+\(\)]+$/, 'Invalid phone number').required('Phone is required'),
      firstName: yup.string().min(2, 'Name too short').max(100, 'Name too long').required('First name is required'),
      lastName: yup.string().min(2, 'Name too short').max(100, 'Name too long').required('Last name is required'),
    });
    
    try {
      await userValidationSchema.validate(body, { abortEarly: false });
    } catch (validationError) {
      return new Response(
        JSON.stringify({ error: validationError.errors.join(', ') }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // check email and phone number with data base
    const existingUser = await Users.findOne({
      $or: [{ Email: body.Email }, { telephone: body.telephone }],
    }).lean();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Email or Phone Number already exists." }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create a new user for the tenant
    const newUser = await Users.createForTenant(token, body);

    // You can now use `token` for further authentication/authorization logic
    return new Response(
      JSON.stringify({
        message: "New user created successfully.",
        user: Encrypt(newUser._id),
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: formatMongooseError(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    await dbConnect(Encrypt("BadeAdmin"));
    const result = await Users.findByIdAndUpdate(id, updateData, { new: true });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
        error: formatMongooseError(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    await dbConnect(Encrypt("BadeAdmin"));
    const result = await Users.findByIdAndUpdate(id, updateData, { new: true });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
        error: formatMongooseError(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
