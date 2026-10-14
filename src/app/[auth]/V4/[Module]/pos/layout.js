import React, { Suspense, lazy } from "react";
import BackButton from "@/app/Components/BackBotton";
import Notch from "@/app/Components/Notch";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";

export default async function Layout({ children }) {
  return (
    <div className="flex flex-col min-w-0">
      <Notch>
        <BackButton />
        <hr />
      </Notch>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <Suspense fallback={<SuspenenseFallBack pagedata={`Point of sale (POS)`} />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
