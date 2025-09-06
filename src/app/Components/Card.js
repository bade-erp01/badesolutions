"use client";
import Image from "next/image";
import Link from "next/link";
import "animate.css";
import { Encrypt } from "../../../Functions/Functions";
import { useParams } from "next/navigation";

const Card = ({ data, module }) => {
  const { auth, Tenant } = useParams();

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
    `${data.currentQty ? `${data.currentQty} :case,` : ""}${data.pcs ? `${data.pcs}:pcs` : ""}`;

  const imageSrc = data.image || data.QrCode || data.Image || data.icon || "/preview.png";

  const linkHref = `/${auth}/${Tenant}/${module}/${module}/${Encrypt(data._id)}?Modules=${module}`;

  return (
    <Link href={linkHref} title={title} className="block w-full h-full text-xs" style={{ textDecoration: "none" }}>
      <div className="flex flex-row items-center gap-4 bg-white border border-gray-200 rounded-md shadow-sm px-4 py-3 hover:shadow-md transition duration-200 animate__animated animate__fadeInUp min-h-[80px] w-full h-full">
        <Image
          src={imageSrc}
          width={60}
          height={60}
          alt={truncate(title) || "photo"}
          className="rounded-md object-cover w-16 h-16"
          priority
        />
        <div className="flex flex-col justify-center w-full">
          <p className="text-base font-semibold text-gray-800 truncate text-xs">{truncate(title)}</p>
          <small className="text-gray-500 mt-1 text-xs">{truncate(subtitle)}</small>
        </div>
      </div>
    </Link>
  );
};

export default Card;
