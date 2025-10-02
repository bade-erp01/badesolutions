import dbConnect from "../../../../lib/mongoose";
import mongoose from "mongoose";
import Users from "../../../../models/Users";
import Business from "../../../../models/Business";
import { formatMongooseError } from "../../../../Functions/Functions";
import { Encrypt } from "../../../../Functions/Mics";
import { NextResponse } from 'next/server';


// Replace direct MongoDB client usage with Mongoose models
// Example for GET request
export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const dbHeader = request.headers.get("dbConnect");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!dbHeader || !dbHeader.startsWith("Bearer ")) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }


    const token = authHeader.split(" ")[1];
    const dbtoken = dbHeader.split(" ")[1];
    // Ensure Mongoose connection is established
    await dbConnect(dbtoken);
    const employees = await Users.findByTenant(token);
    return new NextResponse(JSON.stringify(employees), {
      status: 200,
      headers: { "Content-Type": "application/json",
      'Cache-Control': 'public, max-age=180, stale-while-revalidate=300', },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Update other methods (POST, PUT, PATCH, DELETE) similarly to use Mongoose models instead of raw MongoDB client.
export async function POST(request) {
  try {
    await dbConnect();
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
      return new Response(JSON.stringify({ error: "Invalid tenant ID." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // check if the bussiness has a pending license
    const checkLicense = await Business.findOne({ tenantId: token });
    if (!checkLicense.isActive || checkLicense.Pendinglicense < 1) {
      return new Response(
        JSON.stringify({ error: "No unused licenses are available." }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // check email and phone number with data base
    const existingUser = await Users.findOne({
      $or: [{ Email: body.Email }, { telephone: body.telephone }],
    });

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

    // calculate the subscription fee
    const numberOfUsers = parseInt(1);
    const baseAmount = checkLicense.subscriptionplan === "Basic" ? 1500 : 4000;
    const vat = baseAmount * numberOfUsers * 0.075;
    const total = (baseAmount * numberOfUsers + vat) * 12;

    // decrease the pending licience
    await Business.updateOne(
      { _id: checkLicense._id },
      {
        $inc: {
          Pendinglicense: -1,
          SubcriptionAmount: Number(total),
        },
      }
    );

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

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const result = await Users.findByIdAndDelete(id);
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
