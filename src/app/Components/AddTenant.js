"use client";

import { useState } from "react";
import {
  Building2,
  Database,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const availableCollections = [
  "Customers",
  "Products",
  "Price Lists",
  "Categories",
  "Suppliers",
];

export default function CreateBusinessTenantModal() {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
  });

  const [collections, setCollections] = useState([]);

  const toggleCollection = (collection) => {
    setCollections((prev) =>
      prev.includes(collection)
        ? prev.filter((item) => item !== collection)
        : [...prev, collection]
    );
  };

  const handleSubmit = () => {
    console.log({
      ...formData,
      cloneCollections: collections,
    });

    // Your API call goes here

    // Close modal after successful creation
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* BUTTON THAT OPENS THE MODAL */}
      <DialogTrigger asChild>
        <Button size="lg" className={'w-full'}>
          <Building2 className="mr-2 h-4 w-4" />
          Add Business Tenant
        </Button>
      </DialogTrigger>

      {/* MODAL */}
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Building2 className="h-6 w-6 text-primary" />
            Create Business Tenant
          </DialogTitle>

          <DialogDescription>
            Create a new tenant and optionally clone data from
            existing collections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 sm:space-y-8">
          {/* BUSINESS DETAILS */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Business Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Name</Label>

                <Input
                  placeholder="Acme Nigeria Ltd"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      companyName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Business Email</Label>

                <Input
                  type="email"
                  placeholder="info@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>

                <Input
                  placeholder="+234 800 000 0000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* COLLECTIONS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />

              <h3 className="font-semibold text-lg">
                Collections To Clone
              </h3>
            </div>

            <p className="text-sm text-muted-foreground">
              Select the collections you want copied into the
              new tenant database.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableCollections.map((collection) => (
                <div
                  key={collection}
                  className="flex items-center space-x-3 rounded-xl border p-4 hover:bg-muted transition"
                >
                  <Checkbox
                    id={`clone-${collection.replace(/\s+/g, "-")}`}
                    checked={collections.includes(collection)}
                    onCheckedChange={() =>
                      toggleCollection(collection)
                    }
                  />

                  <Label htmlFor={`clone-${collection.replace(/\s+/g, "-")}`} className="cursor-pointer">
                    {collection}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* PRICE BOX */}
          <div className="rounded-2xl border bg-muted/50 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h4 className="font-semibold">
                  Tenant Setup Fee
                </h4>

                <p className="text-sm text-muted-foreground">
                  One-time onboarding and provisioning fee
                </p>
              </div>

              <div className="text-2xl font-bold sm:text-3xl">
                ₦150,000
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button onClick={handleSubmit} className="h-auto min-h-9 whitespace-normal">
            Create New Business Tenant @ ₦150,000
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}