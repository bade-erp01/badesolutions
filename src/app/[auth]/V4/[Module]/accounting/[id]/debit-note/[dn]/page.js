"use client";

import React from 'react';
import { useRouter, useParams } from "next/navigation";
import { plsWait, ErrorMessage, SuccessToast, Encrypt } from '../../../../../../../../../Functions/Mics';
import { Dencrypt } from "../../../../../../../../../Functions/Functions";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Printer, CheckCircle, Trash2, RotateCcw } from "lucide-react";

export default function Page({ data, userData, baseurl }) {
  const Router = useRouter();
  const Params = useParams();

  const handleApprove = async (action) => {
    if (!confirm(`Are you sure you want to ${action} this debit note?`)) return;

    plsWait('');
    try {
      const response = await fetch(`${baseurl}/api/Debit/Memo/${Params.dn}`, {
        method: "PATCH",
        body: JSON.stringify({
          ApprovedBy: `${userData.user.firstName} ${userData.user.lastName}`,
          action: action,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
          access: `${Encrypt(userData.user._id)}`,
          sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
          "idempotency-key": `DN-${action}-${data._id}`,
        },
      });

      if (!response.ok) throw new Error('Failed to process debit note');
      
      const request = await response.json();
      SuccessToast(request.message);

      if (action === "Delete") {
        Router.push(`/${Params.auth}/V4/${Params.Module}/${Params.Module}/debit-note/debit-note`);
      } else {
        Router.refresh();
      }
    } catch (error) {
      ErrorMessage(error.message);
      Router.refresh();
    }
  };

  // Print Function with Authenticity
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow pop-ups to print this document");
      return;
    }

    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Debit Note - ${data?.DebitId}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { 
              font-family: Arial, Helvetica, sans-serif; 
              line-height: 1.6; 
              color: #333;
            }
            .watermark {
              position: absolute;
              top: 45%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-35deg);
              font-size: 80px;
              color: rgba(0, 0, 0, 0.08);
              font-weight: bold;
              pointer-events: none;
              z-index: -1;
              white-space: nowrap;
            }
            .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin: 30px 0; }
            .amount-box { 
              background: #f8f9fa; 
              padding: 25px; 
              text-align: center; 
              border: 2px solid #000; 
              margin: 30px 0;
            }
            .authenticity {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px dashed #999;
              font-size: 0.9em;
              color: #555;
              text-align: center;
            }
            .signature { margin-top: 60px; border-top: 1px solid #000; width: 300px; }
          </style>
        </head>
        <body>
          <div class="watermark">${userData.business.companyName || "DEBIT NOTE"}</div>

          <div class="header">
            <h1 style="margin:0; font-size:28px;">DEBIT NOTE</h1>
            <p style="margin:5px 0 0 0;">Ref: <strong>${data?.DebitId}</strong></p>
          </div>

          <div class="info-grid">
            <div>
              <p><strong>Customer:</strong> ${data?.customer}</p>
              <p><strong>Date:</strong> ${new Date(data?.Date).toLocaleDateString()}</p>
              <p><strong>Raised By:</strong> ${data?.raisedBy}</p>
            </div>
            <div>
              <p><strong>Debit Account:</strong> ${data?.bankID?.bankName}</p>
              <p><strong>Approved By:</strong> ${data?.ApprovedBy || 'Pending Approval'}</p>
              <p><strong>Status:</strong> ${data?.status}</p>
            </div>
          </div>

          <div class="amount-box">
            <h2 style="margin:0; font-size:32px;">₦${data?.Total?.toLocaleString()}</h2>
            <p style="margin:8px 0 0 0; font-size:18px;">Total Debit Amount</p>
          </div>

          ${data?.reference ? `
          <div>
            <strong>Remarks:</strong><br>
            ${data.reference}
          </div>` : ''}

          <div class="authenticity">
            <p><strong>Authenticity Notice:</strong> This document is computer generated and is invalid without an Authorized signature.</p>
            <p>Generated on ${today} | Document ID: ${data?.DebitId}</p>
            <p style="margin-top: 30px;">Thank you for your business.</p>
          </div>

          <div class="signature">
            <p><strong>Authorized Signatory</strong></p>
            <p style="margin-top: 40px;">_______________________________</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 600);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Debit Note Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Debit Note ID</p>
                <p className="text-xl font-semibold mt-1">{data?.DebitId}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                <p className="mt-1 text-lg">{data?.customer}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-xl font-bold mt-1">₦{data?.Total?.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Debit Account</p>
                <p className="mt-1 text-lg">{data?.bankID?.bankName}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge 
                  variant={data?.status === 'Closed' ? 'default' : 'secondary'}
                  className="mt-1 text-base"
                >
                  {data?.status}
                </Badge>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="mt-1 text-lg">
                  {new Date(data?.Date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Raised By</p>
                <p className="mt-1 text-lg">{data?.raisedBy}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                <p className="mt-1 text-lg">{data?.ApprovedBy || 'Not Approved Yet'}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Remarks</p>
                <p className="mt-1 text-lg">{data?.reference || 'No remarks provided'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            {data?.status === "Closed" && (
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2"
                onClick={handlePrint}
              >
                <Printer className="w-5 h-5" />
                Print Debit Note
              </Button>
            )}

            {(data?.status === "Open" && userData.user.creditOfficer) && (
              <Button 
                size="lg" 
                onClick={() => handleApprove("Closed")}
                className="gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Approve Debit Note
              </Button>
            )}

            {(data?.status === "Open" && userData.user.creditOfficer) && (
              <Button 
                size="lg" 
                variant="destructive"
                onClick={() => handleApprove("Delete")}
                className="gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </Button>
            )}

            {(data?.status === "Closed" && userData.user.creditOfficer) && (
              <Button 
                size="lg" 
                variant="destructive"
                onClick={() => handleApprove("Reversed")}
                className="gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reverse
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}