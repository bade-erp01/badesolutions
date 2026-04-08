"use client"
import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { plsWait } from "../../../Functions/Mics"
import { Dencrypt, Encrypt } from "../../../Functions/Functions";

export default function CalendarDemo({ useCase, userData, baseUrl, id }) {
  const [date, setDate] = useState(new Date())
  const [url, setUrl] = useState("")

  useEffect(() => {
    if (useCase === "RouteDays") setUrl(`customer/${Encrypt(id)}/routeDay`)
    if (useCase === "Employee") setUrl("")
  }, [useCase, id]) // run when props change

  const AssignDate = async () => {
    try {
      plsWait("Adding set date")
      const request = await fetch(`${baseUrl}/api/${url}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
           access: `${Encrypt(userData.user._id)}`,
        },
        body: JSON.stringify({ date }),
      })
      const result = await request.json()
      console.log("Date assigned:", result)
    } catch (err) {
      console.error("Error assigning date:", err)
    }
  }

  //  auto-save whenever date changes
//   useEffect(() => {
//     if (date) {
//       console.log("Date changed:", date)
//       // Uncomment if you want auto-save:
//       // AssignDate()
//     }
//   }, [date])

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-200">
        Select visitation date for sales person
      </p>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-lg border bg-black/50"
        captionLayout="dropdown"
        disabled={(day) => day < new Date()} // disable past dates
      />
      <div className="mt-1">
        <Button onClick={AssignDate}>
          Assign Date
        </Button>
      </div>
    </div>
  )
}
