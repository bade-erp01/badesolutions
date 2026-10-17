"use client";
import Plotly from "plotly.js-dist-min";
import Swal from "sweetalert2";
import { MapPin } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  UpdateEmployeeData,
  EXPRESS_PRIVATE_URL,
  Dencrypt,
} from "../../../../../../../Functions/Functions";
import api from "@/lib/api";
import { useUser } from "@/components/UserProvider";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
const NaijaStates = require("naija-state-local-government");
import moment from "moment";
import { useRouter } from "next/navigation";
import {
  ErrorMessage,
  SuccessToast,
  plsWait,
  SendTimeOutLink,
} from "../../../../../../../Functions/Mics";
import AccessControl from "@/app/Components/Access";
import { Mail, Loader2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import { KeyRound } from "lucide-react";
import { RefreshCcw } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { escapeHtml } from "@/lib/security/escapeHtml";

const formatNumberShort = (num) => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + " B"; // billions
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + " M"; // millions
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + " K"; // thousands
  }
  return num.toString();
};

export default function SingleEmployeeView({
  userInfo,
  businessInfo,
  Backdata,
  module,
  businessData,
  storeList,
  custList
}) {
  const states = NaijaStates.states();
  let [user] = useState(userInfo || {});
  const [data] = useState(Backdata);
  const [Error, setError] = useState("");
  const [formData, setFormData] = useState({ ...data });
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const router = useRouter();

  // DeactivateUser/ activate user account
  const DeactivateUser = async (id) => {
    try {
      const { isConfirmed } = await Swal.fire({
        title: "Proceed with Action?",
        text: "If user is currently active, they will be logged out and their access will be removed.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Yes, update it!",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        focusCancel: true,
      });

      if (!isConfirmed) {
        return;
      }

      plsWait("Applying changes, Please wait...");
      const response = await api.patch(`/api/EmployeeUpdate/${id}`);
      const data = response.data || {};
      if (response.ok) {
        SuccessToast(data.message);
        location.reload();
      } else {
        ErrorMessage(data.error);
        location.reload();
      }
    } catch (err) {
      ErrorMessage(err.message);
    }
  };

  const DeleteAttachment = async (id, model, attachmentId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        plsWait("Deleting...⌛");

        const request = await api.del(
          `/api/Delete/Attachment/${id}?model=${model}&attachmentId=${attachmentId}`,
        );

        const response = request.data || {};
        if (response.message) {
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
          });
          location.reload();
        } else {
          ErrorMessage(response.error || request.error);
        }
      }
    });
  };

  // upload file
  const uploadFiles = async (id, module) => {
    try {
      const { value: file } = await Swal.fire({
        title: "Select File",
        input: "file",
        inputAttributes: {
          accept: "image/*",
          "aria-label": "Upload your File",
        },
      });
      if (file) {
        plsWait("Uploading...⌛");
        const reader = new FileReader();
        reader.onload = async (e) => {
          // Resize image
          const img = new window.Image();
          img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const maxWidth = 800; // Set your desired max width
            const maxHeight = 600; // Set your desired max height
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const resizedImage = canvas.toDataURL("image/jpeg", 0.7); // Adjust quality as needed

            const request = await api.post(`/api/images/upload?id=${id}&module=${module}`, { image: resizedImage });

            const response = request.data || {};
            if (response.message) {
              Swal.fire({
                title: "Your uploaded File",
                imageUrl: resizedImage,
                imageAlt: "The uploaded File",
              });
              location.reload();
            }
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      ErrorMessage("Error uploading file:", error);
    }
  };

  const getStatus = (lastSeen) => {
    // If lastSeen is explicitly "Online"
    if (lastSeen === "Online") {
      return "Not Logged in";
    }

    const lastSeenTime = moment(lastSeen, moment.ISO_8601, true);

    // Validate date
    if (!lastSeenTime.isValid()) {
      return "Unknown status";
    }

    const diffMinutes = moment().diff(lastSeenTime, "minutes");

    if (diffMinutes <= 5) {
      return "Online"; // Active within the last 5 minutes
    } else if (diffMinutes < 1440) {
      return `Last login ${lastSeenTime.fromNow()}`; // Shows relative time (e.g., "3 hours ago")
    } else {
      return "Offline"; // Inactive for more than a day
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    try{
      plsWait("Updating user data...");
      e.preventDefault();
      const request = await api.patch(`/api/updateUser/${data._id}`, formData)

    const response = request.data || {};

    if (response.message) {
      SuccessToast(response.message);
      router.refresh();
    }

    }catch(err){
      ErrorMessage(err.message)
    }
  };

  // upload docs
  const processAndUploadFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const img = new window.Image();
          img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const maxWidth = 800;
            const maxHeight = 600;
            let { width, height } = img;

            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const resizedImage = canvas.toDataURL("image/jpeg", 0.7);

            // UploadURL.push({resizedImage})

            const request = await api.post(`/api/Employee/attachments?employee=${data._id}`, { image: resizedImage });

            const response = request.data || {};
            // UploadURL.push({Url:response.image})
            resolve({ success: !!response.message });
          };
          img.src = e.target.result;
        } catch (error) {
          resolve({ success: false });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadLPOFile = async () => {
    try {
      const { value: files } = await Swal.fire({
        title: "Select Files",
        input: "file",
        inputAttributes: {
          accept: "image/*", // Accept only image types
          "aria-label": "Upload your Files",
          multiple: "multiple",
        },
        preConfirm: (fileInput) => {
          const maxSize = 5 * 1024 * 1024; // 5MB
          const files =
            fileInput instanceof FileList ? Array.from(fileInput) : [];

          for (const file of files) {
            if (file.size > maxSize) {
              Swal.showValidationMessage(
                `File "${file.name}" exceeds ${maxSize / 1024 / 1024}MB limit.`,
              );
              return false;
            }
            if (file.type === "application/pdf") {
              Swal.showValidationMessage(
                `PDF files are not allowed: "${file.name}".`,
              );
              return false;
            }
          }

          return files;
        },
      });
      if (files && files.length > 0) {
        plsWait("Uploading...");
        const uploadPromises = Array.from(files).map((file) =>
          processAndUploadFile(file),
        );

        const results = await Promise.all(uploadPromises);

        const successfulUploads = results.filter(
          (result) => result.success,
        ).length;
        const failedUploads = results.filter(
          (result) => !result.success,
        ).length;

        Swal.fire({
          title: "Upload Results",
          html: `Successfully uploaded ${escapeHtml(successfulUploads)} file(s).<br>Failed to upload ${escapeHtml(failedUploads)} file(s).`,
          icon: successfulUploads > 0 ? "success" : "warning",
        });
        location.reload();
      }
    } catch (error) {
      ErrorMessage("Error uploading file:", error);
    }
  };

  // Show error state
  if (Error) {
    return (
      <div className="">
        <div className="">{Error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 rounded border-lg border-2-black animate__animated animate__fadeInUpBig animate__delay-2">
        {/* form starts here */}
        <div className="space-y-5 mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-xl font-bold">
              {data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1)}
              &apos;s profile
            </h4>
            <span
              className={`px-5 py-1.5 rounded-full text-sm tracking-wide shadow-sm border ${
                data.lastSeen === ""
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              {getStatus(data.lastSeen)}
            </span>
          </div>

          {/* Avatar & Attachment */}
          {/* <div className="flex flex-wrap gap-8 items-center py-4">
          
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-lg overflow-hidden bg-gradient-to-tr from-gray-200 to-gray-300 shadow-md border border-gray-300 flex items-center justify-center">
                {data.image ? (
                  <Image
                    height={40}
                    width={40}
                    src={data.image}
                    quality={100}
                    loaing="eager"
                    priority={true}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No Image</span>
                )}
              </div>

              <button
                onClick={() => {
                  uploadFiles(data._id, "Employee");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
              >
                <CameraIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Upload</span>
              </button>
            </div>
            
            <div className="hidden md:block h-24 border-l border-gray-200 mx-6"></div>

            
            {userInfo.isAdmin && (
              <div className="flex-1 min-w-[220px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attach Document
                </label>
                <button
                  onClick={() => {
                    uploadLPOFile(data._id, "Employee");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md shadowtransition"
                >
                  <PaperClipIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Upload</span>
                </button>
              </div>
            )}
          </div> */}
          <div className="flex items-center space-x-6">
            <div className="w-28 h-28 rounded overflow-hidden bg-gradient-to-tr from-gray-200 to-gray-300 shadow-sm border-2 border-gray-300 flex items-center justify-center">
              {Backdata.image ? (
                <Image
                  width={50}
                  height={50}
                  src={
                    Backdata.image ||
                    "https://img.icons8.com/glyph-neue/64/gender-neutral-user.png"
                  }
                  loading="eager"
                  quality={100}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-lg font-semibold">
                  No Image
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <input
                type="file"
                name="Image"
                accept="image/*"
                onChange={() => uploadFiles(data._id, "Employee")}
                className="block w-full text-sm  file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
          {/* chart  */}
          <SalePersonChart
            customerId={Backdata._id}
            customerName={Backdata.firstName}
            business={businessInfo}
            userInfo={user}
            custList={custList || []}
          />
          <br />
          {/* dashboard for sales person */}
          <LiveLocationMap userData={data}/>
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-4 py-3 flex justify-between items-center text-left  font-medium transition"
            >
              <h2 className="text-base/7 font-semibold ">
                Personal Information
              </h2>
              <svg
                className={`w-5 h-5 transform transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`px-4 py-3  transition-all duration-300 ${
                isOpen ? "block" : "hidden"
              }`}
            >
              <form
                onSubmit={handleSubmit}
                className="border-b bg- border-gray-900/10 pb-12"
              >
                <p className="mt-1 text-sm/6 ">
                  Ensure to provide correct Information.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="first-name"
                      className="block text-sm/6 font-medium "
                    >
                      First Name
                    </label>
                    <div className="mt-2">
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        autoComplete="given-name"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="last-name"
                      className="block text-sm/6 font-medium "
                    >
                      Last Name
                    </label>
                    <div className="mt-2">
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        autoComplete="family-name"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="city"
                      className="block text-sm/6 font-medium "
                    >
                      Email
                    </label>
                    <div className="mt-2">
                      <input
                        id="Email"
                        name="Email"
                        type="email"
                        value={formData.Email}
                        onChange={handleChange}
                        autoComplete="Email-level2"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="region"
                      className="block text-sm/6 font-medium "
                    >
                      Date of Birth
                    </label>
                    <div className="mt-2">
                      <input
                        id="DOB"
                        name="DOB"
                        type="date"
                        value={formData.DOB}
                        onChange={handleChange}
                        autoComplete="address-level1"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor=""
                      className="block text-sm/6 font-medium "
                    >
                      Telephone
                    </label>
                    <div className="mt-2">
                      <input
                        id="telephone"
                        name="telephone"
                        type="tel"
                        value={formData.telephone}
                        onChange={handleChange}
                        autoComplete=""
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="Country"
                      className="block text-sm/6 font-medium "
                    >
                      Country
                    </label>
                    <div className="mt-2">
                      <input
                        id="Country"
                        name="Country"
                        type="text"
                        value="Nigeria"
                        readOnly
                        autoComplete="address-level2"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="region"
                      className="block text-sm/6 font-medium "
                    >
                      State / Province
                    </label>
                    <div className="mt-2">
                      <select
                        id="stateOfOrigin"
                        name="stateOfOrigin"
                        onChange={handleChange}
                        autoComplete="stateOfOrigin"
                        className="col-start-1 w-full row-start-1 appearance-none rounded-md  py-1.5 pr-8 pl-3 text-base  outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      >
                        <option value={formData.stateOfOrigin}>
                          {" "}
                          {formData.stateOfOrigin || "Choose..."}
                        </option>
                        {states.map((state, index) => (
                          <option value={state} key={index}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-auto col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="workTelephone"
                      className="block text-sm/6 font-medium "
                    >
                      Work Line
                    </label>
                    <div className="mt-2">
                      <input
                        id="workTelephone"
                        name="workTelephone"
                        type="tel"
                        value={formData.workTelephone}
                        onChange={handleChange}
                        autoComplete="workTelephone"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="nextOfKin"
                      className="block text-sm/6 font-medium "
                    >
                      Next of Kin
                    </label>
                    <div className="mt-2">
                      <input
                        id="nextOfKin"
                        name="nextOfKin"
                        value={formData.nextOfKin}
                        onChange={handleChange}
                        type="text"
                        autoComplete="nextOfKin"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="EmaergencyContact"
                      className="block text-sm/6 font-medium "
                    >
                      Emergency Contact Name
                    </label>
                    <div className="mt-2">
                      <input
                        id="EmaergencyContact"
                        name="EmaergencyContact"
                        type="text"
                        value={formData.EmaergencyContact}
                        onChange={handleChange}
                        autoComplete="EmaergencyContact"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="EmaergencyContactNumber"
                      className="block text-sm/6 font-medium "
                    >
                      Emergency Contact number
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.EmaergencyContactNumber}
                        onChange={handleChange}
                        id="EmaergencyContactNumber"
                        name="EmaergencyContactNumber"
                        type="tel"
                        autoComplete="EmaergencyContactNumber"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label
                      htmlFor="HomeAddress"
                      className="block text-sm/6 font-medium "
                    >
                      House address
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.HomeAddress}
                        onChange={handleChange}
                        id="HomeAddress"
                        name="HomeAddress"
                        type="text"
                        autoComplete="HomeAddress"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="Gender"
                      className="block text-sm/6 font-medium "
                    >
                      Gender
                    </label>

                    <div className="flex items-center gap-x-3">
                      <input
                        value={formData.Gender}
                        onChange={handleChange}
                        id="Gender"
                        name="Gender"
                        type="text"
                        autoComplete="Gender"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="border bg-green-400 border-gray-300 rounded-md px-3 py-2 mt-3 text-sm font-semibold  transition"
                >
                  Update Personal infomation
                </button>
              </form>
            </div>
          </div>

          {/* work information */}
          {user.isHRM && (
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setIsOpen2(!isOpen2)}
                className="w-full px-4 py-3 flex justify-between items-center text-left  font-medium transition"
              >
                <h2 className="text-base/7 font-semibold ">
                  Work Information
                </h2>
                <svg
                  className={`w-5 h-5 transform transition-transform duration-300 ${
                    isOpen2 ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`px-4 py-3  transition-all duration-300 ${
                  isOpen2 ? "block" : "hidden"
                }`}
              >
                <form
                  onSubmit={handleSubmit}
                  className="border-b border-gray-900/10 pb-12"
                >
                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-2 sm:col-start-1">
                      <label
                        htmlFor="city"
                        className="block text-sm/6 font-medium "
                      >
                        Work Location
                      </label>
                      <div className="mt-2">
                        <select
                          id="workLocation"
                          name="workLocation"
                          value={formData.workLocation}
                          onChange={handleChange}
                          className="col-start-1 w-full row-start-1 appearance-none rounded-md  py-1.5 pr-8 pl-3 text-base  outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        >
                          <option value={formData.workLocation}>
                            {
                              // find assigne store and return store name
                              (storeList &&
                                storeList.find(
                                  (store) =>
                                    store._id === formData.workLocation,
                                )?.WHName) ||
                                "Choose..."
                            }
                          </option>
                          {storeList &&
                            storeList.map((store, index) => (
                              <option value={store._id} key={index}>
                                {store.WHName}
                              </option>
                            ))}
                        </select>
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="pointer-events-auto col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="staffId"
                        className="block text-sm/6 font-medium "
                      >
                        Staff ID Number
                      </label>
                      <div className="mt-2">
                        <input
                          id="staffId"
                          name="staffId"
                          value={formData.staffId}
                          onChange={handleChange}
                          type="text"
                          autoComplete="address-level1"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Department"
                        className="block text-sm/6 font-medium "
                      >
                        Department
                      </label>
                      <div className="mt-2">
                        <input
                          id="Department"
                          name="Department"
                          value={formData.Department}
                          onChange={handleChange}
                          type="text"
                          autoComplete="Department"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 sm:col-start-1">
                      <label
                        htmlFor="jobTittle"
                        className="block text-sm/6 font-medium "
                      >
                        Job Tittle
                      </label>
                      <div className="mt-2">
                        <input
                          id="jobTittle"
                          name="jobTittle"
                          type="text"
                          value={formData.jobTittle}
                          onChange={handleChange}
                          autoComplete="jobTittle"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="pension"
                        className="block text-sm/6 font-medium "
                      >
                        Pension No
                      </label>
                      <div className="mt-2">
                        <input
                          id="pension"
                          name="pension"
                          value={formData.pension}
                          onChange={handleChange}
                          type="text"
                          autoComplete="pension"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                    <label
                      htmlFor="LeaveDaysCount"
                      className="block text-sm/6 font-medium "
                    >
                      Allocate time off days
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.LeaveDaysCount}
                        onChange={handleChange}
                        id="LeaveDaysCount"
                        name="LeaveDaysCount"
                        disabled={data.requestLeave}
                        type="tel"
                        autoComplete="LeaveDaysCount"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                    <div className="sm:col-span-2 sm:col-start-1">
                      <label
                        htmlFor="city"
                        className="block text-sm/6 font-medium "
                      >
                        Account Number
                      </label>
                      <div className="mt-2">
                        <input
                          id="nextOfKin"
                          name="nextOfKin"
                          type="text"
                          value={formData.pension}
                          onChange={handleChange}
                          autoComplete="address-level2"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="BankName"
                        className="block text-sm/6 font-medium "
                      >
                        Bank Name
                      </label>
                      <div className="mt-2">
                        <input
                          id="BankName"
                          name="BankName"
                          value={formData.BankName}
                          onChange={handleChange}
                          type="text"
                          autoComplete="BankName"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="StartDate"
                        className="block text-sm/6 font-medium "
                      >
                        Employment Date
                      </label>
                      <div className="mt-2">
                        <input
                          id="StartDate"
                          name="StartDate"
                          value={formData.StartDate}
                          onChange={handleChange}
                          type="date"
                          autoComplete="StartDate"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="EndDate"
                        className="block text-sm/6 font-medium "
                      >
                        Dismissal Date
                      </label>
                      <div className="mt-2">
                        <input
                          id="EndDate"
                          name="EndDate"
                          value={formData.EndDate}
                          onChange={handleChange}
                          type="date"
                          autoComplete="EndDate"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Salary"
                        className="block text-sm/6 font-medium "
                      >
                        Basic Salary
                      </label>
                      <div className="mt-2">
                        <input
                          id="Salary"
                          name="Salary"
                          value={formData.Salary}
                          onChange={handleChange}
                          type="number"
                          step="any"
                          autoComplete="Salary"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Medical"
                        className="block text-sm/6 font-medium "
                      >
                        Medical
                      </label>
                      <div className="mt-2">
                        <input
                          id="Medical"
                          name="Medical"
                          value={formData.Medical}
                          onChange={handleChange}
                          type="number"
                          autoComplete="Medical"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Transport"
                        className="block text-sm/6 font-medium "
                      >
                        Transport
                      </label>
                      <div className="mt-2">
                        <input
                          id="Transport"
                          name="Transport"
                          value={formData.Transport}
                          onChange={handleChange}
                          type="number"
                          autoComplete="Transport"
                          step="any"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Welfare"
                        className="block text-sm/6 font-medium "
                      >
                        Welfare
                      </label>
                      <div className="mt-2">
                        <input
                          id="Welfare"
                          name="Welfare"
                          value={formData.Welfare}
                          onChange={handleChange}
                          type="number"
                          step="any"
                          autoComplete="Welfare"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="penDeduction"
                        className="block text-sm/6 font-medium "
                      >
                        Pension Deduction
                      </label>
                      <div className="mt-2">
                        <input
                          id="penDeduction"
                          name="penDeduction"
                          type="number"
                          step="any"
                          value={formData.penDeduction}
                          onChange={handleChange}
                          autoComplete="penDeduction"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="pfa"
                        className="block text-sm/6 font-medium "
                      >
                        Pension Administrator
                      </label>
                      <div className="mt-2">
                        <input
                          id="pfa"
                          name="pfa"
                          value={formData.pfa}
                          onChange={handleChange}
                          type="text"
                          autoComplete="pfa"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="workEmail"
                        className="block text-sm/6 font-medium "
                      >
                        Work Email
                      </label>
                      <div className="mt-2">
                        <input
                          id="workEmail"
                          name="workEmail"
                          value={formData.workEmail}
                          onChange={handleChange}
                          type="text"
                          autoComplete="workEmail"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Sales_Target"
                        className="block text-sm/6 font-medium "
                      >
                        Sales Target
                      </label>
                      <div className="mt-2">
                        <input
                          id="Sales_Target"
                          name="Sales_Target"
                          value={formData.Sales_Target}
                          onChange={handleChange}
                          type="number"
                          step="any"
                          autoComplete="Sales_Target"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Target_Start"
                        className="block text-sm/6 font-medium "
                      >
                        Target Start
                      </label>
                      <div className="mt-2">
                        <input
                          id="Target_Start"
                          name="Target_Start"
                          value={formData.Target_Start}
                          onChange={handleChange}
                          type="date"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Deadline"
                        className="block text-sm/6 font-medium "
                      >
                        Target End
                      </label>
                      <div className="mt-2">
                        <input
                          id="Deadline"
                          name="Deadline"
                          value={formData.Deadline}
                          onChange={handleChange}
                          type="date"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="ExpenseLimit"
                        className="block text-sm/6 font-medium "
                      >
                        Expense Limit
                      </label>
                      <div className="mt-2">
                        <input
                          id="ExpenseLimit"
                          name="ExpenseLimit"
                          value={formData.ExpenseLimit}
                          onChange={handleChange}
                          type="number"
                          step="any"
                          autoComplete="ExpenseLimit"
                          className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    {/* <div className="sm:col-span-2">
                        <label
                          htmlFor="ExpenseLimit"
                          className="block text-sm/6 font-medium "
                        >
                          Expense Limit
                        </label>
                        <div className="mt-2">
                          <input
                            id=" ExpenseLimit"
                            name=""
                            value={formData.ExpenseLimit}
                            onChange={handleChange}
                            type="number"
                            step="any"
                            autoComplete="ExpenseLimit"
                            className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                      </div> */}
                  </div>
                  <button
                    type="submit"
                    className="border border-gray-300 bg-green-400 rounded-md px-3 py-2 mt-3 text-sm font-semibold transition"
                  >
                    Update work infomation
                  </button>
                </form>
              </div>
            </div>
          )}
          {/* ends heree */}

          <div className="border-b border-gray-900/10 pb-12">
            {user.isAdmin && (
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setIsOpen3(!isOpen3)}
                  className="w-full px-4 py-3 flex justify-between items-center text-left  font-medium transition"
                >
                  <h2 className="text-base/7 font-semibold ">
                    Role Based Access & Control (RBAC)
                  </h2>
                  <svg
                    className={`w-5 h-5 transform transition-transform duration-300 ${
                      isOpen3 ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`px-4 py-3  transition-all duration-300 ${
                    isOpen3 ? "block" : "hidden"
                  }`}
                >
                  <p className="mt-1 text-sm/6 ">
                    Assign permissions based on {data.firstName}&lsquo;s job
                    roles.
                  </p>

                  <div className="mt-10 space-y-10 ">
                    <AccessControl
                      userInfo={userInfo}
                      TenantData={businessData}
                      businessInfo={businessInfo}
                      data={data}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* form ends here */}

        {(user.isAdmin || user.isHRM) && (
          <div className="mt-6 flex items-center justify-end gap-x-6">
           {( businessData.subscriptionplan !== "Basic") && data.requestLeave &&(
             <button
              type="button"
              onClick={() => SendTimeOutLink(data._id,businessInfo.tenantId,user._id,EXPRESS_PRIVATE_URL)}
              className="rounded-md px-3 py-2 text-sm font-semibold transition"
            >
              Send time-off invitation
            </button>
           )}

            {(!data.firstTimeOnboard && businessInfo.Pendinglicense > 0 ) && (
              <>
               <SendInviteButton
                id={String(data._id)} 
                user={String(userInfo._id)}
                biz={String(businessInfo.tenantId)}
              />
              
               <AssignLicenceButton
                id={String(data._id)} 
                user={String(userInfo._id)}
                biz={String(businessInfo.tenantId)}
              />
              </>
            )}
            
            {data.firstTimeOnboard && (
              <button
                type="submit"
                onClick={() => DeactivateUser(data._id)}
                className={`rounded-md 
                ${data.status === "suspended" ? "bg-green-600" : "bg-red-600"}
                px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-${
                  data.status === "suspended" ? "bg-green-800" : "bg-red-800"
                } focus-visible:outline-indigo-600 transition`}
              >
                {data.status === "suspended"
                  ? "Activate User Account"
                  : "Deactivate User Account"}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function SalePersonChart({ customerId, customerName,userInfo, business, custList }) {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [tottalSales, setTotalSales] = useState();
  const [todaysSale, setTodaysSale] = useState(0);
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const currentYear = moment().format("YYYY");
        const url = `/api/SalseandStock?Year=${currentYear}`;

        const request = await api.get(url);

        const response = request.data || {};

        if (!response.invoice) {
          setErrorMsg("No sales records available.");
          return;
        }

        const data = response.invoice.map((invoice) => ({
          sold: invoice.grandTotal,
          InvoiceDate: invoice.startDate,
          salesPerson: invoice.salesPerson,
        }));


        setTodaysSale(
          response.invoice.filter(
            (item) =>
              item.salesPerson === customerId &&
            item.startDate === moment().format("YYYY-MM-DD"),
          ).reduce((acc, curr) => acc + curr.grandTotal, 0),
        )
        
        const productSales = data.filter(
          (item) => item.salesPerson === customerId,
        );

        const monthlySales = productSales.reduce((acc, curr) => {
          const month = moment(curr.InvoiceDate).format("MM");
          acc[month] = acc[month] || { sold: 0 };
          acc[month].sold += curr.sold;
          return acc;
        }, {});

        for (let i = 1; i <= 12; i++) {
          const monthStr = i.toString().padStart(2, "0");
          if (!monthlySales[monthStr]) {
            monthlySales[monthStr] = { sold: 0 };
          }
        }

        const monthlySalesArray = Object.entries(monthlySales)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month));

        const NDxArray = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const NDyArray = monthlySalesArray.map((item) => item.sold);
        const NDlayout = {
          title: `${escapeHtml(customerName)}s P2B Sales Trend for ${escapeHtml(currentYear)}`,
        };
        setTotalSales(`${customerName} P2B Sales Trend for ${currentYear}`);
        const SECdata = [
          {
            x: NDxArray,
            y: NDyArray,
            type: "scatter",
            mode: "lines+markers",
            marker: { color: business.Color || "black" },
          },
        ];

        setChartData({ SECdata, NDlayout });
      } catch (err) {
        setErrorMsg("Error generating chart.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [customerId, customerName, business]);

  useEffect(() => {
    if (!loading && chartData) {
      Plotly.newPlot("myPlot", chartData.SECdata, chartData.NDlayout);
    }
  }, [loading, chartData]);

  return (
    <>
      {errorMsg ? (
        <div className="flex justify-center items-center min-h-[50vh] text-red-500 text-lg">
          {errorMsg}
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          <DashboardStats Sales_Target={0} todaysSale={todaysSale} custList={custList}/>
          <h5 className="text-lg font-semibold text-gray-700 mb-1">
            Month-on-Month Insight for {tottalSales}
            <br />
          </h5>
          <hr />
          <br />
          <i className="text-gray-500 text-sm">
            Last updated: {moment().format("YYYY-MM-DD HH:mm:ss")}
          </i>
          <div id="myPlot" style={{ width: "100%", height: "400px" }} />
        </div>
      )}
    </>
  );
}


import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function DashboardStats({ Sales_Target,todaysSale,custList }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Today's Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-bold">₦{formatNumberShort(todaysSale)}</p>
        </CardContent>
      </Card>

      {/* Total Customers Assigned */}
      <Card>
        <CardHeader>
          <CardTitle>Customers Assigned</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-bold">{formatNumberShort(custList.length)}</p>
        </CardContent>
      </Card>

      {/* Another metric (optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Total Debt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-bold">₦{formatNumberShort(custList.reduce((acc, curr) => acc + curr.Debt, 0))}</p>
        </CardContent>
      </Card>

      {/* Empty card */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Target</CardTitle>
        </CardHeader>
        <CardContent>
         <p className="text-lg font-bold">0/{formatNumberShort(Number(Sales_Target))}</p>
        </CardContent>
      </Card>
    </div>
  )
}


export function SendInviteButton({ id, user, biz }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const currentUser = useUser()
  const handleInvite = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.patch(`/api/onboard/invite/${id}`);

      const data = response.data || {};

      if (!response.ok) {
        throw new Error(data?.message || "Failed to send invite");
      }

      setMessage(data?.message || "Invite sent successfully");
      SuccessToast(data?.message || "Invite sent successfully");
      
      setTimeout(() => {
        setOpen(false);
      }, 2000);
    } catch (error) {
      setMessage(error.message || "Unable to send invite. Please try again.");
      // ErrorMessage(error.message || "Unable to send invite. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="gap-2 rounded-lg bg-gray-600  transition-all duration-200 px-4 py-2 shadow-md hover:shadow-lg">
          <Mail className="h-4 w-4" />
          <span className="font-semibold">Send Invite</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-md rounded-lg border border-gray-200 shadow-xl ">
        <AlertDialogHeader>
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 shadow-sm">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <AlertDialogTitle className="text-center text-lg font-bold ">
            Send Onboarding Invite
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-sm  mt-3">
            This will send an onboarding invitation email to the user. They will receive instructions to complete their account setup.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            loading || message.includes("successfully") 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message}
          </div>
        )}

        <AlertDialogFooter className="mt-6 flex justify-end gap-3">
          <AlertDialogCancel
            className="rounded-lg px-4 py-2 border border-gray-300   transition-colors font-medium disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleInvite();
            }}
            disabled={loading}
            className="rounded-lg px-6 py-2  transition-all duration-200 flex items-center gap-2 font-semibold disabled:opacity-60 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                <span>Send Invite</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


export function AssignLicenceButton({ id, userToken, bizToken }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const currentUser = useUser()
  const handleAssign = async () => {
    try {
      setLoading(true);

      const response = await api.patch(`/api/licence/assign/${id}`, undefined, { headers: { "Idempotency-Key": `Assign-Licence-${Dencrypt(id)}` } });

      const data = response.data || {};

      if (!response.ok) {
        throw new Error(data?.message || "Failed to assign licence");
      }

      SuccessToast(data?.message || "Licence assigned successfully");
      setOpen(false);
    } catch (error) {
      ErrorMessage("Unable to assign licence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 rounded-xl border border-zinc-300 bg-zinc-100 transition-colors px-4 py-2"
        >
          <KeyRound className="h-4 w-4 text-zinc-600" />
          <span className="font-medium text-zinc-600">Assign Licence</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-md rounded-2xl border border-zinc-200 shadow-lg ">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 shadow-inner">
              <KeyRound className="h-8 w-8 text-zinc-700" />
            </div>
          </div>

          <AlertDialogTitle className="text-center text-xl font-semibold text-zinc-800">
            Assign Licence
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-sm text-zinc-500 mt-2">
            This will assign a licence to the selected user.Note that this action cannot be reversed once completed
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex justify-end gap-3">
          <AlertDialogCancel
            className="rounded-xl px-4 py-2 border border-zinc-300 transition-colors"
            disabled={loading}
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleAssign();
            }}
            disabled={loading}
            className="rounded-xl px-4 py-2 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Assigning...</span>
              </>
            ) : (
              "Assign Licence"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


export function LiveLocationMap({ userData, baseUrl }) {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const intervalRef = useRef(null);

  const fetchLocationFromRedis = async () => {
    try {
      setError(null);

      const res = await api.get(`/api/location/${userData.user._id}`);

      if (!res.ok) {
        throw new Error("Failed to fetch location");
      }

      const data = res.data || {};

      // Expected response from Redis:
      // { latitude: number, longitude: number, updatedAt: number } or null
      if (data?.latitude && data?.longitude) {
        setCoords({
          lat: data.latitude,
          lng: data.longitude,
        });
        setLastUpdated(data.updatedAt || Date.now());
      } else {
        setCoords(null);
        setError("No live location available");
      }
    } catch (err) {
      setError("Unable to load live location");
      setCoords(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userData || !baseUrl) return;

    // Fetch immediately
    fetchLocationFromRedis();

    // Auto refresh every 2 minutes
    intervalRef.current = setInterval(() => {
      fetchLocationFromRedis();
    }, 2 * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userData, baseUrl]);

  // Loading state
  if (loading) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center gap-3 rounded-xl border">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading live location...</p>
      </div>
    );
  }

  // Error / No location
  if (error || !coords) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center gap-4 rounded-xl border bg-muted/20 px-6 text-center">
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">Live location unavailable</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            {error || "This user has no recent location in Redis."}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchLocationFromRedis}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border p-4 bg-card flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-medium">
            <MapPin className="h-5 w-5 text-primary" />
            Current Live Location
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Auto updates every 2 min
            {lastUpdated && (
              <> · Last updated: {new Date(lastUpdated).toLocaleTimeString()}</>
            )}
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={fetchLocationFromRedis}
          className="h-9 w-9"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Coordinates badge */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          Lat: {coords.lat.toFixed(6)}
        </Badge>
        <Badge variant="secondary">
          Lng: {coords.lng.toFixed(6)}
        </Badge>
      </div>

      {/* Google Map */}
      <div className="overflow-hidden rounded-xl border">
        <iframe
          key={`${coords.lat}-${coords.lng}`}
          width="100%"
          height="500"
          loading="lazy"
          allowFullScreen
          className="border-0 h-[350px] sm:h-[500px]"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(coords.lat)},${encodeURIComponent(coords.lng)}&z=16&output=embed`}
        />
      </div>
    </div>
  );
}

// Haversine formula to calculate distance in km
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
