"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Encrypt } from "../../../Functions/Functions";
import { Badge } from "@/components/ui/badge";

const SearchCard = ({ data, module, UserData, selected, onToggle, showCheckbox }) => {
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
      case "debit-note":
        normalizedModule = "debit-note";
        setLink(`/${auth}/${Tenant}/${Module}/accounting/debit-note/debit-note/${Encrypt(data._id)}`);
        break;
      case "credit-note":
        normalizedModule = "credit-note";
        setLink(`/${auth}/${Tenant}/${Module}/accounting/credit-note/credit-note/${Encrypt(data._id)}`);
        break;
      case "transfers":
        normalizedModule = "transfers";
        setLink(`/${auth}/${Tenant}/transfer/Forms/transfer/${Encrypt(data._id)}`);
        break;
      case "invoice":
        if (data.billStatus === "Draft") {
          setLink(`/${auth}/${Tenant}/invoice/Forms/invoice/${Encrypt(data._id)}`);
          return;
        } else {
          setLink(`/${auth}/${Tenant}/bill/bill/${Encrypt(data._id)}?Modules=bill`);
        }
        normalizedModule = "bill";
        break;
      default:
        break;
    }
    setModule(normalizedModule);
    if (!link) {
      setLink(`/${auth}/${Tenant}/${normalizedModule}/${normalizedModule}/${Encrypt(data._id)}?Modules=${normalizedModule}`);
    }
  }, [auth, Tenant, module, data, link]);

  const truncate = (str, length = 20) =>
    str && str.length > length ? str.substring(0, length) + "..." : str;

  // Optimized title selection
  const titleCandidates = [
    data.firstName,
    data.Name,
    data.WHName,
    data.productName,
    data.Username,
    module === "purchase" ? data.billReferenceNo : "",
    data.billReferenceNo === "" ? data.customerName : data.billReferenceNo,
    data.paymentReferenceNo,
    data.CustomerCode,
    data.CreditId,
    data.DebitId,
    data.customer,
    data.refNo,
    data.Description,
    
  ];
  const title = titleCandidates.find(Boolean) || "";

  // Optimized subtitle selection
  const subtitleCandidates = [
    data.CustomerCode,
    data.Email,
    data.billStatus,
    data.ADCcode,
    data.ACDcode,
    data.status,
    data.currentQty || data.pcs
      ? `${data.currentQty ? `${data.currentQty} :case, ` : ""}${data.pcs ? `${data.pcs}:pcs` : ""}`
      : null,
  ];
  const subtitle = subtitleCandidates.find(Boolean) || "";

  return (
    <Card
      className={cn(
        "relative flex flex-col px-4 py-3 transition hover:shadow-md",
        selected && "border-blue-500"
      )}
    >
      {/* Checkbox only if showCheckbox is true */}
      {showCheckbox && (
        <div className="absolute top-2 left-2">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggle(data._id)}
          />
        </div>
      )}

      {/* Main content row */}
      <div className="flex items-center gap-4 pl-8">
        <MagnifyingGlassIcon className="h-6 w-6 text-purple-500" />
        <CardContent className="flex flex-col justify-center w-full p-0">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link href={link} title={title} className="block w-full">
                <CardTitle className="text-sm font-semibold text-gray-800 truncate">
                  {truncate(title)}
                </CardTitle>
                <Separator className="my-2" />
                <Badge variant={subtitle === "cancelled" ? "destructive" : "outline"}>
                  {subtitle}
                </Badge>
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <p className="text-sm font-medium">{title}</p>
              <Separator className="my-2" />
              <Badge variant="outline" className="truncate">{subtitle}</Badge>
            </HoverCardContent>
          </HoverCard>
        </CardContent>
      </div>
    </Card>
  );
};

export default SearchCard;
