"use client";

import React, { useState } from "react";
import moment from "moment";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Encrypt } from "../../../../Functions/Functions";

// Child component for each customer card
function CustomerCard({ customer, index, today }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="shadow-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="flex flex-row items-center gap-4 cursor-pointer">
            <Avatar>
              <AvatarFallback>
                {customer.Username?.trim().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>
                <Link
                  href={`/SalesPortal/Customers/${Encrypt(customer._id)}`}
                  className="hover:underline"
                >
                  {customer.Username}
                </Link>
              </CardTitle>
              <CardDescription>Visit #{index + 1}</CardDescription>
            </div>
            {/* Arrow icon */}
            <svg
              className={`w-5 h-5 transform transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </CardHeader>
        </CollapsibleTrigger>

        {isOpen && <Separator className="mt-1" />}

        <CollapsibleContent>
          <CardContent className="flex flex-col md:flex-row md:gap-6 mt-4">
            {/* Customer Info */}
            <div className="md:w-1/2 space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="font-medium">Code:</span>
                <Badge variant="secondary">{customer.CustomerCode}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Contact Person:</span>
                <Badge variant="outline">{customer.ContactPerson}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Tel:</span>
                <Badge variant="outline">{customer.phone}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Address:</span>
                <Badge variant="secondary" className={`flex-wrap`}>
                  {customer.deliveryAddress || customer.billingAddress}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Email:</span>
                <Badge variant="outline">{customer.Email}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">Route Days:</span>
                {customer.RouteDays?.map((day, idx) => {
                  const isToday = day.date.toLowerCase() === today;
                  return (
                    <Badge
                      key={idx}
                      className={
                        isToday
                          ? "bg-green-700 text-white"
                          : "bg-gray-700 text-gray-100"
                      }
                    >
                      {day.date}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Google Map */}
            <div className="md:w-1/2 mt-4 md:mt-0">
              <div className="w-full h-40 rounded-lg overflow-hidden border">
                {customer.latitude && customer.longitude ? (
                  <iframe
                    title="Customer Location"
                    src={`https://www.google.com/maps?q=${customer.latitude},${customer.longitude}&z=15&output=embed`}
                    className="w-full h-full"
                    loading="lazy"
                  ></iframe>
                ) : (
                  <iframe
                    title="Customer Location"
                    src={`https://maps.google.com/maps?q=${customer.state}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full"
                    loading="lazy"
                  ></iframe>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function Page({ userInfo, data }) {
  const today = moment().format("dddd").toLowerCase();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-sm font-bold mb-2">
        {moment().format("dddd")}s Route Plan
      </h2>

      {data && data.length > 0 ? (
        <div className="space-y-6">
          {data.map((customer, index) => (
            <CustomerCard
              key={customer._id || index}
              customer={customer}
              index={index}
              today={today}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">
          It seems no customers are assigned for today.
        </p>
      )}
    </div>
  );
}
