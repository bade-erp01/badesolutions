import React, { Suspense, lazy } from "react";
import BackButton from "@/app/Components/BackBotton";
import Notch from "@/app/Components/Notch";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";

export default async function StoreLayout2({ children }) {
  return (
    <div className="flex flex-col">
      <Notch>
        <BackButton />
        <hr />
      </Notch>

      {/* Main Content */}
      <main className="flex-1">
        <Suspense fallback={<SuspenenseFallBack pagedata={`Subscriptions`} />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
