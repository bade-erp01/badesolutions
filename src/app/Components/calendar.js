"use client"

import React, { useState } from "react"
import { Calendar } from "@/components/ui/calendar"

export default function CalendarDemo({ LeaveData }) {
  const [date, setDate] = useState(new Date())
  const [leaveArray] = useState(LeaveData) 

  // Generate all dates between startDate and endDate
  const getDateRange = (start, end) => {
    const range = []
    const current = new Date(start)
    while (current <= end) {
      range.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return range
  }

  // Collect all highlighted dates from leaveArray
  const highlightedDates = leaveArray.flatMap((leave) => {
    const start = new Date(leave.startDate)
    const end = new Date(leave.endDate)
    return getDateRange(start, end)
  })

  // Count total leave days across all leave entries
  const totalLeaveDays = leaveArray.reduce((acc, leave) => {
    const start = new Date(leave.startDate)
    const end = new Date(leave.endDate)
    const diffTime = end - start
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return acc + diffDays
  }, 0)

  return (
    <div className="p-2">
      <p className="text-sm font-bold">Time Off Calendar</p>

      {/* Employee Info */}
      <div className="mb-2">
        <p>Name: {employee.firstName} {employee.lastName}</p>
        <p>Email: {employee.Email}</p>
        <p>Telephone: {employee.telephone}</p>
        <p className="font-semibold">Total Leave Days: {totalLeaveDays}</p>
      </div>

      {/* Calendar */}
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        captionLayout="dropdown"
        className="rounded border text-black"
        modifiers={{
          highlighted: highlightedDates,
        }}
        modifiersClassNames={{
          highlighted: "bg-blue-500 text-white rounded",
        }}
        components={{
          DayContent: ({ date, modifiers }) => {
            const isHighlighted = modifiers.highlighted
            return (
              <div
                title={isHighlighted ? "Time out" : ""}
                className="w-full h-full flex items-center justify-center"
              >
                {date.getDate()}
              </div>
            )
          },
        }}
      />
    </div>
  )
}
