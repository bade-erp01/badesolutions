'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,       // Equity
  Users,           // Accounts Receivable
  CreditCard,      // Accounts Payable
  FileText,        // Balance Sheet
  TrendingUp,      // Income Statement
  BookOpen,        // Charts of Account
  Building,
  Coins,
  Receipt,         // Tax Report
  ShieldAlert      // Credit Risk
} from "lucide-react";
import {useParams} from "next/navigation"
import { useUser } from "@/components/UserProvider";

export default function AccountingERP() {
  const router = useRouter();
  const Params = useParams();
  const currentUser = useUser();
  const accountUser = currentUser?.user?.user;
  const isAdmin = accountUser?.isAdmin === true;
  const isHRM = accountUser?.isHRM === true;
  const isCFO = accountUser?.isCFO === true;
  const isAccountant = accountUser?.isAccountant === true;
  const accountingRoles = ["admin", "cfo", "accountant"];

  const modules = [
    { label: "Equity", id: "dashboard", icon: BarChart3, badge: "Beta", url:"Equity", allowedRoles: accountingRoles },
    { label: "Accounts Receivable", id: "ar", icon: Users, badge: "Core", url:"Receivables", allowedRoles: accountingRoles },
    { label: "Accounts Payable", id: "ap", icon: CreditCard, badge: "Core", url:"Payables", allowedRoles: accountingRoles },
    { label: "Balance Sheet", id: "balance-sheet", icon: FileText, badge: "Beta", url:"BalanceSheet", allowedRoles: accountingRoles },
    { label: "Income Statement", id: "income-statement", icon: TrendingUp, badge: "Beta", url:"P&L", allowedRoles: accountingRoles },
    { label: "Charts of Account", id: "chart-of-account", icon: BookOpen, badge: "Beta", url:"Chart-Of-Accounts", allowedRoles: accountingRoles },
    { label: "Bank Account", id:"Bank-Accounts", icon: Building, badge:"Core", url:"Bank-Accounts", allowedRoles: accountingRoles},
    { label: "Pay Roll", id:"Pay-Roll", icon: Coins, badge:"New", url:"PayRoll", allowedRoles: [...accountingRoles, "hrm"]},
    { label: "Tax Report", id:"Tax-Report", icon: Receipt, badge:"New", url:"Tax-Report", allowedRoles: accountingRoles},
    { label: "Credit Risk", id:"Credit-Risk", icon: ShieldAlert, badge:"New", url:"Credit-Risk", allowedRoles: accountingRoles},
  ];
  const userRoles = [
    isAdmin && "admin",
    isHRM && "hrm",
    isCFO && "cfo",
    isAccountant && "accountant",
  ].filter(Boolean);
  const visibleModules = modules.filter((item) =>
    item.allowedRoles.some((role) => userRoles.includes(role)),
  );

  return (
    <div className="bg-background text-foreground p-0 sm:p-6">
      {visibleModules.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleModules.map((item) => (
          <Button
            key={item.id}
            variant="outline"
            onClick={() => router.push(`/${Params.auth}/V4/accounting/accounting/${item.url}/${item.url}`)}
            className="flex flex-col items-start justify-between h-28 rounded-xl p-4 text-left
                       transition-all duration-200 cursor-pointer
                       hover:bg-primary/10 hover:border-primary hover:shadow-lg"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <item.icon className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            </div>
            <h3 className="text-lg font-medium">{item.label}</h3>
            <p className="text-muted-foreground text-xs">
              Manage {item.label.toLowerCase()}
            </p>
          </Button>
        ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No accounting modules are available for your role.
        </p>
      )}
    </div>
  );
}
