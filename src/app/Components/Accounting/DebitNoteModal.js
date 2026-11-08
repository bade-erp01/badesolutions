"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function DebitNoteModal({ customersList, baseUrl, userData, Accounts }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [bankID, setBankID] = useState("");
  const [remarks, setRemarks] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const Router = useRouter();
  const Path = useParams();

  const handleSubmit = async () => {
    if (!date || !amount || !customerId || !remarks) {
      ErrorMessage("Please fill in all required fields");
      return;
    }

    plsWait("Working on things...please wait.");

    const r = await api.post("/api/DebitNote/new", {
      Date: date,
      Total: amount,
      reference: remarks,
      customerId,
      bankID: bankID || null,
    });

    const response = r.data || {};
    if (r.ok) {
      SuccessToast("Debit note has been created successfully. Awaiting Approval");
      Router.push(
        `/${Path.auth}/V4/${Path.Module}/${Path.Module}/debit-note/debit-note/${response.data}`
      );
      setOpen(false);
    } else {
      ErrorMessage(response.error || r.error);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)} variant="default">
        <BanknotesIcon className="h-5 w-5" />
        Create Debit Note
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Debit Note</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new debit note.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold">Amount</label>
              <Input
                type="number"
                min={1}
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold">Customer</label>
              <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {customerId
                      ? customersList.find((c) => c._id === customerId)?.Username
                      : "Select a customer"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search customer..." />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {customersList
                          .slice()
                          .sort((a, b) => a.Username?.localeCompare(b.Username || ""))
                          .map((c) => (
                            <CommandItem
                              key={c._id}
                              value={c.Username}
                              onSelect={() => {
                                setCustomerId(c._id);
                                setCustomerOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", customerId === c._id ? "opacity-100" : "opacity-0")} />
                              {c.Username}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-xs font-semibold">
                Debit Account <i className="text-red-600 text-xs">
                  Please choose this option only if a real debit refund has taken place — either physical or digital.
                </i>
              </label>
              <Select onValueChange={setBankID}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {Accounts.map((a) => (
                    <SelectItem key={a._id} value={a._id}>
                      {a.bankName} - {a.bankCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold">Remarks</label>
              <Textarea
                rows={3}
                placeholder="Enter remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
