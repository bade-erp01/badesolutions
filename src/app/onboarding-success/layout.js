import React from "react";

export default function layout({ children }) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: 'url("/adrian-sulyok-c_4eaGRDSVU-unsplash.jpg ")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "grayscale(40%)",
        zIndex: -2,
      }}
    >
      {children}
    </div>
  );
}
