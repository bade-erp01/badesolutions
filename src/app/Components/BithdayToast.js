"use client";
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

const BirthdayGreetings = ({ user,Business }) => {
  const [daysLeft, setDaysLeft] = useState(null);
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    if (moment(user.DOB).isValid()) {
      const birthdayThisYear = moment(user.DOB).year(moment().year());
      const today = moment();
      const diffDays = birthdayThisYear.diff(today, 'days');

      if (diffDays >= 0 && diffDays < 30) {
        setDaysLeft(diffDays);

        MySwal.fire({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 20000,
          timerProgressBar: true,
          customClass: {
            popup: 'swal2-subscription-toast'
          },
          html: `
            <div style="display: flex; align-items: center;">
              <img src="${user.image || "/person.png"}" alt="User Image" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 12px;" />
              <div style="text-align: left;">
                <strong style="font-size: 15px;">HAPPY BIRTHDAY ${user.firstName.toUpperCase()}🎉</strong><br/>
                <span style="font-size: 14px;">
                  On behalf of ${Business.companyName.toLowerCase()}, we celebrate you on this special day. Have all the fun in the world!...CHEERS!🥂
                </span>
              </div>
            </div>
          `
        });
      }
    }
  }, [user.DOB]); // Run effect when DOB changes

  return null; // This component only triggers the toast
};

export default BirthdayGreetings;
