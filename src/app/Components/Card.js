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
import { Separator } from "@/components/ui/separator";

const Card = ({ data, module, url }) => {
  const { auth, Tenant } = useParams();

  const truncate = (str, length = 22) =>
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
    `${data.billStatus || ""}/${data.billReferenceNo || ""}`;

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
  const linkHref = url
    ? url
    : `/${auth}/${Tenant}/${module}/${module}/${Encrypt(data._id)}?Modules=${module}`;

  return (
    <HoverCard openDelay={80} closeDelay={120}>
      <HoverCardTrigger asChild>
        <Link
          href={linkHref}
          className="block w-full h-full"
          style={{ textDecoration: "none" }}
        >
          <div
            className="flex flex-row items-center gap-4 bg-white dark:bg-slate-900 
                          border border-gray-200 dark:border-slate-700 
                          hover:border-gray-300 dark:hover:border-slate-600
                          rounded-xl shadow-sm hover:shadow-md 
                          transition-all duration-200 
                          animate__animated animate__fadeInUp 
                          min-h-[88px] p-3 sm:p-4 group"
          >
            <div className="relative flex-shrink-0">
              <Image
                src={imageSrc}
                width={64}
                height={64}
                alt={title || "item"}
                className="rounded-xl object-cover w-16 h-16 shadow-sm 
                           ring-1 ring-gray-200 dark:ring-slate-700 group-hover:ring-orange-200 dark:group-hover:ring-orange-800 transition-all"
                quality={100}
              />
            </div>

            <div className="flex flex-col justify-center flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-slate-100 truncate text-[15px] leading-tight">
                {truncate(title)}
              </p>
              <Separator className="my-2 dark:bg-slate-700" />
              <small className="text-gray-500 dark:text-slate-400 truncate text-sm">
                {truncate(subtitle, 28)}
              </small>
            </div>
          </div>
        </Link>
      </HoverCardTrigger>

      {/* Enhanced Hover Card - Fully Theme Responsive */}
      <HoverCardContent
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 
                   rounded-2xl shadow-xl p-5 w-72 z-50"
        side="top"
        align="start"
        sideOffset={8}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Image
              src={imageSrc}
              width={72}
              height={72}
              alt={title}
              className="shrink-0 rounded-xl object-cover shadow-md ring-1 ring-gray-200 dark:ring-slate-700"
              quality={100}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg text-gray-900 dark:text-white leading-tight break-words">
                {title}
              </p>
              {data.ADCcode || data.ACDcode ? (
                <p className="text-orange-600 dark:text-orange-400 text-sm font-mono mt-1">
                  {data.ADCcode || data.ACDcode}
                </p>
              ) : null}
            </div>
          </div>

          <Separator className="dark:bg-slate-700" />

          <div className="text-sm text-gray-600 dark:text-slate-300 break-words">
            {subtitle || "No additional information"}
          </div>

          {/* Extra Info Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {data.Email && (
              <div className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-3 py-1.5 rounded-lg break-all">
                {data.Email}
              </div>
            )}

            {data.Debt > 0 && (
              <div className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg font-medium">
                Owes:{" "}
                {data.Debt.toLocaleString("en-NG", {
                  style: "currency",
                  currency: "NGN",
                })}
              </div>
            )}

            {data.firstName && data.status && (
              <div
                className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                  data.status === "suspended"
                    ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
                    : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                }`}
              >
                {data.status === "suspended" ? "Inactive" : data.status}
              </div>
            )}

            {data.refNo && data.status && (
              <div className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                {data.status}
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default Card;
