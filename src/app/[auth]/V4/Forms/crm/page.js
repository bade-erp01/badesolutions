"use client";
import axios from "axios";
import { useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { plsWait, ErrorMessage, SuccessToast, Encrypt } from "../../../../../../Functions/Mics";
import { Dencrypt, EXPRESS_PRIVATE_URL } from "../../../../../../Functions/Functions";
import { useRouter, useParams } from 'next/navigation';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const sanitizeObject = (obj) => {
  if (obj && typeof obj === "object" && obj.toJSON) {
    return JSON.parse(JSON.stringify(obj));
  }
  return obj;
};

export default function NewCustomerForm({ 
  userData, 
  businessData, 
  salesperson,
}) {
  const sanitizedUserData = sanitizeObject(userData);
  const sanitizedSalespersons = salesperson.map(sanitizeObject);
  
  const router = useRouter();
  const params = useParams();

  const [user] = useState(sanitizedUserData.user);
  const [salespersons] = useState(sanitizedSalespersons);
  
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState(null);
  const [serverError, setServerError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: undefined });
    setServerMsg(null);
    setServerError(null);
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: undefined });
    setServerMsg(null);
    setServerError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Username || formData.Username.length < 2) {
      newErrors.Username = "Name is required and must be at least 2 characters.";
    }
    if (!formData.phone || !/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Telephone is required and must be valid.";
    }
    if (!formData.Email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.Email)) {
      newErrors.Email = "Email is required and must be valid.";
    }
    if (formData.Debt && isNaN(parseFloat(formData.Debt))) {
      newErrors.Debt = "Opening Balance must be a number.";
    }
    if (!formData.salesPerson) {
      newErrors.salesPerson = "Sales Person is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      plsWait('Submitting customer data...');
      
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(businessData.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`
        },
      };

      const response = await axios.post(
        `${EXPRESS_PRIVATE_URL}/api/Sales/Register-customer`,
        formData,
        config
      );

      SuccessToast(response.data?.message || "Customer created successfully!");
      setFormData({});
      
      // Fixed router.push
      router.push(`/${params.auth}/V4/crm/crm/${response.data.newCustomer}`);
     
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to create customer.";
      ErrorMessage(errorMsg);
      setServerError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="">   {/* ← Wider form */}
        <Card className="shadow-xl border">
          <CardHeader className="rounded-t-lg">
            <CardTitle className="text-3xl font-bold">New Customer</CardTitle>
            <CardDescription className=" text-base">
              Please provide accurate customer information to ensure smooth onboarding.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
              {/* Server Messages */}
              {serverMsg && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800 font-medium">
                    {serverMsg}
                  </AlertDescription>
                </Alert>
              )}
              
              {serverError && (
                <Alert variant="destructive">
                  <ExclamationCircleIcon className="h-5 w-5" />
                  <AlertDescription className="font-medium">
                    {serverError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="Name" className="text-sm font-semibold">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Name"
                    name="Username"
                    type="text"
                    required
                    value={formData.Username || ""}
                    onChange={handleChange}
                    placeholder="Customer Name"
                    className={errors.Username ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.Username && <p className="text-red-500 text-xs mt-1">{errors.Username}</p>}
                </div>

                {/* Telephone */}
                <div className="space-y-2">
                  <Label htmlFor="Telephone" className="text-sm font-semibold">
                    Telephone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Telephone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone || ""}
                    onChange={handleChange}
                    placeholder="+234 080********"
                    className={errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="Email" className="text-sm font-semibold">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Email"
                    name="Email"
                    type="email"
                    required
                    value={formData.Email || ""}
                    onChange={handleChange}
                    placeholder="customer@email.com"
                    className={errors.Email ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.Email && <p className="text-red-500 text-xs mt-1">{errors.Email}</p>}
                </div>

                {/* Start Balance */}
                <div className="space-y-2">
                  <Label htmlFor="Debt" className="text-sm font-semibold">
                    Start Balance{" "}
                    <span className="text-xs text-gray-500 italic">
                      (Negative = business owes customer)
                    </span>
                  </Label>
                  <Input
                    id="Debt"
                    name="Debt"
                    type="number"
                    step="0.01"
                    value={formData.Debt || 0}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={errors.Debt ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.Debt && <p className="text-red-500 text-xs mt-1">{errors.Debt}</p>}
                </div>

                {/* Sales Person */}
                <div className="space-y-2">
                  <Label htmlFor="salesPerson" className="text-sm font-semibold">
                    Sales Person <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.salesPerson || ""}
                    onValueChange={(value) => handleSelectChange("salesPerson", value)}
                  >
                    <SelectTrigger className={errors.salesPerson ? "border-red-500" : ""}>
                      <SelectValue placeholder="Choose Sales Person" />
                    </SelectTrigger>
                    <SelectContent>
                      {salespersons.map((person) => (
                        <SelectItem key={person._id} value={person._id}>
                          {person.firstName} {person.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.salesPerson && <p className="text-red-500 text-xs mt-1">{errors.salesPerson}</p>}
                </div>

                {/* Account Manager */}
                <div className="space-y-2">
                  <Label htmlFor="Manager" className="text-sm font-semibold">
                    Account Manager
                  </Label>
                  <Select
                    value={formData.Manager || ""}
                    onValueChange={(value) => handleSelectChange("Manager", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Account Manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {salespersons.map((person) => (
                        <SelectItem key={person._id} value={person._id}>
                          {person.firstName} {person.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Address */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="billingAddress" className="text-sm font-semibold">
                    Address
                  </Label>
                  <Textarea
                    id="billingAddress"
                    name="billingAddress"
                    rows={4}
                    value={formData.billingAddress || ""}
                    onChange={handleChange}
                    placeholder="Customer delivery address..."
                    className="resize-y min-h-[100px]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                {user.createCustomer && (
                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="min-w-[220px]"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Creating Customer...
                      </>
                    ) : (
                      "Create New Customer"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}