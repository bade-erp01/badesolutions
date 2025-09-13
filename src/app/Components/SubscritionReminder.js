"use client";
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

const SubscriptionReminder = ({ Business }) => {
  const [daysLeft, setDaysLeft] = useState(null);
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    if (moment(Business.subscriptionEndDate).isValid()) {
      const diffDays = moment(Business.subscriptionEndDate).diff(moment(), 'days');

      if (diffDays >= 0 && diffDays < 30) {
        setDaysLeft(diffDays);

        MySwal.fire({
          toast: true,
          position: 'bottom-end',
          icon: 'info',
          title: `Your subscription expires in ${diffDays} day(s)`,
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          customClass: {
            popup: 'swal2-subscription-toast'
          }
        });
      }
    }
  }, [Business.subscriptionEndDate]);

  return null; // This component only triggers the toast
};

export default SubscriptionReminder;
