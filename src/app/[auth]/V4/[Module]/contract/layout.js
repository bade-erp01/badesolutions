import React, { Suspense, lazy } from "react";
import BackButton from "@/app/Components/BackBotton";
import Notch from "@/app/Components/Notch";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";

export default async function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Notch>
        <BackButton />
        <hr />
      </Notch>

      {/* Main Content */}
      <main className="flex-1">
        <Suspense fallback={<SuspenenseFallBack pagedata={`Contracts`} />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
