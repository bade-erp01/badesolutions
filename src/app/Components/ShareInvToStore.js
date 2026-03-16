"use client"

import React from 'react';
import { ShareIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Encrypt } from "../../../Functions/Functions";
import {plsWait, SuccessToast, ErrorMessage} from '../../../Functions/Mics';
import {useRouter} from 'next/navigation';

const ShareInvToStore = ({ 
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
        const api = `${baseUrl}/api/sendMail_To_Store/${Encrypt(billId)}`;

        const request = await fetch(api, {
            method: "GET",
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${Encrypt(businessToken)}`,
                access: `${Encrypt(userId)}`,
                "idempotency-key": `Mail-${billId}`,
            },
        });
        const response = await request.json();

        if (response.message) {
            SuccessToast(response.message);
            router.refresh();
        }
        if (response.error) ErrorMessage(response.error);
    };

    return (
        <div className="flex gap-2 mt-2">
            
            {/* Mail Button */}
            <button
                title={`Send via Mail ${billStatus} with storeKeeper`}
                onClick={onMailClick}
                className=" rounded-sm p-2 text-xs mr-1 group inline-flex items-center gap-3 px-3 bg-gray-700/50 py-2  text-gray-100 font-semibold hover:border border-gray-200 hover:shadow-lg hover:bg-gray-500/50 transition duration-200 ease-in-out w-full"
            >
                <ShareIcon className="w-4 h-4 text-gray-100" />
                Share with storeKeeper.
            </button>
        </div>
    );
};

export default ShareInvToStore;