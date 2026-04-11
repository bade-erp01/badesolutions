"use client";
import { useState } from "react";
import Nav2 from "@/app/Components/Nav2";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logout from "@/app/Components/Logout";
import UserNotification from "@/app/Components/UserNotification";
import { PresentationChartLineIcon,UserGroupIcon,MapIcon,CubeIcon,UserPlusIcon,PencilSquareIcon,QueueListIcon,Square3Stack3DIcon } from "@heroicons/react/24/outline";
import "animate.css";
import { Encrypt,EXPRESS_PRIVATE_URL } from "../../../Functions/Functions";
import { useParams } from "next/navigation";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { plsWait, SuccessToast,ErrorMessage } from "../../../Functions/Mics";
import axios from "axios"



export default function NavWrapper({ userData, data, navtitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [Data] = useState(data || []);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSideNav = () => setIsOpen((prev) => !prev);

  const filteredData = Data.filter(item =>
      Object.values(item).some(val =>
        typeof val === "string" &&
        val.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ).sort((a, b) =>(a.Name ?? "").trim().localeCompare((b.Name ?? "").trim()) );

  return (
    <div className="relative flex flex-col min-h-[90dvh]">
      {/* Nav gets toggle + search setter */}
      <Nav2
        navtitle={navtitle}
        onToggleSideNav={toggleSideNav}
        onSearchChange={setSearchTerm}
        userData={userData}
      />

      {/* Side nav */}
      {isOpen && (
        <aside className="fixed top-0 left-0 w-72 h-full bg-[#1e2939] text-white px-4 py-4 z-30 flex flex-col shadow-lg animate__animated animate__slideInLeft">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold">Menu</h2>
          </div>
          <hr className="border-gray-600 mb-4" />

          {/* Navigation links bg-gray-200/50*/}
          <nav className="w-full space-y-2">
          <Link
            href={`/SalesPortal/Dashboard`}
            className={"flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition "}
          >
            <PresentationChartLineIcon class="h-6 w-6 text-gray-100" />
            <span className="text-xs">Dashboard</span>
          </Link>
          
            <Link
              href="/SalesPortal/Products"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                ${navtitle === "Products" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <CubeIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">Products</span>
            </Link>

            {navtitle === "Products" && (
            <Link
              href="/SalesPortal/reports"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                ${navtitle === "reports" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <Square3Stack3DIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">Product Report</span>
            </Link>
            )}

            <Link
              href="/SalesPortal/Customers"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                ${navtitle === "Customers" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <UserGroupIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">My customers</span>
            </Link>

            {navtitle === "Customers" && (
              <DialogDemo userData={userData} EXPRESS_PRIVATE_URL={EXPRESS_PRIVATE_URL}/>
            )}

            <Link
              href="/SalesPortal/Route"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                ${navtitle === "Route" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <MapIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">My Route</span>
            </Link>

            <Link
              href="/SalesPortal/Requisitions"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                ${navtitle === "Requisitions" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <QueueListIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">Requisitions</span>
            </Link>
            
            <TextareaButton/>
          </nav>

          {/* Logout pinned at bottom */}
          <div className="mt-auto pt-6">
            <button
              className="flex items-center gap-3 px-4 py-2 w-full rounded-md transition-colors bg-gray-200 hover:bg-gray-300"
              aria-label="User Profile"
            >
              <Image
                src={userData?.user?.image || "/person.png"}
                alt="User avatar"
                width={28}
                height={28}
                className="rounded-full border border-black object-cover"
              />
              <div className="flex flex-col items-start">
                <span className="text-sm text-black font-medium">
                  {userData?.user?.firstName} {userData?.user?.lastName}
                </span>
                <span className="text-xs text-gray-500">My Account</span>
              </div>
            </button>
            {userData?.Notification?.length > 0 && (
              <>
                <br />
                <UserNotification user={userData} />
              </>
            )}
            <Logout />
          </div>
        </aside>
      )}

      {/* Main content */}
      <main
        className="flex-1"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#453d46ff transparent",
        }}
      >
        {filteredData.length > 0 ? (
          <section className="mx-auto flex flex-col gap-6 rounded-lg p-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
              {filteredData.map((element) => (
                <Card
                  key={element._id}
                  data={element}
                  module={navtitle}
                  className="shadow-md hover:shadow-lg transition rounded-lg"
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="p-10 text-center">
            <p className="text-gray-500">Nothing to show.</p>
          </div>
        )}
      </main>
    </div>
  );
}



export function DialogDemo({userData}) {
  const [formData, setFormData] = useState({salesPerson:userData.user._id});
  const router = useRouter()
   const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
  };
  
    const handleSubmit = async (e) => {
      try {
        plsWait('Submiting customer data...');
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
            access: `${Encrypt(userData.user._id)}`,
          },
        };
  
        const response = await axios.post(
        `${EXPRESS_PRIVATE_URL}/api/Sales/Register-customer`,
        formData,
        config
      );

        SuccessToast(response.data?.message || "Customer created successfully!");
        setFormData({});
        router.push(`/SalesPortal/Customers/${response.data.newCustomer}`)
        
      } catch (error) {
        ErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Failed to create customer. Please try again."
        );
      }
    };

  return (
    <Dialog>
      <form >
        <DialogTrigger asChild>
          <Button variant="default" className="flex items-center gap-3 p-3 rounded-md transition">
            <UserPlusIcon className="h-4 w-4 text-gray-200" />
            Add a new Lead
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Register customer profile</DialogTitle>
            <DialogDescription>
              Creating a prospecting customer profile is as simple as ABC... just click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="name-1">Business Name</Label>
              <Input required id="name-1" name="Username" type="text" placeholder="ABC enterprises..."onChange={handleChange}
                value={formData.Username || ""} />
            </Field>
            <Field>
              <Label htmlFor="billingAddress">Office Address</Label>
              <Input required placeholder="123 Main Street..."  id="billingAddress"
                name="billingAddress"
                type="text"
                rows="3"
                onChange={handleChange}
                value={formData.billingAddress || ""} />
            </Field>
            <Field>
              <Label htmlFor="Email">Email</Label>
              <Input id="Email" name="Email" type="email" placeholder="Abc@xyz.com" onChange={handleChange}
                value={formData.Email || ""}/>
            </Field>
            <Field>
              <Label htmlFor="phone">Telephone</Label>
              <Input required id="phone" name="phone" type="tel" placeholder="+234 1234567"  onChange={handleChange}
                value={formData.phone || ""}/>
            </Field>
            <Field>
              <Label htmlFor="ContactPerson">Contact person</Label>
              <Input required id="ContactPerson" name="ContactPerson" placeholder="Pedro Duarte"  onChange={handleChange}
                value={formData.ContactPerson || ""}/>
            </Field>

          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSubmit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}



export function Card ({ data, module }) {
  const { auth, Tenant } = useParams();

  const truncate = (str, length = 20) =>
    str && str.length > length ? str.substring(0, length) + "..." : str;

  const title =
    data.Name ||
    data.firstName ||
    data.WHName ||
    data.productName ||
    data.billReferenceNo ||
    data.Username ||
    data.CustomerCode ||
    data.paymentReferenceNo ||
    data.accountName ||
    data.refNo ||
    `${data.billStatus}/${data.billReferenceNo}`;

  const subtitle =
    data.CustomerCode ||
    data.Email ||
    data.billStatus ||
    data.ADCcode ||
    data.ACDcode ||
    data.status ||
    `${data.currentQty ? `${data.currentQty} :case,` : ""}${data.pcs ? `${data.pcs}:pcs` : ""}`;

  const imageSrc = data.image || data.Image || data.icon || "/preview.png";
  const linkHref = `/SalesPortal/${module}/${Encrypt(data._id)}`;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link href={linkHref} className="block w-full h-full text-xs" style={{ textDecoration: "none" }}>
          <div className="flex flex-row items-center gap-4 bg-white border border-gray-200 rounded-md shadow-sm px-4 py-3 hover:shadow-md transition duration-200 animate__animated animate__fadeInUp min-h-20 w-full h-full">
            <Image
              src={imageSrc}
              width={60}
              height={60}
              alt={truncate(title) || "photo"}
              className="rounded-md object-cover w-16 h-16 drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]"
              quality={100}
              priority={true}
            />
            <div className="flex flex-col justify-center w-full">
              <p className="font-semibold text-gray-800 truncate text-xs">{truncate(title)}</p>
              <small className="text-gray-500 mt-1 text-xs">{truncate(subtitle)}</small>
            </div>
          </div>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="bg-gray-50">
        <div className="space-y-2">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-gray-600">{subtitle}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};


// write a report
export function TextareaButton() {
  const [photo, setPhoto] = useState(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const maxWords = 200
  const wordCount = message.trim().split(/\s+/).filter(Boolean).length

  const handleSend = async () => {
    if (wordCount === 0) return
    setLoading(true)

    try {

       let photoUrl = null

      // Upload to Cloudinary if photo exists
      if (photo) {
        const formData = new FormData()
        formData.append("file", photo)
        formData.append("upload_preset", "reports_upload")

        const cloudinaryRes = await fetch(
          "https://api.cloudinary.com/v1_1/dgiajxtvn/image/upload",
          {
            method: "POST",
            body: formData,
          }
        )

        const cloudinaryData = await cloudinaryRes.json()
        photoUrl = cloudinaryData.secure_url
        // console.log("Uploaded to Cloudinary:", photoUrl)
      }

      const formData = new FormData()
      formData.append("message", message)
      if (photo) formData.append("photo", photo)

      const response = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      console.log("Report submitted:", result)

      // Reset after success
      setMessage("")
      setPhoto(null)
    } catch (err) {
      console.error("Error submitting report:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="flex gap-3 p-4 rounded-md transition bg-gray-200/50 hover:bg-gray-700 w-full"
        >
          <PencilSquareIcon className="h-4 w-4 text-gray-200" />
          Write a report
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>New Report</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Textarea
            placeholder="Type your message here (max 200 words)."
            value={message}
            onChange={(e) => {
              const text = e.target.value
              const words = text.trim().split(/\s+/).filter(Boolean)
              if (words.length <= maxWords) {
                setMessage(text)
              }
            }}
          />
          <p className="text-xs text-gray-500">
            {wordCount}/{maxWords} words
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])}
            className="border rounded p-2"
          />

          <Button
            onClick={handleSend}
            disabled={wordCount === 0 || loading}
          >
            {loading ? "Sending..." : "Send message"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
