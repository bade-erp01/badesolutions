"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AtSymbolIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import api from "@/lib/api";
import { plsWait, SuccessToast, ErrorMessage } from '../../../Functions/Mics';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const MailAndWhatsapp = ({ 
    billStatus = '',
    billId,
    firstName,
}) => {
    const router = useRouter();
    const [isMailLoading, setIsMailLoading] = useState(false);

    const onMailClick = async () => {
        setIsMailLoading(true);
        plsWait("Sending email...");

        try {
            const mailPath = `/api/sendmail/${billId}/${encodeURIComponent(firstName || "")}`;

            // POST: sending mail is a write, so it carries the CSRF token
            const request = await api.post(mailPath, undefined, {
                headers: {
                    "idempotency-key": `quote-${billId}`,
                },
            });
            if (request.status === 0) throw new Error(request.error);

            const response = request.data || { error: request.error };

            if (response.message) {
                SuccessToast(response.message);
                router.refresh();
            }
            if (response.error) {
                ErrorMessage(response.error);
            }
        } catch (error) {
            ErrorMessage("Failed to send email. Please try again.");
        } finally {
            setIsMailLoading(false);
        }
    };

    const onWhatsappClick = () => {
        ErrorMessage("Whatsapp feature is coming soon!");
        // router.refresh();
    };

    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex flex-wrap items-center gap-2 mt-3">
                
                {/* Email Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={onMailClick}
                            disabled={isMailLoading}
                            variant="defalut"
                            size="sm"
                            className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                        >
                            {isMailLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <AtSymbolIcon className="w-4 h-4" />
                            )}
                            Email
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Send {billStatus} via Email
                    </TooltipContent>
                </Tooltip>

                {/* WhatsApp Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={onWhatsappClick}
                            variant="default"
                            size="sm"
                            className="flex items-center gap-2 hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all"
                        >
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            WhatsApp
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Send via WhatsApp (Coming Soon)
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
};

export default MailAndWhatsapp;