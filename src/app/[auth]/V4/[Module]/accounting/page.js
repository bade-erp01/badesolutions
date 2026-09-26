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
  Coins
} from "lucide-react";
import {useParams} from "next/navigation"

export default function AccountingERP() {
  const router = useRouter();
  const Params = useParams();

  const modules = [
    { label: "Equity", id: "dashboard", icon: BarChart3, badge: "Beta", url:"Equity" },
    { label: "Accounts Receivable", id: "ar", icon: Users, badge: "Core", url:"Receivables" },
    { label: "Accounts Payable", id: "ap", icon: CreditCard, badge: "Core", url:"Payables" },
    { label: "Balance Sheet", id: "balance-sheet", icon: FileText, badge: "Beta", url:"BalanceSheet" },
    { label: "Income Statement", id: "income-statement", icon: TrendingUp, badge: "Beta", url:"P&L" },
    { label: "Charts of Account", id: "chart-of-account", icon: BookOpen, badge: "Beta", url:"Chart-Of-Accounts" },
    { label: "Bank Account", id:"Bank-Accounts", icon: Building, badge:"Core", url:"Bank-Accounts"},
    { label: "Pay Roll", id:"Pay-Roll", icon: Coins, badge:"New", url:"PayRoll"},
  ];

  return (
    <div className="bg-background text-foreground p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((item) => (
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
    </div>
  );
}
