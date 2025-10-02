// import dbConnect from '../../../../lib/mongoose';
// import Products from '../../../../models/Products';
// import {Dencrypt} from '../../../../Functions/Functions'
// import {NextResponse} from "next/server"

// export async function GET(request) {
//   try {
//     // const authHeader = request.headers.get('authorization');
//     // const dbConnectHeader = request.headers.get('dbconnect'); 
//     // if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     //   return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
//     //     status: 401,
//     //     headers: { 'Content-Type': 'application/json' },
//     //   });
//     // }

//     // if (! dbConnectHeader || !dbConnectHeader?.startsWith("Bearer ")) {
//     //    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), {
//     //     status: 401,
//     //     headers: { 'Content-Type': 'application/json' },
//     //   });
//     // }
      
//     //   const dbToken = dbConnectHeader.split(" ")[1]
//     //   const token = authHeader.split(' ')[1];

//     //   await dbConnect(dbToken);
//     // const ProductList = await Products.findByTenant(token);
//     return new NextResponse(JSON.stringify(ProductList), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json', 
//       'Cache-Control': 'public, max-age=180, stale-while-revalidate=300' },
//     });
//   } catch (error) {
//     console.log(error.message)
//     return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: error.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }
