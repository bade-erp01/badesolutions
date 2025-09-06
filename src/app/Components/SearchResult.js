"use client";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import "animate.css";
import { Encrypt } from "../../../Functions/Functions";
import { useState, useEffect } from "react";

const SearchCard = ({ data, module, UserData }) => {
  const [auth] = useState(UserData.business.companyName);
  const [Tenant] = useState(Encrypt(UserData.user._id));
  const [Module, setModule] = useState(module);
  const [link, setLink] = useState("");


  useEffect(() => {
    let normalizedModule = module.toLowerCase();

    switch (normalizedModule) {
      case "stores":
        normalizedModule = "store";
        break;

      case "purchase":
        normalizedModule = "purchase-request";
        break;

      case "invoice":
        if (data.billStatus === "Draft") {
          setLink(`/${auth}/${Tenant}/invoice/Forms/invoice/${Encrypt(data._id)}`);
          return;
        }else{
          setLink(`/${auth}/${Tenant}/bill/bill/${Encrypt(data._id)}?Modules=bill`);
        }
        normalizedModule = "bill";
        break;

      // Add more cases here if needed
      default:
        // Keep original module if no match
        break;
    }

    setModule(normalizedModule);
    if (!link) {
      setLink(`/${auth}/${Tenant}/${normalizedModule}/${normalizedModule}/${Encrypt(data._id)}?Modules=${normalizedModule}`);
    }
  }, [auth, Tenant, module, data, link]);

  const truncate = (str, length = 20) =>
    str && str.length > length ? str.substring(0, length) + "..." : str;

  const title =
    data.firstName ||
    data.Description ||
    data.Name ||
    data.WHName ||
    data.productName ||
    data.billReferenceNo ||
    data.Username ||
    data.CustomerCode ||
    data.paymentReferenceNo ||
    `${data.billStatus}/${data.billReferenceNo}`;

  const subtitle =
    data.CustomerCode ||
    data.Email ||
    data.billStatus ||
    data.ADCcode ||
    data.status ||
    `${data.currentQty ? `${data.currentQty} :case, ` : ""}${data.pcs ? `${data.pcs}:pcs` : ""}`;

  return (
    <Link href={link} title={title} className="block w-full h-full text-xs" style={{ textDecoration: "none" }}>
      <div className="flex flex-row items-center gap-4 bg-white border border-gray-200 rounded-md shadow-sm px-4 py-3 hover:shadow-md transition duration-200 animate__animated animate__fadeInUp min-h-[80px] w-full h-full">
        <MagnifyingGlassIcon className="h-7 w-7 text-purple-500" />
        <div className="flex flex-col justify-center w-full">
          <p className="text-base font-semibold text-gray-800 truncate text-xs">{truncate(title)}</p>
          <small className="text-sm text-gray-500 mt-1 text-xs">{truncate(subtitle)}</small>
        </div>
      </div>
    </Link>
  );
};

export default SearchCard;
