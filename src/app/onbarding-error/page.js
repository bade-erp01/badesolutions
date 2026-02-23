"use client"
import React from 'react'
import Nav1 from "@/app/Components/Nav1";
import Footer1 from "@/app/Components/Footer1";
import {useRouter} from "next/navigation";

export default function OnboardingError({ message = "An error occurred during onboarding. Please contact support if the issue persists." }) {
    const router = useRouter();
    const handleGetStarted = () => {
        router.push("/");
    };
    return (
        <>
        <Nav1 />
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Onboarding Error</h1>
                <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
                <button 
                    onClick={handleGetStarted}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
                >
                    Return to Home
                </button>
            </div>
        </div>
        <Footer1 />
        </>
    )
}