import React from "react";
import Page from "./page";
import {Dencrypt,Encrypt} from "../../../../Functions/Functions"
import { notFound } from "next/navigation";

// Server components can be async
export default async function Layout({ params }) {
  const baseUrl = process.env.EXPRESS_PRIVATE_URL;
  const  Token  = await params;

  // decode without verifying signature
    const decoded = Dencrypt(Token.id);

    if (!decoded || !decoded.id || !decoded.tenantId) {
      return notFound()
    }

  // find the ware house storekeeper from the bill whId and return the user
  const verifyBillStoreKeeper = await fetch(`${baseUrl}/api/Order/verify/${Encrypt(decoded.id)}`, {
    method: "GET",  
    cache: "no-store",      // disable caching
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Encrypt(decoded.tenantId)}`,
    },
  });

  const invoice = await verifyBillStoreKeeper.json();

  if(!verifyBillStoreKeeper.ok) return (
    <div className="bg-white flex items-center justify-center min-h-screen">
      <div className="text-center">
        {/* <!-- Large 404 --> */}
        <h1 className="inline-block border-r border-gray-300 mr-5 pr-6 text-lg font-bold align-top cursor-pointer">
          Error!
        </h1>

        {/* <!-- Message --> */}
        <div className="inline-block text-left">
          <h2 className="text-sm font-normal text-gray-600 mb-2">
            {invoice.error || "Sorry, We couldn’t complete your request at the moment..!"}
          </h2>
        </div>
      </div>
    </div>
  );

  return <Page invoice={invoice} />;
}

