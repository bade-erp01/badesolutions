"use client"

import { useState, useEffect } from "react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { ErrorMessage, plsWait, SuccessToast } from "../../../Functions/Mics"
import { Encrypt } from "../../../Functions/Functions"
import { useRouter } from "next/navigation"

export default function DaySelector({ useCase, userData, baseUrl, id }) {
  const [day, setDay] = useState("")
  const [url, setUrl] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (useCase === "RouteDays") setUrl(`customer/${Encrypt(id)}/routeDay`)
  }, [useCase, id])

  const handleChange = async (selectedDay) => {
    setDay(selectedDay)

    try {
      plsWait("Adding set date")
      const request = await fetch(`${baseUrl}/api/${url}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
          access: `${Encrypt(userData.user._id)}`,
        },
        body: JSON.stringify({ day: selectedDay }),
      })
      const result = await request.json()
      if(result.message){
        SuccessToast(result.message)
        router.refresh()
      }else{
        throw new Error(result.error)
      }
    } catch (err) {
      ErrorMessage( err.message || "Failed to assign new day")
      router.refresh()
    }
  }

  return (
    <div className="space-y-2">
      <Select onValueChange={handleChange} value={day}>
        <SelectTrigger className="w-full bg-white/50 text-gray-100">
          <SelectValue placeholder="-- Choose a day --" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Monday">Monday</SelectItem>
          <SelectItem value="Tuesday">Tuesday</SelectItem>
          <SelectItem value="Wednesday">Wednesday</SelectItem>
          <SelectItem value="Thursday">Thursday</SelectItem>
          <SelectItem value="Friday">Friday</SelectItem>
          <SelectItem value="Saturday">Saturday</SelectItem>
          <SelectItem value="Sunday">Sunday</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
