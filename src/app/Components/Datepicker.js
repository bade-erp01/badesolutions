"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"

export default function CalendarDemo({ useCase, userData }) {
  const [date, setDate] = useState(new Date())

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
    </div>
  )
}
