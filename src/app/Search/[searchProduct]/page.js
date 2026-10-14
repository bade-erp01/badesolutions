"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Dencrypt,Encrypt } from "../../../../Functions/Functions";
import {ErrorMessage,SuccessToast, plsWait,} from "../../../../Functions/Mics"
import SearchCard from "../../Components/SearchResult";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import Fuse from "fuse.js";
import Image from "next/image";
import {useRouter} from "next/navigation";

export default function SearchResultPage({ result, linkData, baseUrl }) {
  const searchParams = useSearchParams();
  const Module = searchParams.get("search");
  const page = useParams();
  const searchTerm = Module?.toLowerCase().trim() || "";

  const [loading, setLoading] = useState(true);
  const [UserData] = useState(linkData);
  const [resultArray] = useState(Dencrypt(result));
  const [filteredModules, setFilteredModules] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter()
  // Track selected IDs
  const [selectedIds, setSelectedIds] = useState([]);

  // Toggle handler
  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id) // remove if already selected
        : [...prev, id] // add if not selected
    );
  };

  // Delete handler
  const handleDeleteSelected = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.length} selected entr${selectedIds.length > 1 ? "ies" : "y"}?`
      )
    ) {
      try {
        plsWait(`Submiting request to delete ${selectedIds.length} entr${selectedIds.length > 1 ? "ies" : "y"}`)

        // Call your backend delete API
        const response = await fetch(`${baseUrl}/api/delete/multiple`, {
          method: "DELETE",
          headers: { 
            "Content-Type": "application/json",
             Authorization: `Bearer ${Encrypt(UserData.business.tenantId)}`,
             access: `${Encrypt(UserData.user._id)}`,
             sessionKey: `Bearer ${Encrypt(UserData.SessionId)}`
           },
          body: JSON.stringify({ ids: Encrypt(selectedIds) }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete entries");
        }

        // Remove deleted items from UI
        setFilteredModules((prev) =>
          prev.filter((item) => !selectedIds.includes(item._id))
        );
        setSelectedIds([]);
        SuccessToast("Selected entries deleted successfully.");
        router.refresh()
      } catch (err) {
        ErrorMessage(err.message)
      }
    }
  };

  useEffect(() => {
    const handleSearch = async () => {
      try {
        const fuse = new Fuse(resultArray, {
          includeScore: true,
          threshold: 0.3,
          keys: [
            "Name","description","paymentReferenceNo","firstName","lastName","Email","telephone","phone","status",
            "ADCcode","ACDcode","billStatus","crAmount","Accountant","ProductName","WHName","Username","productName",
            "billReferenceNo","customerName","CustomerCode","startDate","RaiseBy","invoicelocation","WayBillNo",
            "DriverName","DriverNumber","vehicleNumber","priceList","category","Debt","ContactPerson","CreditId",
            "DebitId","customer","refNo","transferedDate","recievedDate","ResidualValue","AssetCode","SerialNumber",
            "Category"
          ],
        });

        const results = fuse.search(searchTerm);
        const filtered = results.map(({ item }) => item);
        setFilteredModules(filtered);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    handleSearch();
  }, [searchTerm, resultArray]);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-between px-4">
        <p className="text-sm text-gray-800 text-center break-words">
          Searching for{" "}
          <span className="text-purple-600 font-bold">
            &lsquo;{searchTerm}&lsquo;
          </span>{" "}
          in {page.searchProduct} List...
        </p>
        <div className="w-10" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center px-4">
        {filteredModules.length > 0 ? (
          <p className="text-sm text-center break-words">
            Showing Search result for{" "}
            <span className="text-purple-600 font-bold">
              &lsquo;{searchTerm}&lsquo;
            </span>{" "}
            in {page.searchProduct} List...
          </p>
        ) : null}
        

        <div
          className="grid gap-6 w-full max-w-5xl"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))",
          }}
        >
          {filteredModules.length > 0 ? (
            filteredModules.map((product) => (
              <SearchCard
                key={product._id}
                data={product}
                module={page.searchProduct}
                UserData={UserData}
                selected={selectedIds.includes(product._id)}
                onToggle={toggleSelection}
                showCheckbox={product.billStatus === "Draft"}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center py-12">
              <Image
                src="/download__1_-removebg-preview.png"
                alt="Searching Eyes Illustration"
                width={128}
                height={128}
                className="mb-2 animate__animated animate__pulse animate__infinite"
                quality={100}
                loading="eager"
                priority
              />
              <p className="text-base sm:text-lg text-gray-600 mb-2 text-center break-words">
                No results found for{" "}
                <strong className="text-purple-700">
                  &lsquo;{searchTerm}&lsquo;
                </strong>
                .
              </p>
              <span className="text-sm text-gray-400">
                Please try a different keyword.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating buttons */}
      {filteredModules.length > 0 && (
        <>
          <div
            style={{
              position: "fixed",
              bottom: "40px",
              right: "20px",
              zIndex: 1000,
            }}
          >
            <ExcelDownloadBtn
              data={filteredModules}
              page={`Search result for ${searchTerm}`}
            />
          </div>

          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              style={{
              position: "fixed",
              bottom: "100px",
              right: "20px",
              zIndex: 1000,
            }}
              className="bg-red-600 text-white text-sm px-4 py-2 rounded shadow-md hover:bg-red-700 transition"
            >
              Delete {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""}.
            </button>
          )}
        </>
      )}
    </div>
  );
}
