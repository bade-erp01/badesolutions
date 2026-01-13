import dbConnect from '../../../../lib/mongoose';
import Business from '../../../../models/Business';



export async function POST(request) {
  try {
    await dbConnect("BadeAdmin");
    const body = await request.json();
    const newBusiness = await Business.create({
        companyName:body.CompayName,
        email: body.email.trim().toLowerCase(), // Ensure email is trimmed and lowercased
        Tel: body.Tel.trim(), // Ensure phone number is trimmed
    });
    return new Response(JSON.stringify(newBusiness), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // console.log(error.errorResponse)
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: "Something went wrong" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request) {
  try {
    await dbConnect("BadeAdmin");
    const body = await request.json();
    const { id, ...updateData } = body;
    const updatedBusiness = await Business.findByIdAndUpdate(id, updateData, { new: true });
    return new Response(JSON.stringify(updatedBusiness), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: "Something went wrong" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PATCH(request) {
  try {
    await dbConnect("BadeAdmin");
    const body = await request.json();
    const { id, ...updateData } = body;
    const updatedBusiness = await Business.findByIdAndUpdate(id, updateData, { new: true });
    return new Response(JSON.stringify(updatedBusiness), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: "Something went wrong" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
