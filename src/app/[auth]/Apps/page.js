"use client";
import "animate.css";
import React, { useState, useEffect } from "react";
import dummyData from "../../../data/dummyData.json";
import Image from "next/image";
import {EXPRESS_PRIVATE_URL} from "../../../../Functions/Functions"
import Nav1 from "@/app/Components/Nav1";
import Footer2 from "@/app/Components/Footer2";
import {
  plsWait,
  ErrorMessage,
  SuccessToast,
  AppDescription
} from "../../../../Functions/Mics";
import { Encrypt } from "../../../../Functions/Functions";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ModulesPage = ({userInfo}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <Nav1
        user={userInfo.user}
        business={userInfo.business}
        page={`App Store`}
      />
      <div className="p-6 isolate  pt-14 lg:px-8 min-h-screen">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Explore Our Powerful Modules
        </h1>
        <p className="text-center text-gray-600 max-w-xl mx-auto mb-8">
          Unlock the full potential of your business with our expertly crafted
          modules. From seamless integrations to advanced functionalities, these
          tools are designed to streamline operations, enhance productivity, and
          drive growth.
        </p>

        {isMounted && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dummyData.map((item, index) => (
              <ModuleCard key={item.id || index} item={item} userInfo={userInfo}/>
            ))}
          </div>
        )}
      </div>
      <Footer2 />
    </>
  );
};

const ModuleCard = ({ item,userInfo }) => {
   const Router = useRouter()
  const [expanded, setExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const TenantId = userInfo?.business._id || "";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePayment = async (module) => {
    try {
      if ( !userInfo) {
        window.location.href = "/Pricing";
        return;
      }

      plsWait(
        `Setting up installation for ${module.Name} Module.`
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const request = await fetch(`${EXPRESS_PRIVATE_URL}/api/Payment_Collection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await Encrypt(TenantId)}`,
        },
        body: JSON.stringify(module),
      });

      const response = await request.json();
      
      if (response.error) {
        throw new Error(response.error);
      }

      if(response.data){
        window.location.href = response.data
      }
      
    } catch (err) {
      console.log(err.message)
      ErrorMessage(`Something went wrong...Please try again`);
    }
  };

  return (
    isMounted && (
      <div
        className="relative shadow-md rounded-lg p-2 transition-transform transform hover:scale-105 w-80 bg-cover bg-center animate__animated animate__fadeInUp animate__faster"
        style={{
          backgroundImage: `url('/assets/Copilot_20250529_150010.png')`,
        }}
      >
        <div className="relative z-10 opacity-100 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            {item.icon && (
              <Image
                src={
                  item.icon.startsWith("http")
                    ? item.icon
                    : `/assets/${item.icon}`
                }
                alt="icon"
                width={40}
                height={40}
                className="rounded"
              />
            )}
            <h2 className="text-lg font-semibold text-gray-700">{item.Name}</h2>
          </div>

          <div className="mt-3">
            <p className="text-gray-600">
              {expanded
                ? item.Description
                : `${item.Description.slice(0, 50)}...`}
            </p>

            {expanded && item.apps?.length > 0 && (
              <div
                className="text-gray-600 bg-cover bg-center"
                style={{
                  backgroundImage: `url('/assets/Copilot_20250529_150010.png')`,
                }}
              >
                <hr />
                <small>Apps in Module</small>
                {item.apps.map((app, index) => (
                  <div
                    onClick={()=>AppDescription(app,item.Name)}
                    key={app.id || index}
                    className="relative p-2 transition-transform transform hover:scale-105 hover:shadow-md hover:rounded-lg hover:bg-purple-300"
                    title={app.Description}
                  >
                    <ul className="flex flex-col md:flex-row items-center justify-between">
                      <div className="flex flex-col md:flex-row items-center justify-between">
                        <small>{index + 1}; </small>
                        <li>
                          <Image
                            src={app.icon}
                            width={20}
                            height={20}
                            alt={app.Name}
                          />
                        </li>
                      </div>
                        <li className="text-sm">
                          <small>{app.Name}</small>
                        </li>
                     {/*  */}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <button
              className="text-blue-500 text-sm mt-2 hover:underline"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show Less" : "Read More"}
            </button>
          </div>

          {!item.installed && (
          <small className=" text-md text-gray-600 flex items-center space-x-1 font-bold">
            <span>Secured payment with</span>
            <Image
              height={70}
              width={70}
              src="/assets/paystack-logo-png_seeklogo-409509-removebg-preview.png"
              alt="Paystack Logo"
              className="inline-block"
            />
          </small>
          )}

          {!item.installed ? (
            userInfo  ? (
              <button
                onClick={() => handlePayment(item)}
                className="mt-4 w-full bg-[#683874] text-white py-2 rounded-lg hover:bg-[#a073c5] transition"
              >
                Start your Expereience @ ₦{item.Amount}
              </button>
            ) : (
              <button
                onClick={() => (window.location.href = "/Pricing")}
                className="mt-4 w-full bg-[#33302fde] text-white py-2 rounded-lg hover:bg-[#33302f] transition"
              >
                 Start your Expereience @ ₦{item.Amount}
              </button>
            )
          ) : null}
        </div>
      </div>
    )
  );
};

export default ModulesPage;
