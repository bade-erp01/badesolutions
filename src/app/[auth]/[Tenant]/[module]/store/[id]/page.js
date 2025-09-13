"use client";
import Card from "@/app/Components/Card";
import { useState } from "react";

export default function Page({ products }) {
  const [StoreList, setStoreList] = useState(JSON.parse(products));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {StoreList.map((element) => (
          <Card
            key={element._id}
            data={element}
            module="store"
            className="shadow-lg rounded-lg bg-white hover:shadow-xl transition-shadow duration-300"
          />
        ))}
    </div>
  );
}
