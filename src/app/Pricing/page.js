'use client';
import React from 'react';
import Nav1 from '../Components/Nav1';
import Footer1 from '../Components/Footer1';
import { useRouter } from 'next/navigation';
import Marquee from "react-fast-marquee";
import Image from "next/image"



export default function Pricing() {
    const router = useRouter();

    return (
        <>
            <div className=" py-16 px-6 md:px-12" 
                 style={{
          backgroundImage: 'url("/josh-calabrese-Ca8r0PSWg9Q-unsplash.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(30%)",
          zIndex: -2,
        }}
            >
        <Nav1 />
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                       User friendly cloud based ERP to boost productivity.
                    </h1>
                    <p className="text-black/50 text-md mt-2 font-semibold tracking-wide">
                        Trusted by forward-thinking individuals and businesses worldwide.
                    </p>
                    <div className="w-full text-center mt-6">
                    <Marquee gradient={false} speed={40} className="w-full py-3">
                    <div className="flex items-center gap-4 px-4">
                        {[
                        { src: "/logo.jpg", label: "Synergy" },
                        { src: "/logo2.jpg", label: "Tojec" },
                        { src: "/logo3.jpg", label: "world Distributors" },
                        { src: "/WhatsApp Image 2025-03-12 at 09.55.20_dfbb45cd.jpg", label: "Amaco Resources" },
                        { src: "https://allchannels.com.ng/logo.jpg", label: "AllChannels" }
                        ].map((item, index) => (
                        <div key={index} className="flex flex-col items-center group">
                        <Image
                            width={40}
                            height={40}
                            loading="eager"
                            priority={true}
                            src={`${item.src}?width=80&quality=90`}
                            alt={`avatar-${index}`}
                            className="w-10 h-10 rounded-full border-2 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="text-sm font-semibold mt-1 text-center text-white group-hover:text-blue-500 group-hover:font-semibold transition duration-300">
                            {/* {item.label} */}
                        </span>
                        </div>
                        ))}
                    </div>
                    </Marquee>
                    </div>
                </div>
                {/* Pricing Cards */}
                <div className="grid grid-cols-1  md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {/* Personal Plan */}
                    <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic License</h3>
                         <p className="text-sm text-gray-700 mb-4">For SME&lsquo;S</p>
                        <div className="text-xl font-bold mb-2">₦2,500/ user / Month</div>
                        <button  onClick={()=>(router.push('/auth/SignUp?plan=Basic'))} className="w-full bg-gray-900 text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition">
                          Get Basic License
                        </button>
                        <ul className="text-sm text-gray-600 mt-4 space-y-2">
                            {/* <li>Email support</li> */}
                            <li>Access Sales modules only</li>
                            <li>Limited Api Access</li>
                            <li>Default 4 Active users</li>
                        </ul>
                    </div>
                    {/* Standard Plan */}
                    <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-lg rounded-lg p-6 text-center relative">
                        <span className="absolute top-4 right-4 bg-orange-500 text-xs font-bold px-2 py-1 rounded-full">MOST POPULAR</span>
                        <h3 className="text-lg font-semibold mb-2">Standard License</h3>
                        <p className="text-sm text-gray-300 mb-4">For freelancers & solopreneurs</p>
                        <div className="text-xl font-bold mb-2">₦4,000/ user / Month </div>
                        <button onClick={()=>(router.push('/auth/SignUp?plan=Standard'))} className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
                            Get Standard License
                        </button>
                        <ul className="text-sm text-gray-300 mt-4 space-y-2">
                            <li>Multi Business Management</li>
                            <li>Private Cloud Backup</li>
                            <li>Api for Financial / Reporting Tools</li>
                            <li>Request Customized module</li>
                            <li>5G Wifi router (Aitel,MTN,Glo)</li>
                            <li>Dedicated 3GB storage</li>
                            <li>Training / Support</li>
                            <li>Access to Bade Accounting Modules</li>
                            <li>Access to App Store</li>
                            <li>Default 6 Active users</li>
                        </ul>
                    </div>
                    {/* Pro Plan */}
                    <div className="bg-white shadow-lg border-1 border-neutral-200 rounded-lg p-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro License</h3>
                        <p className="text-sm text-gray-500 mb-4">For professionals & teams</p>
                        <button className="w-full bg-gray-900 text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition">
                        Contact Sales
                        </button>
                        <ul className="text-sm font-semibold text-gray-600 mt-4 space-y-2">
                            <li>Unlimited Users</li>
                            <li>Fully Customizable Deployment</li>
                            <li>VPS (Virtual Private Server)</li>
                            <li>Customized Business Email</li>
                            <li>Priority support</li>
                            <li>Unlimited Api Access</li>
                            <li>Google S.E.O</li>
                            <li>Dedicated 32GB storage</li>
                            <li>Email & Phone support</li>
                            <li>Trained Business AI Model</li>
                            <li>Private Cloud Backup</li>
                            <li>Dedicated cloud server</li>
                            <li>Api Support for Financial / Reporting Tools</li>
                            
                        </ul>
                    </div>
                </div>
                {/* Footer Note */}
                <div className="text-center text-sm text-white font-bold mt-12">
                    <p>Contact Support: <b><a href='mailto:Operations@badesolutions.com.ng'>Operations@badesolutions.com.ng</a></b></p>
                    <br />
                    <h5>Fully Built Nigerian ERP Tailored to meet your Business Needs.</h5>
                    <h2><b>PROUDLY NIGERIAN 💪 &#127475;&#127468;</b></h2>
                </div>
            </div>
            <Footer1 />
        </>
    );
}

