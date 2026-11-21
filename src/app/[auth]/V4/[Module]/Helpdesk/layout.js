import React, { Suspense } from "react";
import BackButton from "@/app/Components/BackBotton";
import Notch from "@/app/Components/Notch";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";

export default async function HelpdeskLayout({ children }) {
  return (
    <div className="flex flex-col">
      <Notch>
        <BackButton />
        <hr />
      </Notch>
      <main className="flex-1">
        <Suspense fallback={<SuspenenseFallBack pagedata={`Help Desk`} />}>{children}</Suspense>
      </main>
    </div>
  );
}
