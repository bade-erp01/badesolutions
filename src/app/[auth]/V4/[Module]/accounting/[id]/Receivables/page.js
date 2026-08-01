"use client";
import React, { useState } from "react";
import moment from "moment";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CustomersPage({ data }) {
  // Filter customers with debt > 0 and sort by highest debt first
  const debtors = React.useMemo(() => {
    return (data || [])
      .filter((cust) => cust.Debt > 0)
      .sort((a, b) => b.Debt - a.Debt);
  }, [data]);

  // KPI values
  const totalReceivables = debtors.reduce((sum, cust) => sum + cust.Debt, 0);
  const totalDebtors = debtors.length;

  // Bad Debt Calculation (debts older than 180 days)
  const badDebtThreshold = 180; // Change this value as needed (e.g., 90, 120, 365)
  
  const badDebtors = debtors.filter((cust) => {
    const daysSince = moment().diff(moment(cust.lastPayDate, "M/D/YYYY"), "days");
    return daysSince > badDebtThreshold;
  });

  const totalBadDebt = badDebtors.reduce((sum, cust) => sum + cust.Debt, 0);
  const totalBadDebtors = badDebtors.length;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(debtors.length / itemsPerPage);
  
  const paginatedDebtors = debtors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-background text-foreground space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Receivables</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ₦{totalReceivables.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Debtors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalDebtors}</p>
          </CardContent>
        </Card>

        {/* New Bad Debt KPI */}
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Bad Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              ₦{totalBadDebt.toLocaleString()}
            </p>
            <p className="text-sm text-red-500 mt-1">
              {totalBadDebtors} customers (over {badDebtThreshold} days)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Debtors List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Debt</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDebtors.map((cust) => {
                const daysSince = moment().diff(moment(cust.lastPayDate, "M/D/YYYY"), "days");
                const isBadDebt = daysSince > badDebtThreshold;
                
                return (
                  <TableRow key={cust._id} className={isBadDebt ? "bg-red-50 dark:bg-red-950/30" : ""}>
                    <TableCell className="flex items-center space-x-2">
                      <img
                        src={cust.image}
                        alt={cust.Username}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{cust.Username}</span>
                    </TableCell>
                    <TableCell>{cust.Email}</TableCell>
                    <TableCell>{cust.phone}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{cust.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₦{cust.Debt.toLocaleString()}
                    </TableCell>
                    <TableCell>{cust.lastPayDate}</TableCell>
                    <TableCell className={isBadDebt ? "text-red-600 font-medium" : ""}>
                      {daysSince} days
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, debtors.length)} of {debtors.length} entries
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </Button>
                
                <div className="text-sm font-medium px-4 py-1 border rounded-md">
                  Page {currentPage} of {totalPages}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}