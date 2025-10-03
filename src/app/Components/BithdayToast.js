"use client";
import { useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';
import confetti from 'canvas-confetti';

const BirthdayGreetings = ({ user, Business }) => {
  const MySwal = withReactContent(Swal);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!user?.DOB || !Business?.companyName) return;

    const today = moment().startOf('day');
    const birthdayThisYear = moment(user.DOB).year(today.year()).startOf('day');

    if (birthdayThisYear.isSame(today)) {
      // 🎉 Trigger Confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });

      // 🔊 Play Birthday Sound
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.warn("Audio playback failed:", err);
        });
      }

      // 🎂 Show Toast
      MySwal.fire({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 20000,
        timerProgressBar: true,
        customClass: {
          popup: 'swal2-subscription-toast',
        },
        html: `
          <div style="display: flex; align-items: center;">
            <img src="${user.image || '/person.png'}" alt="User Image" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 12px;" />
            <div style="text-align: left;">
              <strong style="font-size: 15px;">HAPPY BIRTHDAY ${user.firstName?.toUpperCase() || 'User'} 🎉</strong><br/>
              <span style="font-size: 14px;">
                On behalf of ${Business.companyName.toLowerCase()}, we celebrate you on this special day. Have all the fun in the world!...CHEERS! 🥂
              </span>
            </div>
          </div>
        `,
      });
    }
  }, [user?.DOB, Business?.companyName]);

  return (
    <>
      {/* 🔊 Birthday Sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/086060_tadawav-85939.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </>
  );
};

export default BirthdayGreetings;
