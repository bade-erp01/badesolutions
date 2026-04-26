import Swal from "sweetalert2";
import "animate.css";
import jwt from 'jsonwebtoken'
import {EXPRESS_PRIVATE_URL} from './Functions'

export function SuccessToast(message) {
    Swal.fire({
        title: `<h2 class='text-lg font-bold'>Success</h2>`,
        html: `
    <div class='flex flex-col items-center'>
      
      <h2 class='text-sm text-gray-600'> ${
       message
      }</h2>
     
    </div>
  `,
        icon: "success",
        showClass: {
            popup: `
                animate__animated
                animate__fadeInUp
                animate__faster
            `
        },
        hideClass: {
            popup: `
                animate__animated
                animate__fadeOutDown
                animate__faster
            `
        }
    });

    // ✅ Delay reset for better UX
    setTimeout(() => {
        Swal.close();
    }, 3000);
}


// ✅ Toast function (placed outside)
export function ErrorMessage(message) {
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

    Toast.fire({
        icon: "error",
        title: `${message}`
    });
}

// Toast fuction for please wait
export async function plsWait(text) {
  await Swal.fire({
    html: `
      <div class="animate__animated animate__fadeInDown" style="font-size: 0.85rem; font-weight: 500; color: #374151;">
        ${text}
      </div>
    `,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    background: "#f9fafb",
    customClass: {
      popup: "animate__animated animate__zoomIn rounded-xl shadow-md",
    },
    didOpen: () => {
      Swal.showLoading();
    },
  });
}



export async function AppDescription (params,Module) {
  try {

    Swal.fire({
      title: `<h2 class='text-lg font-bold'>${params.Name}</h2>`,
      html: `
    <div class='flex flex-col items-center'>
      <img src="${
        params.icon || "/preview.png"
      }" alt="${params.Name} image" class='w-48 h-48  object-cover rounded-md mb-4'>
      <br/>
      <hr/>
      <p class='text-sm text-gray-600'> ${
        params.Description || "No Description"
      }</p>
      <p class='text-sm text-gray-600'><strong>
    Origin : ${Module}</strong> </p>
    </div>
  `,
      showCancelButton: false,
      confirmButtonText: "Close",
      cancelButtonText: "",
      focusConfirm: true,
      
      customClass: {
        popup: "animate__animated animate__fadeInUp animate__faster",
        confirmButton:
          "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
        cancelButton:
          "bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400",
      },
    })
  } catch (error) {
    ErrorMessage(error.message);
  }
}

// Encrypt data from frontend
export function Encrypt(arg) {
  // if (!process.env.TenantToken) {
  //   throw new Error("TenantToken is not defined in environment variables");
  // }
  return jwt.sign(
    { id: arg },
    "THESTARTUPWAY",
    { expiresIn: "3d" } 
  );
}

export async function sendInvite(id,url,user,biz) {
  const { isConfirmed } = await Swal.fire({
    title: "Invite User?",
    html: `
      <style>
        @keyframes flap {
          0%, 100% { transform: rotateX(0deg); }
          50% { transform: rotateX(-50deg); }
        }
        .envelope-container {
          width: 64px;
          height: 48px;
          perspective: 800px;
          margin-bottom: 0.75rem;
        }
        .envelope {
          transform-style: preserve-3d;
          animation: flap 2s ease-in-out infinite;
        }
        .envelope svg {
          width: 64px;
          height: 48px;
          display: block;
        }
      </style>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div class="envelope-container">
          <div class="envelope">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2" fill="#E0E7FF" />
              <polyline points="2,4 12,13 22,4" fill="#C7D2FE" />
            </svg>
          </div>
        </div>
        <p>This will send an invitation to onboard.</p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonColor: "#4F46E5",
    cancelButtonColor: "#9CA3AF",
    confirmButtonText: "Yes, Send it!",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
  });

  if (!isConfirmed) return;

  Swal.fire({
    title: "Sending Invite...",
    text: "Please wait while we check user status.",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const response = await fetch(`${url}/api/onboard/invite/${id}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${biz}`,
        access: `${user}`,
      },
    });

    const data = await response.json();

    if (data?.message) {
      SuccessToast(data.message);
    } else {
      throw new Error(data.error );
    }
  } catch (error) {
    ErrorMessage(error.message);
  }
}



export const SendTimeOutLink = async (id,Business,user,url) => {
  const { isConfirmed } = await Swal.fire({
    title: "Send Time off form?",
    text: "This will send Time off request for to the user's email.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#5db32c",
    cancelButtonColor: "#6B7280",
    confirmButtonText: "Yes, send it!",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
  });

  if (!isConfirmed) {
    return;
  }


  plsWait("Please wait...")

  try {
    const response = await fetch(`${url}/api/timeOff_invitation/${Encrypt(id)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(Business)}`,
        access: `${Encrypt(user)}`
      },
    });

    const data = await response.json();
    if (data.message) {
      SuccessToast(data.message);
    } else {
      throw new Error(data.error || "Failed to send mail");
    }
  } catch (error) {
    ErrorMessage(error.message);
  }
};



module.export = {
    ErrorMessage,
    SuccessToast,
    plsWait,
    AppDescription,
    Encrypt,
    sendInvite,
    SendTimeOutLink,
    
}
