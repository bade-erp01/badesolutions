"use client"

import React from 'react';
import { AtSymbolIcon,ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Encrypt } from "../../../Functions/Functions";
import {plsWait, SuccessToast, ErrorMessage} from '../../../Functions/Mics';
import {useRouter} from 'next/navigation';

const MailAndWhatsapp = ({ 
    billStatus = '',
    billId,
    firstName,
    userId,
    businessToken,
    baseUrl
}) => {
    const router = useRouter();

    const onMailClick = async () => {
        plsWait("Sending Mail");
        const api = `${baseUrl}/api/sendmail/${Encrypt(billId)}/${firstName}`;

        const request = await fetch(api, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                dbConnect: `Bearer ${businessToken}`,
                access: `${Encrypt(userId)}`,
            },
        });
        const response = await request.json();

        if (response.message) {
            SuccessToast(response.message);
            router.refresh();
        }
        if (response.error) ErrorMessage(response.error);
    };

    const onWhatsappClick = async () => {
        ErrorMessage("Whatsapp feature coming soon!");
        router.refresh();
    };

    return (
        <div className="flex gap-2 mt-2">
            
            {/* Mail Button */}
            <button
                title={`Send via Mail ${billStatus}`}
                onClick={onMailClick}
                className="mr-1 group inline-flex items-center gap-3 px-3 bg-gray-100/50 py-2 rounded-full text-gray-200 font-semibold hover:border border-gray-200 hover:shadow-lg hover:bg-gray-100/50 transition duration-200 ease-in-out"
            >
                <AtSymbolIcon className="w-4 h-4 text-blue-300" />
            </button>

            {/* WhatsApp Button */}
            <button
                title="Send via Whatsapp"
                onClick={onWhatsappClick}
                className="mr-1 group inline-flex items-center gap-3 px-3 py-2 rounded-full text-gray-200 font-semibold hover:border border-gray-200 hover:shadow-lg hover:bg-gray-100/50 transition duration-200 ease-in-out"
            >
                <ChatBubbleLeftRightIcon className="w-4 h-4 text-green-300"/>
            </button>
        </div>
    );
};

export default MailAndWhatsapp;