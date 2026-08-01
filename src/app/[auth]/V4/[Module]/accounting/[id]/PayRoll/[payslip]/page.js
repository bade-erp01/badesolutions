"use client";

import { useUser } from "@/components/UserProvider";
import {
  Encrypt,
  ErrorMessage,
  SuccessToast,
} from "../../../../../../../../../Functions/Mics";
import { EXPRESS_PRIVATE_URL } from "../../../../../../../../../Functions/Functions";
import React, { useEffect, useState } from "react";
import {
  Download,
  Trash2,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Send
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {useParams} from "next/navigation"

export default function PayrollPage() {
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const params = useParams()

  // Fetch data
  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/Entries/${params.payslip}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(user.user.business.tenantId)}`,
            access: `${Encrypt(user.user.user._id)}`,
            sessionKey: `Bearer ${Encrypt(user.user.SessionId)}`,
          },
        });

        const result = await res.json();
        
        setPayroll(result);
      } catch (error) {
        console.error("Failed to fetch payroll", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, [params.payslip]);

  // Download as Excel (CSV)
  const downloadExcel = () => {
    if (!payroll?.entries?.length) return;

    const headers = [
      "SN",
      "Employee ID",
      "Department",
      "Job Role",
      "Basic",
      "HRA",
      "Transport",
      "Welfare",
      "Adhoc",
      "Medical",
      "CLA",
      "Gross",
      "Pension",
      "Total Deduction",
      "Net Payable",
      "Cash Retirement",
    ];

    const rows = payroll.entries.map((entry, i) => [
      i + 1,
      entry.employeeId,
      entry.DEPT || "",
      entry.JOB_ROLE || "",
      entry.BASIC || 0,
      entry.HRA || 0,
      entry.TRANSPORT || 0,
      entry.WELFARE || 0,
      entry.ADHOC || 0,
      entry.MEDICAL || 0,
      entry.CLA || 0,
      entry.GROSS || 0,
      entry.PENSION || 0,
      entry.TOTAL_DEDUCTION || 0,
      entry.NET_PAYABLE || 0,
      entry.Cash_Retirement || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${payroll.title}_payroll.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Delete entry
  const deleteEntry = async (entryId) => {
    // Implement your delete API call here
    console.log("Delete entry:", entryId);
    // Example:
    // await fetch(`/api/payroll/entry/${entryId}`, { method: 'DELETE' });
    // Then refetch data
  };

  if (loading)
    return <div className="p-10 text-center">Loading payroll...</div>;
  if (!payroll) return <div className="">Payroll not found</div>;

  const totalEmployees = payroll.entries?.length || 0;
  const totalNetPayable =
    payroll.entries?.reduce((sum, e) => sum + (e.NET_PAYABLE || 0), 0) || 0;
  const totalGross =
    payroll.entries?.reduce((sum, e) => sum + (e.GROSS || 0), 0) || 0;
  const avgNetPay = totalEmployees
    ? Math.round(totalNetPayable / totalEmployees)
    : 0;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Gross Pay
            </CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₦{totalGross.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Net Payable
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              ₦{totalNetPayable.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Net Pay
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₦{avgNetPay.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold">
                {payroll.title.toUpperCase()}
              </CardTitle>
              <p className="text-muted-foreground">
                {new Date(payroll.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            </div>
            <Badge
              variant={payroll.status === "Pending" ? "secondary" : "default"}
            >
              {payroll.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableCaption>
                Total Employees: {totalEmployees} | Total Net Payable: ₦
                {totalNetPayable.toLocaleString()}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Job Role</TableHead>
                  <TableHead className="text-right">Basic</TableHead>
                  <TableHead className="text-right">HRA</TableHead>
                  <TableHead className="text-right">Transport</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Net Deduction</TableHead>
                  <TableHead className="text-right font-semibold">
                    Net Payable
                  </TableHead>
                  <TableHead className="w-20 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.entries.map((entry, index) => (
                  <TableRow key={entry._id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {String(entry.employeeId.firstName).slice(-8)} {String(entry.employeeId.lastName).slice(-8)}
                    </TableCell>
                    <TableCell>{entry.DEPT || "-"}</TableCell>
                    <TableCell>{entry.JOB_ROLE || "-"}</TableCell>
                    <TableCell className="text-right">
                      ₦{Number(entry.BASIC).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ₦{Number(entry.HRA).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ₦{Number(entry.TRANSPORT).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ₦{Number(entry.GROSS).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ₦{Number(entry.TOTAL_DEDUCTION).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      ₦{Number(entry.NET_PAYABLE).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button> */}
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete this payroll entry.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteEntry(entry._id)}
                              className="bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Download Button */}
          <div className="mt-6 flex justify-end">
            <Button onClick={downloadExcel} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Entries as CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
