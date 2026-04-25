"use client";

import { useState } from "react";
import Card from "@/app/Components/Card";

export default function CustomerGrid({ customerList, moduleParams }) {
  const [selectedLetter, setSelectedLetter] = useState(null);

  // Sort customers alphabetically
  const sortedCustomers = [...customerList].sort((a, b) =>
    a.Username.localeCompare(b.Username),
  );

  // Filter by selected letter
  const filteredCustomers = selectedLetter
    ? sortedCustomers.filter((c) => {
        const firstChar = c.Username.charAt(0);
        if (selectedLetter === "#") {
          // Show usernames starting with special characters
          return !/[a-z0-9]/i.test(firstChar);
        }
        return firstChar.toLowerCase() === selectedLetter.toLowerCase();
      })
    : sortedCustomers;
selectedLetter
  // Build alphabet array dynamically
  const numbers = Array.from({ length: 10 }, (_, i) => i.toString());
  const uppercase = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i),
  );

  const specials = ["#"]; // you can add more like "@", "$", "%", etc.

  const alphabet = [...specials, ...numbers, ...uppercase];

  return (
    <div className="flex flex-wrap">
      {/* Card Grid */}
      {filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-2 flex-1">
          {filteredCustomers.map((element) => (
            <Card
              key={element._id}
              data={element}
              module={moduleParams}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-700">
          <p className="mb-6 text-red-400">
            Oops... "{selectedLetter}" does not match with any customer name.
          </p>
        </div>
      )}

      {/* Alphabet Sidebar */}
      <div
        className="fixed right-0 top-20 bottom-30 h-148 w-16 flex flex-col items-center space-y-2 bg-white/80 shadow-md p-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#4B5563 transparent",
          overflowY: "scroll",
          overflowX: "hidden",
        }}
      >
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => setSelectedLetter(letter)}
            className={`text-xs text-black ${
              selectedLetter === letter
                ? "px-2 py-1 bg-gray-300 text-indigo-500"
                : "hover:text-gray-300"
            }`}
          >
            {letter}
          </button>
        ))}
        {/* Reset option */}
        <button
          onClick={() => setSelectedLetter(null)}
          className="mt-4 px-1 py-1 rounded bg-red-400 text-black twxt-xs"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
