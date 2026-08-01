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
import {useParams} from "next/navigation"

const SearchCard = ({ data, module, UserData, selected, onToggle, showCheckbox }) => {
  const [auth] = useState(UserData.business.companyName);
  const [Tenant] = useState(Encrypt(UserData.user._id));
  const [Module, setModule] = useState(module);
  const [link, setLink] = useState("");
  const Path = useParams()

  useEffect(() => {
    let normalizedModule = module.toLowerCase();
    switch (normalizedModule) {
      case "stores":
        normalizedModule = "store";
        break;
      case "purchases":
        normalizedModule = "purchases";
        break;
      case "debit-note":
        normalizedModule = "debit-note";
        setLink(`/${Path.auth}/V4/${Path.searchProduct}/accounting/debit-note/debit-note/${Encrypt(data._id)}`);
        break;
      case "credit-note":
        normalizedModule = "credit-note";
        setLink(`/${Path.auth}/V4/${Path.searchProduct}/accounting/credit-note/credit-note/${Encrypt(data._id)}`);
        break;
      case "product-transfer":
        normalizedModule = "product-transfer";
        setLink(`/${Path.auth}/V4/transfer/transfer/${Encrypt(data._id)}`);
        break;
      case "sales":
        if (data.billStatus === "Draft") {
          setLink(`/${Path.auth}/V4/${Path.searchProduct}/${Path.searchProduct}/Draft/${Encrypt(data._id)}`);
          return;
        } else {
          setLink(`/${Path.auth}/V4/${Path.searchProduct}/${Path.searchProduct}/${Encrypt(data._id)}`);
        }
        normalizedModule = "Sales";
        break;
      default:
        break;
    }
    setModule(normalizedModule);
    if (!link) {
      setLink(`/${Path.auth}/V4/${Path.searchProduct}/${Path.searchProduct}/${Encrypt(data._id)}`);
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
    module === "purchases" ? data.billReferenceNo : "",
    data.billReferenceNo === "" ? data.customerName : data.billReferenceNo,
    data.productName,
    data.Username,
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
      <div className="flex items-center gap-4 ">
        <MagnifyingGlassIcon className="h-7 w-7 text-purple-400" />
        <CardContent className="flex flex-col justify-center w-full p-0">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link href={link} className="block w-full">
                <CardTitle className="text-sm font-semibold  truncate">
                  {truncate(title)}
                </CardTitle>
                <Separator className="my-2" />
                <Badge variant={subtitle === "Cancelled" ? "destructive" : "outline"}>
                  {subtitle}
                </Badge>
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <p className="text-sm font-medium">{title}</p>
              <Separator className="my-2" />
              <Badge variant={subtitle === "Cancelled" ? "destructive" : "outline"}>
                  {subtitle}
              </Badge>
            </HoverCardContent>
          </HoverCard>
        </CardContent>
      </div>
    </Card>
  );
};

export default SearchCard;
