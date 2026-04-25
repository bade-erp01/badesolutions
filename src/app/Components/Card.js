"use client";
import Image from "next/image";
import Link from "next/link";
import "animate.css";
import { Encrypt } from "../../../Functions/Functions";
import { useParams } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Card = ({ data, module }) => {
  const { auth, Tenant } = useParams();

  const truncate = (str, length = 20) =>
    str && str.length > length ? str.substring(0, length) + "..." : str;

  const title =
    data.Name ||
    data.firstName ||
    data.WHName ||
    data.productName ||
    data.billReferenceNo ||
    data.Username ||
    data.CustomerCode ||
    data.paymentReferenceNo ||
    data.accountName ||
    data.refNo ||
    `${data.billStatus}/${data.billReferenceNo}`;

  const subtitle =
    data.CustomerCode ||
    data.Email ||
    data.billStatus ||
    data.ADCcode ||
    data.ACDcode ||
    data.status ||
    `${data.currentQty ? `${data.currentQty} :case,` : ""}${
      data.pcs ? `${data.pcs}:pcs` : ""
    }`;

  const imageSrc = data.image || data.Image || data.icon || "/preview.png";
  const linkHref = `/${auth}/${Tenant}/${module}/${module}/${Encrypt(
    data._id
  )}?Modules=${module}`;

  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link
          href={linkHref}
          className="block w-full h-full"
          style={{ textDecoration: "none" }}
        >
          <div className="flex flex-row items-center gap-4 bg-white border border-gray-200 rounded-sm shadow-sm px-4 py-3 hover:shadow-md transition duration-200 animate__animated animate__fadeInUp min-h-20 w-full h-full">
            <Image
              src={imageSrc}
              width={60}
              height={60}
              alt={truncate(title) || "photo"}
              className="rounded-md object-cover w-16 h-16 drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]"
              quality={100}
              priority={true}
            />
            <div className="flex flex-col justify-center w-full">
              <p className="font-semibold text-gray-800 truncate text-sm">
                {truncate(title)}
              </p>
              <Separator />
              <small className="text-gray-500 mt-1 truncate text-xs">
                {truncate(subtitle)}
              </small>
            </div>
          </div>
        </Link>
      </HoverCardTrigger>

      {/* Overlay dropdown */}
      <HoverCardContent
        className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64 z-50"
        side="top"
        align="start"
      >
        <div className="space-y-2">
          <p className="font-semibold text-sm text-gray-900">{title}</p>
          <Separator />
          <p className="text-xs text-gray-600">{subtitle}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.image && (
              < >
                <Image
                  src={imageSrc}
                  width={60}
                  height={60}
                  alt={truncate(title) || "photo"}
                  className="object-cover w-16 h-16"
                  quality={100}
                  priority={true}
                />
                <Separator />
              </>
            )}
            {data.Email && (
              <p variant="outline" className="text-xs">
                {data.Email}
                <Separator />
              </p>
            )}
            {data.ADCcode || data.ACDcode && (
              <span variant="secondary" className="text-xs p-1 bg-blue-300 rounded-md">
                {data.ADCcode || data.ACDcode}
                <Separator />
              </span>
            )}
            {data.Debt > 0  && (
              <p variant="outline" className="text-xs">
                {`Owes: ${data.Debt.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}`}
                <Separator />
              </p>
            )}
            {data.firstName && (
              <span variant="outline" className={`${data.status ==='suspended' ? 'bg-amber-300':"bg-green-300"} p-1 text-xs rounded-md`}>
                {data.status ==='suspended' ? "Inactive" : data.status}
              </span>
            )}
            {data.refNo && (
              <span variant="outline" className={`p-1 text-xs rounded-md`}>
                {data.status}
              </span>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default Card;
