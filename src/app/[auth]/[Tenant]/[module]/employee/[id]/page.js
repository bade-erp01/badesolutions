"use client";
import Plotly from "plotly.js-dist-min";
import Swal from "sweetalert2";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Encrypt,
  UpdateEmployeeData,
  EXPRESS_PRIVATE_URL,
  Dencrypt,
} from "../../../../../../../Functions/Functions"
import {
  PhotoIcon,
  PaperClipIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
const NaijaStates = require("naija-state-local-government");
import moment from "moment";
import { useRouter } from "next/navigation";
import {
  ErrorMessage,
  SuccessToast,
  plsWait,
  sendInvite,
  DeleteUser,
} from "../../../../../../../Functions/Mics";
import AccessControl from "@/app/Components/Access";

export default function SingleEmployeeView({
  userInfo,
  businessInfo,
  Backdata,
  module,
}) {
  const states = NaijaStates.states();
  let [user] = useState(userInfo || {});
  const [data] = useState(Backdata);
  const [Error, setError] = useState("");
  const [formData, setFormData] = useState({ ...data });
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);

  // DeactivateUser/ activate user account
  const DeactivateUser = async (id) => {
    try{
      plsWait("Applying changes, Please wait...")
      const response = await fetch(`/api/EmployeeUpdate/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
           access: `${Encrypt(userInfo._id)}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        SuccessToast(data.message);
        router.refresh();
      } else {
       ErrorMessage(data.error);
       router.refresh();
      }
    }catch(err){
      ErrorMessage(err.message);
    }
  }

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

        const request = await fetch(
          `${EXPRESS_PRIVATE_URL}/api/Delete/Attachment/${id}?model=${model}&attachmentId=${attachmentId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            dbConnect: `Bearer ${businessInfo.rustyRoof}`,
            access: `${Encrypt(userInfo._id)}`,
          }
        );

        const response = await request.json();
        if (response.message) {
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
          });
          location.reload();
        } else {
          ErrorMessage(response.error);
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

            const request = await fetch(
              `${EXPRESS_PRIVATE_URL}/api/images/upload?id=${id}&module=${module}`,
              {
                method: "POST",
                body: JSON.stringify({ image: resizedImage }),
                headers: {
                  "Content-Type": "application/json",
                  dbConnect: `Bearer ${businessInfo.rustyRoof}`,
                  access: `${Encrypt(userInfo._id)}`,
                },
              }
            );

            const response = await request.json();
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
    const now = moment();
    const lastSeenTime = moment(lastSeen);

    const diffMinutes = now.diff(lastSeenTime, "minutes");

    if (lastSeen === "Online") {
      return `Currently Logged in`;
      // Active within the last 5 minutes
    } else if (diffMinutes < 1440) {
      return `Last seen ${lastSeenTime.fromNow()}`; // Shows relative time
    } else {
      return "Offline"; // Inactive for more than a day
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await UpdateEmployeeData(data._id, "form", formData);
    router.refresh();
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

            const request = await fetch(
              `${EXPRESS_PRIVATE_URL}/api/Employee/attachments?employee=${data._id}`,
              {
                method: "POST",
                body: JSON.stringify({ image: resizedImage }),
                headers: {
                  "Content-Type": "application/json",
                  dbConnect: `Bearer ${businessInfo.rustyRoof}`,
                  access: `${Encrypt(userInfo._id)}`,
                },
              }
            );

            const response = await request.json();
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
                `File "${file.name}" exceeds ${maxSize / 1024 / 1024}MB limit.`
              );
              return false;
            }
            if (file.type === "application/pdf") {
              Swal.showValidationMessage(
                `PDF files are not allowed: "${file.name}".`
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
          processAndUploadFile(file)
        );

        const results = await Promise.all(uploadPromises);

        const successfulUploads = results.filter(
          (result) => result.success
        ).length;
        const failedUploads = results.filter(
          (result) => !result.success
        ).length;

        Swal.fire({
          title: "Upload Results",
          html: `Successfully uploaded ${successfulUploads} file(s).<br>Failed to upload ${failedUploads} file(s).`,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{Error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="m-5 p-4 rounded shadow-2xl border-lg border-2-black bg-white animate__animated animate__fadeInUpBig animate__delay-2">
        {/* form starts here */}
        <div className="space-y-5 mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-xl font-bold text-gray-800">
              {data.firstName.charAt(0).toUpperCase() + data.firstName.slice(1)}
              &apos;s profile
            </h4>
            <span
              className={`px-5 py-1.5 rounded-full font-semibold text-base tracking-wide shadow-sm border ${
                data.lastSeen !== "Online"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              {getStatus(data.lastSeen)}
            </span>
          </div>

          {/* Avatar & Attachment */}
          <div className="flex flex-wrap gap-8 items-center py-4">
            {/* Avatar */}
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
                  uploadFiles(Encrypt(data._id), "Employee");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
              >
                <CameraIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Upload</span>
              </button>
            </div>
            {/* Divider */}
            <div className="hidden md:block h-24 border-l border-gray-200 mx-6"></div>

            {/* Attachment */}
            {userInfo.isAdmin && (
              <div className="flex-1 min-w-[220px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attach Document
                </label>
                <button
                  onClick={() => {
                    uploadLPOFile(Encrypt(data._id), "Employee");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md shadowtransition"
                >
                  <PaperClipIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Upload</span>
                </button>
              </div>
            )}
          </div>
          {/* chart  */}
          <SalePersonChart
            customerId={Backdata._id}
            customerName={Backdata.firstName}
            business={businessInfo}
          />
          <br />
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-4 py-3 flex justify-between items-center text-left text-gray-800 font-medium hover:bg-gray-100 transition"
            >
              <h2 className="text-base/7 font-semibold text-gray-900">
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
              className={`px-4 py-3 text-gray-600 transition-all duration-300 ${
                isOpen ? "block" : "hidden"
              }`}
            >
              <form
                onSubmit={handleSubmit}
                className="border-b bg- border-gray-900/10 pb-12"
              >
                <p className="mt-1 text-sm/6 text-gray-600">
                  Ensure to provide correct Information.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="first-name"
                      className="block text-sm/6 font-medium text-gray-900"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="last-name"
                      className="block text-sm/6 font-medium text-gray-900"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="city"
                      className="block text-sm/6 font-medium text-gray-900"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="region"
                      className="block text-sm/6 font-medium text-gray-900"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor=""
                      className="block text-sm/6 font-medium text-gray-900"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="Country"
                      className="block text-sm/6 font-medium text-gray-900"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="region"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      State / Province
                    </label>
                    <div className="mt-2">
                      <select
                        id="stateOfOrigin"
                        name="stateOfOrigin"
                        onChange={handleChange}
                        autoComplete="stateOfOrigin"
                        className="col-start-1 w-full row-start-1 appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
                      className="block text-sm/6 font-medium text-gray-900"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="nextOfKin"
                      className="block text-sm/6 font-medium text-gray-900"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="EmaergencyContact"
                      className="block text-sm/6 font-medium text-gray-900"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="EmaergencyContactNumber"
                      className="block text-sm/6 font-medium text-gray-900"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label
                      htmlFor="HomeAddress"
                      className="block text-sm/6 font-medium text-gray-900"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="Gender"
                      className="block text-sm/6 font-medium text-gray-900"
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
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-slate-500 rounded-md px-3 py-2 mt-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
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
                className="w-full px-4 py-3 flex justify-between items-center text-left text-gray-800 font-medium hover:bg-gray-100 transition"
              >
                <h2 className="text-base/7 font-semibold text-gray-900">
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
                className={`px-4 py-3 text-gray-600 transition-all duration-300 ${
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
                        className="block text-sm/6 font-medium text-gray-900"
                      >
                        Work Location
                      </label>
                      <div className="mt-2">
                        <input
                          id="workLocation"
                          name="workLocation"
                          type="text"
                          value={formData.workLocation}
                          onChange={handleChange}
                          autoComplete="address-level2"
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="staffId"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Department"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 sm:col-start-1">
                      <label
                        htmlFor="jobTittle"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="pension"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 sm:col-start-1">
                      <label
                        htmlFor="city"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="BankName"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="StartDate"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="EndDate"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Salary"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Medical"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Transport"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Welfare"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="penDeduction"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="pfa"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="workEmail"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Sales_Target"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Target_Start"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="Deadline"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="ExpenseLimit"
                        className="block text-sm/6 font-medium text-gray-900"
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
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      </div>
                    </div>

                    {/* <div className="sm:col-span-2">
                        <label
                          htmlFor="ExpenseLimit"
                          className="block text-sm/6 font-medium text-gray-900"
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
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                      </div> */}
                  </div>
                  <button
                    type="submit"
                    className="bg-slate-500 rounded-md px-3 py-2 mt-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
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
                  className="w-full px-4 py-3 flex justify-between items-center text-left text-gray-800 font-medium hover:bg-gray-100 transition"
                >
                  <h2 className="text-base/7 font-semibold text-gray-900">
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
                  className={`px-4 py-3 text-gray-600 transition-all duration-300 ${
                    isOpen3 ? "block" : "hidden"
                  }`}
                >
                  <p className="mt-1 text-sm/6 text-gray-600">
                    Assign permissions based on {data.firstName}&lsquo;s job
                    roles.
                  </p>

                  <div className="mt-10 space-y-10 ">
                    <AccessControl businessInfo={businessInfo} data={data} />
                  </div>
                </div>
              </div>
            )}

            {user.isAdmin && (
              <>
                <h5 className="mt-6 text-sm font-semibold text-gray-900">
                  Files and Attachements
                </h5>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {data.Attachments.map((attachment, index) => (
                    <div
                      key={attachment._id}
                      className="relative w-full h-32 mb-4"
                    >
                      <Image
                        height={10}
                        width={10}
                        src={Dencrypt(attachment.Url)}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-32 object-cover rounded border border-gray-300 hover:shadow-md"
                      />
                      <button
                        className="absolute top-1 right-1 text-red-500 hover:text-red-700 transition"
                        onClick={() =>
                          DeleteAttachment(
                            userInfo._id,
                            "Employee",
                            attachment._id
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        {/* form ends here */}

        {user.isAdmin && (
          <div className="mt-6 flex items-center justify-end gap-x-6">
            {!data.firstTimeOnboard ? (
              <div className="flex gap-4">
                {/* <button
                type="button"
                onClick={()=>DeleteUser(data._id,businessInfo)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition"
              >
                Delete User Account
              </button> */}
                <button
                  type="submit"
                  onClick={() => sendInvite(data._id)}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-400 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Send Invitation</span>
                </button>
              </div>
            ) : (
              <button
                type="submit"
                onClick={() => DeactivateUser(Encrypt(data._id))}
                className={`rounded-md 
                ${data.status === "suspended" ? "bg-green-600" : "bg-red-600"}
                px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-${data.status === "suspended" ? "bg-green-800" : "bg-red-800"} focus-visible:outline-indigo-600 transition`}
              >
                {data.status === "suspended" ? "Activate User Account":"Deactivate User Account"}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function SalePersonChart({ customerId, customerName, business }) {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [tottalSales, setTotalSales] = useState();

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const currentYear = moment().format("YYYY");
        const url = `${EXPRESS_PRIVATE_URL}/api/SalseandStock?Year=${currentYear}`;

        const request = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${business.token}`,
            dbConnect: `Bearer ${business.rustyRoof}`,
            // access: `${Encrypt(userInfo._id)}`,
          },
        });

        const response = await request.json();

        if (!response.invoice) {
          setErrorMsg("No sales records available.");
          return;
        }

        const data = response.invoice.map((invoice) => ({
          sold: invoice.grandTotal,
          InvoiceDate: invoice.startDate,
          salesPerson: invoice.salesPerson,
        }));

        const productSales = data.filter(
          (item) => item.salesPerson === customerId
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
          title: `${customerName}s P2B Sales Trend for ${currentYear}`,
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
        <div className="flex justify-center items-center min-h-screen text-red-500 text-lg">
          {errorMsg}
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          <h5 className="text-lg font-semibold text-gray-700 mb-1">
            📈 Month-on-Month Insight for {tottalSales}
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
