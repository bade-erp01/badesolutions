"use client"

import { useState, useEffect } from "react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { ErrorMessage, plsWait, SuccessToast } from "../../../Functions/Mics"
import api from "@/lib/api"
import { useRouter } from "next/navigation"

export default function DaySelector({ useCase, userData, baseUrl, id }) {
  const [day, setDay] = useState("")
  const [url, setUrl] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (useCase === "RouteDays") setUrl(`customer/${id}/routeDay`)
  }, [useCase, id])

  const handleChange = async (selectedDay) => {
    setDay(selectedDay)

    try {
      plsWait("Adding set date")
      const request = await api.put(`/api/${url}`, { day: selectedDay })
      const result = request.data || { error: request.error }
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
        <SelectTrigger className="w-full bg-white/50 ">
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
