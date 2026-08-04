"use client"

import React, { useState } from "react"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function Page({ data }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const payments = data?.Entries?.slice(0, 350) || []
  const Account = data?.account || {}

  const totalPages = Math.ceil(payments.length / itemsPerPage)
  const paginatedPayments = payments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">{Account.NAME}</h1>
        <p className="text-sm text-muted-foreground">
          Showing {payments.length} most recent account entries.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {["Desc", "Ref", "Status", "Date", "Dr", "Cr", "Bal."].map(
                (header) => (
                  <TableHead key={header}>{header}</TableHead>
                )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPayments.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="truncate">
                  {item.paymentReferenceNo}
                </TableCell>
                <TableCell className="truncate">{item.collectionRef}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {item.status}
                  </span>
                </TableCell>
                <TableCell className="truncate">
                  {new Date(item.PaymentDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="font-medium">
                  {item.drAmount.toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">
                  {item.crAmount.toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">
                  {item.previousBalance.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>

          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={currentPage === i + 1}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
