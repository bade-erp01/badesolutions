"use client";
import { useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';
import confetti from 'canvas-confetti';

const BirthdayGreetings = ({ user, Business }) => {
  const MySwal = withReactContent(Swal);
  const audioRef = useRef(null);

  // Extended list of birthday messages
  const birthdayMessages = [
    `On behalf of ${Business.companyName.toLowerCase()}, we celebrate you on this special day. May your year be filled with joy and success! 🎈`,
    `Cheers to you, ${user.firstName?.toUpperCase() || 'User'}! ${Business.companyName.toLowerCase()} wishes you laughter, love, and cake today! 🍰`,
    `Happy Birthday from all of us at ${Business.companyName.toLowerCase()}! May your day be as amazing as you are! 🌟`,
    `Wishing you a fantastic birthday, ${user.firstName?.toUpperCase() || 'User'}! ${Business.companyName.toLowerCase()} sends hugs, smiles, and confetti! 🎊`,
    `It’s your day! ${Business.companyName.toLowerCase()} celebrates your awesomeness. Have all the fun in the world! 🥳`,
    `Sending birthday magic your way, ${user.firstName?.toUpperCase() || 'User'}! ${Business.companyName.toLowerCase()} hopes your day sparkles with happiness. ✨`,
    `From all of us at ${Business.companyName.toLowerCase()}, may your birthday be filled with sunshine, smiles, and sweet surprises! 🌞`,
    `Today is all about you, ${user.firstName?.toUpperCase() || 'User'}! ${Business.companyName.toLowerCase()} is proud to celebrate your brilliance. 💡`,
    `Another year of greatness begins! ${Business.companyName.toLowerCase()} is cheering you on—go shine! 💫`,
    `You’re not just a year older—you’re a year better! ${Business.companyName.toLowerCase()} celebrates your growth and glow. 🌱`,
    `Let the balloons fly and the music play! ${Business.companyName.toLowerCase()} wishes you a birthday full of unforgettable moments. 🎶`,
    `To the incredible ${user.firstName?.toUpperCase() || 'User'}, ${Business.companyName.toLowerCase()} sends love, laughter, and limitless joy. ❤️`,
  ];

  useEffect(() => {
    if (!user?.DOB || !Business?.companyName) return;

    const now = moment();
    const today = now.clone().startOf('day');
    const birthdayThisYear = moment(user.DOB).year(today.year()).startOf('day');

    const toastKey = `birthday-toast-${user._id}-${today.format('YYYY-MM-DD')}`;
    const toastData = JSON.parse(localStorage.getItem(toastKey) || '{}');

    // Reset at midnight
    if (toastData.date !== today.format('YYYY-MM-DD')) {
      localStorage.removeItem(toastKey);
    }

    // Determine time slot
    const currentHour = now.hour();
    const timeSlot = currentHour < 12 ? 'morning' : 'evening';

    // Check if toast for this slot has been shown
    if (
      birthdayThisYear.isSame(today) &&
      (!toastData[timeSlot] || toastData.date !== today.format('YYYY-MM-DD'))
    ) {
      // Update localStorage
      const updatedToastData = {
        ...toastData,
        date: today.format('YYYY-MM-DD'),
        [timeSlot]: true,
      };
      localStorage.setItem(toastKey, JSON.stringify(updatedToastData));

      // Confetti burst
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Play birthday sound
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.warn("Audio playback failed:", err);
        });
      }

      // Pick a random message
      const randomMessage =
        birthdayMessages[Math.floor(Math.random() * birthdayMessages.length)];

      // Show SweetAlert2 toast
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
                ${randomMessage}
              </span>
            </div>
          </div>
        `,
      });
    }
  }, [user?.DOB, Business?.companyName]);

  return (
    <>
      {/* Birthday Sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/086060_tadawav-85939.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </>
  );
};

export default BirthdayGreetings;
