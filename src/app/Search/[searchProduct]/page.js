"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Dencrypt } from "../../../../Functions/Functions";
import SearchCard from "../../Components/SearchResult";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import Fuse from "fuse.js";
import Image from "next/image";

export default function SearchResultPage({ result, linkData }) {
  const searchParams = useSearchParams();
  const Module = searchParams.get("search");
  const page = useParams();
  const searchTerm = Module?.toLowerCase().trim() || "";

  const [loading, setLoading] = useState(true);
  const [UserData] = useState(linkData);
  const [resultArray] = useState(Dencrypt(result));
  const [filteredModules, setFilteredModules] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleSearch = async () => {
      try {
        const fuse = new Fuse(resultArray, {
          includeScore: true,
          threshold: 0.3,
          keys: [
            "Name",
            "description",
            "paymentReferenceNo",
            "firstName",
            "lastName",
            "Email",
            "telephone",
            "phone",
            "status",
            "ADCcode",
            "ACDcode",
            "billStatus",
            "crAmount",
            "Accountant",
            "ProductName",
            "WHName",
            "Username",
            "productName",
            "billReferenceNo",
            "customerName",
            "CustomerCode",
            "startDate",
            "RaiseBy",
            "invoicelocation",
            "WayBillNo",
            "DriverName",
            "DriverNumber",
            "vehicleNumber",
            "priceList",
            "category",
            "Debt",
            "ContactPerson",
            "CreditId",
            "DebitId",
            "customer",
            "refNo",
            "transferedDate",
            "recievedDate",
            "ResidualValue",
            "AssetCode",
            "SerialNumber",
            "status",
            "SerialNumber",
            "Category",
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
      <div className="w-full max-w-5xl flex flex-col items-center justify-between mb-3">
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
        <p className="text-sm text-gray-800">
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
      <div className="flex flex-col items-center py-6 min-h-auto">
        {filteredModules.length > 0 ? (
          <p className="text-sm text-gray-800 mb-4">
            Showing Search result for{" "}
            <span className="text-purple-600 font-bold">
              &lsquo;{searchTerm}&lsquo;
            </span>{" "}
            in {page.searchProduct} List...
          </p>
        ) : (
          ""
        )}
        <div
          className="grid gap-6 w-full max-w-5xl"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          }}
        >
          {filteredModules.length > 0 ? (
            filteredModules.map((product) => (
              <SearchCard
                key={product._id}
                data={product}
                module={page.searchProduct}
                UserData={UserData}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center py-12">
              <Image
                src="/Searching_Eyes_Animated_Illustration-removebg-preview.png"
                alt="Searching Eyes Illustration"
                width={128}
                height={128}
                className="mb-2"
                quality={100}
                loading="eager"
                priority
              />
              <p className="text-lg text-gray-600 mb-2">
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
      {filteredModules.length > 0 && (
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
      )}
    </div>
  );
}
