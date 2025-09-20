"use client";
import Swal from "sweetalert2";
import { BellAlertIcon } from "@heroicons/react/24/outline";

export default function UserNotification({ user }) {
  const notifications = user.Notification || [];
  const unseenCount = notifications.filter(n => n.status === "Unseen").length;
  const pageSize = 5;
  const totalPages = Math.ceil(notifications.length / pageSize);

  const showModal = () => {
    let currentPage = 1;

    const renderPage = () => {
      const start = (currentPage - 1) * pageSize;
      const pageItems = notifications.slice(start, start + pageSize);

      const htmlContent =
        pageItems.length === 0
          ? `<div class="text-center text-gray-500 py-6">No notifications</div>`
          : pageItems
              .map(
                (n) => `
              <div class="flex items-start gap-3 p-4 mb-3 rounded-lg shadow-sm ${
                n.status === "Unseen" ? "bg-yellow-50" : "bg-gray-50"
              }">
                <div class="flex-1">
                  <div class="font-medium text-sm text-gray-800">${n.Title}</div>
                  ${
                    n.BASE_URL
                      ? `<a href="${n.BASE_URL}" class="text-blue-600 text-xs underline mt-1 inline-block">View Details</a>`
                      : ""
                  }
                </div>
                <span class="text-xs px-2 py-1 rounded-full ${
                  n.status === "Unseen"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-gray-200 text-gray-600"
                }">${n.status}</span>
              </div>
            `
              )
              .join("");

      const paginationControls = `
        <div class="flex justify-between items-center mt-4">
          <button id="prevPage" class="px-3 py-1 text-sm rounded-md ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }">Prev</button>
          <span class="text-sm text-gray-600">Page ${currentPage} of ${totalPages}</span>
          <button id="nextPage" class="px-3 py-1 text-sm rounded-md ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }">Next</button>
        </div>
      `;

      Swal.update({
        html: `
          <div class="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            ${htmlContent}
          </div>
          ${totalPages > 1 ? paginationControls : ""}
        `,
      });

      setTimeout(() => {
        if (currentPage > 1) {
          document.getElementById("prevPage").onclick = () => {
            currentPage--;
            renderPage();
          };
        }
        if (currentPage < totalPages) {
          document.getElementById("nextPage").onclick = () => {
            currentPage++;
            renderPage();
          };
        }
      }, 0);
    };

    Swal.fire({
      title: `<div class="text-lg font-semibold text-gray-800">Notifications</div>`,
      html: `<div id="notificationContent"></div>`,
      width: 520,
      showConfirmButton: false,
      customClass: {
        popup: "rounded-lg p-0",
      },
      didOpen: () => {
        renderPage();
      },
    });
  };

  return (
    <button
      onClick={showModal}
      className="relative flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white text-sm transition w-full group"
      title="View your notifications"
    >
      <div className="relative">
        <BellAlertIcon className="w-5 h-5" />
        {unseenCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse z-10">
            {unseenCount > 99 ? "99+" : unseenCount}
          </span>
        )}
      </div>
      Notifications
    </button>
  );
}
