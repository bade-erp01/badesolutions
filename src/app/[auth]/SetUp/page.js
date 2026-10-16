"use client"

import { useState, useRef, useMemo } from "react"
import {
  Camera,
  Building2,
  Globe,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Package,
  Circle,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import Footer1 from "@/app/Components/Footer1"

export default function SetUp({ company }) {
  const data = company || {
    companyName: "",
    email: "",
    Tel: "",
    companyLogo: "",
    shopAddress: "",
    companyState: "",
    companyCity: "",
    website: "",
    BusinessType: "",
    industryType: "",
    invoicePolicy: "",
    allowPriceChangeOnInvoice: false,
    allowSkuSplitting: false,
    monthlyCutStatement: false,
    dailyReport: false,
    autoLog: false,
    clearNotification: "Daily",
    modules: [],
  }

  const allowedModules = ["Stores Operations", "Product Management", "CRM"]

  const installedModules = (data.modules || [])
    .filter((mod) => allowedModules.includes(mod.Name))
    .map((mod) => ({
      ...mod,
      installed: true,
    }))

  const [preview, setPreview] = useState(data.companyLogo || null)
  const [form, setForm] = useState({
    companyName: data.companyName || "",
    email: data.email || "",
    Tel: data.Tel || "",
    shopAddress: data.shopAddress || "",
    companyState: data.companyState || "",
    companyCity: data.companyCity || "",
    website: data.website || "",
    BusinessType: data.BusinessType || "",
    industryType: data.industryType || "",
    invoicePolicy: data.invoicePolicy || "",
    allowPriceChangeOnInvoice: data.allowPriceChangeOnInvoice || false,
    allowSkuSplitting: data.allowSkuSplitting || false,
    monthlyCutStatement: data.monthlyCutStatement || false,
    dailyReport: data.dailyReport || false,
    autoLog: data.autoLog || false,
    clearNotification: data.clearNotification || "Daily",
  })

  const fileInputRef = useRef(null)

  // ---------- Progress calculation (only mandatory fields) ----------
  const steps = useMemo(() => {
    const hasLogo = Boolean(preview)
    const hasBasicInfo =
      form.companyName.trim() !== "" &&
      form.email.trim() !== "" &&
      form.Tel.trim() !== ""
    const hasAddress =
      form.shopAddress.trim() !== "" &&
      form.companyCity.trim() !== "" &&
      form.companyState.trim() !== ""
    const hasBusinessDetails =
      form.BusinessType.trim() !== "" && form.industryType.trim() !== ""

    return [
      { id: "logo", label: "Company Logo", completed: hasLogo },
      { id: "basic", label: "Basic Information", completed: hasBasicInfo },
      { id: "address", label: "Business Address", completed: hasAddress },
      {
        id: "details",
        label: "Business Details",
        completed: hasBusinessDetails,
      },
    ]
  }, [preview, form])

  const completedCount = steps.filter((s) => s.completed).length
  const progress = Math.round((completedCount / steps.length) * 100)
  const isFullyComplete = progress === 100

  // ---------- Handlers ----------
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitch = (name, checked) => {
    setForm((prev) => ({ ...prev, [name]: checked }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isFullyComplete) return
    console.log("Activate account with:", { ...form, companyLogo: preview })
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      {/* Abstract decorative blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-muted/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-muted/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-1/4 h-72 w-72 rounded-full bg-muted/30 blur-3xl" />

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header + Progress */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Business Profile Setup
          </h1>
          <p className="mt-2 text-muted-foreground">
            Complete all required steps below to activate your account.
          </p>

          {/* Progress bar */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Setup Progress</span>
              <span className="text-muted-foreground">{progress}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />

            {/* Step indicators */}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      step.completed
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ========== BUSINESS INFORMATION ========== */}
          <Card className="relative animate-in fade-in slide-in-from-bottom-6 duration-700 overflow-hidden border shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-foreground" />
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    This information appears on invoices, receipts and
                    customer-facing documents.
                  </CardDescription>
                </div>
                {steps.find((s) => s.id === "basic")?.completed &&
                  steps.find((s) => s.id === "logo")?.completed && (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Completed
                    </Badge>
                  )}
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Logo Upload */}
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 rounded-xl ring-2 ring-background shadow-md">
                    {preview ? (
                      <AvatarImage
                        src={preview}
                        alt="Company logo"
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="rounded-xl bg-muted">
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-foreground text-background shadow-md transition hover:scale-110"
                  >
                    <Camera className="h-4 w-4" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">
                    Company Logo <span className="text-destructive">*</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Recommended size 400×400px. PNG or JPG.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change logo
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Basic Info */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      className="pl-9"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="Tel">
                  Phone Numbers <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="Tel"
                    name="Tel"
                    className="pl-9"
                    value={form.Tel}
                    onChange={handleChange}
                    placeholder="Enter phone number(s)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="website"
                    name="website"
                    className="pl-9"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="Enter website URL"
                  />
                </div>
              </div>

              <Separator />

              {/* Address */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4" />
                    Business Address
                  </h3>
                  {steps.find((s) => s.id === "address")?.completed && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700"
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Done
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopAddress">
                    Street Address <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="shopAddress"
                    name="shopAddress"
                    value={form.shopAddress}
                    onChange={handleChange}
                    placeholder="Enter street address"
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyCity">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="companyCity"
                      name="companyCity"
                      value={form.companyCity}
                      onChange={handleChange}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyState">
                      State <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="companyState"
                      name="companyState"
                      value={form.companyState}
                      onChange={handleChange}
                      placeholder="Enter state"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Business Type & Industry */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium">Business Details</h3>
                  {steps.find((s) => s.id === "details")?.completed && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700"
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Done
                    </Badge>
                  )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Business Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.BusinessType}
                      onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, BusinessType: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Partnership">Partnership</SelectItem>
                        <SelectItem value="LLC">LLC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industryType">
                      Industry <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="industryType"
                      name="industryType"
                      value={form.industryType}
                      onChange={handleChange}
                      placeholder="Enter industry"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Policy */}
              <div className="space-y-2">
                <Label htmlFor="invoicePolicy">
                  Invoice Policy / Footer Note
                </Label>
                <Textarea
                  id="invoicePolicy"
                  name="invoicePolicy"
                  value={form.invoicePolicy}
                  onChange={handleChange}
                  placeholder="Enter invoice footer note"
                  className="min-h-[80px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* ========== INSTALLED MODULES ========== */}
          <Card className="relative animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 overflow-hidden border shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-foreground" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Installed Modules
              </CardTitle>
              <CardDescription>
                These modules are currently active on your account.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {installedModules.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No modules installed yet.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {installedModules.map((mod) => (
                    <div
                      key={mod._id}
                      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-muted blur-2xl transition group-hover:bg-muted/80" />

                      <div className="relative flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition group-hover:scale-105">
                          <img
                            src={mod.icon}
                            alt={mod.Name}
                            className="h-8 w-8 object-contain"
                          />
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300"
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Installed
                        </Badge>
                      </div>

                      <div className="relative">
                        <h4 className="font-semibold tracking-tight">
                          {mod.Name}
                        </h4>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {mod.Description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ========== PREFERENCES ========== */}
          <Card className="relative animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 overflow-hidden border shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-foreground" />
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Control how your system behaves. (Optional)
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  {
                    key: "allowPriceChangeOnInvoice",
                    label: "Allow price change on invoice",
                    desc: "Staff can edit prices when creating invoices",
                  },
                  {
                    key: "allowSkuSplitting",
                    label: "Allow SKU splitting",
                    desc: "Split products into smaller units",
                  },
                  {
                    key: "monthlyCutStatement",
                    label: "Monthly cut statement",
                    desc: "Automatically generate monthly statements",
                  },
                  {
                    key: "dailyReport",
                    label: "Daily report",
                    desc: "Send daily sales summary",
                  },
                  {
                    key: "autoLog",
                    label: "Auto log activity",
                    desc: "Automatically record user actions",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-4 rounded-xl border bg-muted/40 px-4 py-3 transition hover:bg-muted/70"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <Label htmlFor={item.key} className="cursor-pointer">{item.label}</Label>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <Switch
                      id={item.key}
                      className="shrink-0"
                      checked={form[item.key]}
                      onCheckedChange={(checked) =>
                        handleSwitch(item.key, checked)
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <Label>Clear notifications</Label>
                <Select
                  value={form.clearNotification}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, clearNotification: value }))
                  }
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col-reverse gap-3 border-t bg-muted/30 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
              <Button type="button" variant="outline">
                Cancel
              </Button>

              {/* Only show Activate button at 100% */}
              {isFullyComplete && (
                <Button
                  type="submit"
                  className="animate-in fade-in zoom-in-95 duration-300"
                >
                  Activate my account
                </Button>
              )}
            </CardFooter>
          </Card>
        </form>
      </div>

      <Footer1 />
    </div>
  )
}