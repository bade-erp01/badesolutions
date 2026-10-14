"use client";
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

const SubscriptionReminder = ({ Business }) => {
  const [daysLeft, setDaysLeft] = useState(null);
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    if (moment(Business?.subscriptionEndDate).isValid()) {
      const diffDays = moment(Business?.subscriptionEndDate).diff(moment(), 'days');

      if (diffDays >= 0 && diffDays < 30) {
        setDaysLeft(diffDays);

        MySwal.fire({
          toast: true,
          position: 'bottom-end',
        //   icon: 'info',
          showConfirmButton: false,
          timer: 10000,
          timerProgressBar: true,
          customClass: {
            popup: 'swal2-subscription-toast'
          },
          html: `
            <div style="display: flex; align-items: center;">
              <img src="${Business.companyLogo}" alt="Company Logo" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 12px; flex-shrink: 0;" />
              <div style="text-align: left;">
                <strong style="font-size: 14px;">${Business.companyName}</strong><br/>
                <span style="font-size: 14px;">Your subscription expires in <strong>${diffDays}</strong> day(s)</span>
              </div>
            </div>
          `
        });
      }
    }
  }, [Business?.subscriptionEndDate]);

  return null; // This component only triggers the toast
};

export default SubscriptionReminder;
