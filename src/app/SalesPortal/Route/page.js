import React from "react"
import moment from "moment"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Page({ userInfo, data }) {
  // Get today's weekday in lowercase (e.g. "monday")
  const today = moment().format("dddd").toLowerCase()

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-2">Customers Route Plan</h2>

      {data && data.length > 0 ? (
        <div className="space-y-6">
          {data.map((customer, index) => (
            <Card key={index} className="shadow-md">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {customer.Username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{customer.Username}</CardTitle>
                  <CardDescription>Visit #{index + 1}</CardDescription>
                </div>
              </CardHeader>
              <Separator />

              {/* Collapsible Section */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 ml-4"
                  >
                    Details
                  </Button>
                </CollapsibleTrigger>

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
                        <Badge variant="secondary">
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
                          const isToday = day.date.toLowerCase() === today
                          return (
                            <Badge
                              key={idx}
                              className={
                                isToday
                                  ? "bg-green-700 text-white"
                                  : "bg-gray-400 text-gray-100"
                              }
                            >
                              {day.date}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>

                    {/* Dummy Google Map */}
                    <div className="md:w-1/2 mt-4 md:mt-0">
                      <div className="w-full h-40 rounded-lg overflow-hidden border">
                        {customer.latitude && customer.longitude ? (
                          <iframe
                          title="Customer Location"
                          src={`https://www.google.com/maps?q=${customer.latitude},${customer.longitude}&z=15&output=embed`}
                          className="w-full h-full"
                          loading="lazy"
                        ></iframe>
                        ):(
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
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No customers assigned for today.</p>
      )}
    </div>
  )
}
