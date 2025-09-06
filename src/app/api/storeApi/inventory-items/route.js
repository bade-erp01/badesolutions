import dbConnect from "../../../../../lib/mongoose";
import { WHouse, storeProduct } from "../../../../../models/Stores";
import { Dencrypt } from "../../../../../Functions/Functions";
import { ObjectId } from "mongodb";
import moment from "moment";
import {NextResponse} from "next/server"

export async function GET(request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const whId = url.searchParams.get("whId");
    const category = url.searchParams.get("category") || "all";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const tenantId = authHeader.split(" ")[1];

    if (!ObjectId.isValid(Dencrypt(whId))) {
      return new NextResponse(JSON.stringify({ error: "Invalid warehouse ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json",
        'Cache-Control': 'public, max-age=180, stale-while-revalidate=300'
       },
      });
    }

    const warehouse = await WHouse.findOne({ _id: Dencrypt(whId) }).lean();
    if (!warehouse) {
      return new NextResponse(JSON.stringify({ error: "Warehouse not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const allBills = await storeProduct
      .findByTenant(tenantId, {
        WHIDS: warehouse._id,
        isAservice: false,
      })
      .sort({ currentQty: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const filteredBills =
      category === "all"
        ? allBills
        : allBills.filter(
            (bill) => bill.status.toLowerCase() === category.toLowerCase()
          );

    const totalCount = await storeProduct
      .findByTenant(tenantId)
      .countDocuments();

    // check for orders
    const PendingOrders = await storeProduct.findByTenant(tenantId, {
      $and: [{ status: { $eq: "Approved" } }, { whId: warehouse._id }],
    });

    const responsePayload = {
      deliveredBills: allBills,
      PendingOrders,
      display: " Inventory",
      pagination: {
        currentPage: page,
        currentCategory: category,
        next: page * limit < totalCount ? { page: page + 1, limit } : null,
        previous: page > 1 ? { page: page - 1, limit } : null,
      },
    };

    return new NextResponse(JSON.stringify(responsePayload), {
      status: 200,
      headers: { "Content-Type": "application/json",
        'Cache-Control': 'public, max-age=180, stale-while-revalidate=300'
       },
    });
  } catch (error) {
    return new NextResponse(
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

export async function PATCH(request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const productId = url.searchParams.get("id");
    // extract product ID from URL

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const tenantId = authHeader.split(" ")[1];
    const body = await request.json();

    if (!ObjectId.isValid(Dencrypt(productId))) {
      return new Response(JSON.stringify({ error: "Invalid product ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingProduct = await storeProduct.findByTenant(
      Dencrypt(tenantId),
      { _id: Dencrypt(productId) }
    );
    if (!existingProduct || existingProduct.length === 0) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updatedFields = {
      currentQty: body.currentQty,
      pcs: body.pcs,
      isActivated: body.isActivated,
    };

    const activityMessage = `Adjusted to ${body.currentQty} C, ${
      body.pcs
    } R, on ${moment().format("l")} by admin`;

    await storeProduct.updateOne(
      { _id: Dencrypt(productId) },
      {
        $set: updatedFields,
        $push: {
          ActivitiyLog: {
            $each: [
              {
                message: activityMessage,
              },
            ],
            $position: 0,
          },
        },
      }
    );

    return new Response(
      JSON.stringify({
        message: "Product updated successfully",
        data: updatedFields,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
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
