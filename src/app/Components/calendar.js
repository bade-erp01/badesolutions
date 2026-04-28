"use client"

import React, { useState } from "react"
import { Calendar } from "@/components/ui/calendar"

export default function CalendarDemo({ LeaveData }) {
  const [date, setDate] = useState(new Date())
  const [leaveArray] = useState(LeaveData)
  const [selectedLeaves, setSelectedLeaves] = useState([])

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

  // Collect all highlighted dates with their leave info
  const highlightedDates = leaveArray.flatMap((leave) => {
    const start = new Date(leave.startDate)
    const end = new Date(leave.endDate)
    return getDateRange(start, end).map((d) => ({
      date: d,
      leave,
    }))
  })

  // Count total leave days across all leave entries
  const totalLeaveDays = leaveArray.reduce((acc, leave) => {
    const start = new Date(leave.startDate)
    const end = new Date(leave.endDate)
    const diffTime = end - start
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return acc + diffDays
  }, 0)

  // Handle selecting a date
  const handleSelectDate = (selectedDate) => {
    setDate(selectedDate)
    const found = highlightedDates.filter(
      (item) =>
        item.date.toDateString() === new Date(selectedDate).toDateString()
    )
    setSelectedLeaves(found.map((f) => f.leave))
  } 

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
        onSelect={handleSelectDate}
        captionLayout="dropdown"
        className="rounded border text-black"
        modifiers={{
          highlighted: highlightedDates.map((h) => h.date),
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
                className="w-full h-full flex items-center justify-center cursor-pointer"
              >
                {date.getDate()}
              </div>
            )
          },
        }}
      />

      {/* Selected Leave Details */}
      {selectedLeaves.length > 0 && (
        <div className="mt-4 p-3 border rounded bg-gray-100">
          <h3 className="font-bold">Leave Details for {date.toDateString()}</h3>
          {selectedLeaves.map((leave, idx) => (
            <div key={idx} className="mb-2">
              <p>Type: {leave.leaveType}</p>
              <p>Status: {leave.status}</p>
              <p>Description: {leave.description}</p>
              <p>
                From: {new Date(leave.startDate).toLocaleDateString()} To:{" "}
                {new Date(leave.endDate).toLocaleDateString()}
              </p>
              <p>Days: {leave.days}</p>
              <hr className="my-2" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
