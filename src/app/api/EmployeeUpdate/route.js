import dbConnect from "../../../../lib/mongoose";
import Users from "../../../../models/Users";
import business from "../../../../models/Business";
import { ObjectId } from "mongodb";
import { formatMongooseError,Encrypt } from "../../../../Functions/Functions";

// Ensure Mongoose connection is established

// get single user data
// export async function GET(request) {
  //   try {
//     const { searchParams } = new URL(request.url);
//     const userId = searchParams.get('userId');

//     if (!userId) {
//       return new Response('User ID is required', { status: 400 });
//     }

//     const employee = await Users.findById(userId);

//     if (!employee) {
  //       return new Response('User not found', { status: 404 });
//     }

//     return new Response(JSON.stringify(employee), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
  //     return new Response(
//       `Internal Server Error: ${error.message}`,
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// }



// update a user data
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, form, ...updateData } = body;
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Missing ID parameter." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const updateFields = form || updateData;
    if (!Object.keys(updateFields).length) {
      return new Response(
        JSON.stringify({ error: "No fields provided for update." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    await dbConnect("BadeAdmin");
    const result = await Users.findByIdAndUpdate(new ObjectId(id), updateFields, { new: true });


    if (!result) {
      return new Response(
        JSON.stringify({ error: "User not found." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Update Complete."}),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: formatMongooseError(error)}),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}



// put request to update users app
export async function PUT(request) {
try {
    // Ensure database connection is established (already done above)
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id || !updateData) {
      return new Response(
        JSON.stringify({ error: "Missing required query parameters." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    await dbConnect("BadeAdmin");
    
      const employee = await Users.findById(id);
      if (!employee) {
        throw new Error("Employee not found");
      }

      // Check for an existing app in the employee's Apps array
      const existingApp = employee.Apps.find(app => app._id.toString() === updateData.object._id);

      if (existingApp) {
        // Remove the app from the Apps array
        const result = await Users.updateOne(
          { _id: employee._id },
          { $pull: { Apps: { _id: updateData.object._id } } }
        );
        if (result.modifiedCount > 0) {
          return new Response(
            JSON.stringify({ message: "App Access Removed successfully" }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }
        throw new Error("Something went wrong while removing the app");
      } else {
        // Look up the module in the business modules
        const Business = await business.findOne({ tenantId: employee.tenantId });
        const accessTo = Business.modules.find(
          module => module._id.toString() === updateData.object._id
        );
        if (!accessTo) {
          throw new Error("Module not found");
        }

        const updatedEmployee = await Users.findByIdAndUpdate(
          id,
          {
            $push: {
              Apps: {
                Name: accessTo.Name,
                url: accessTo.url,
                icon: accessTo.icon,
                Description: accessTo.description || accessTo.Description,
                _id: accessTo._id,
              },
            },
          },
          { new: true }
        );

        if (updatedEmployee) {
          return new Response(
            JSON.stringify({ message: "App Access Added successfully" }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }
        throw new Error("Update failed");
      }
    } catch (error) {
      // Optionally capture the error audit log if captureAuditLog is available
      // captureAuditLog && captureAuditLog(error.message, request.url, "PUT");
      return new Response(
        JSON.stringify({ error: formatMongooseError(error) }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }