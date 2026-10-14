"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Encrypt } from "../../../../../../../Functions/Functions";
import {useParams} from "next/navigation"
import moment from "moment"

const ITEMS_PER_PAGE = 10;

export default function InventoryTable({ data }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const Params = useParams()

  const filteredProducts = useMemo(() => {
    if (!data.products) return [];

    return data.products
      .filter((product) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          product.productName?.toLowerCase().includes(searchLower) ||
          product.Vendor?.Name?.toLowerCase().includes(searchLower) ||
          product.category?.toLowerCase().includes(searchLower) ||
          product.expiryDate?.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => a.productName.localeCompare(b.productName));
  }, [data.products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="p-0 sm:p-4 rounded-xl">
      {/* Warehouse Header + Search */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold break-words">
            {data.Store?.WHName || "Warehouse Inventory"}
          </h3>
          <p className="text-sm mt-1">
            {filteredProducts.length} of {data.products?.length || 0} products
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search products, vendor, category..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10  border-gray-300 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className=" rounded-lg border border-gray-300 overflow-hidden">
        <Table>
          <TableHeader className="">
            <TableRow>
              <TableHead className="font-semibold w-12">S/N</TableHead>
              <TableHead className="font-semibold">Product Name</TableHead>
              <TableHead className="font-semibold">Vendor</TableHead>
              <TableHead className="font-semibold">Case</TableHead>
              <TableHead className="font-semibold">Pcs</TableHead>
              <TableHead className="font-semibold">Expiry Date</TableHead>
              <TableHead className="font-semibold">Last Purch. Date</TableHead>
              <TableHead className="font-semibold">Most Recent Update</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product, index) => {
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                return (
                  <TableRow
                    key={product._id}
                    className="transition-colors border-b"
                  >
                    <TableCell className="font-medium">
                      {globalIndex + 1}
                    </TableCell>

                    <TableCell className="text-indigo-700 font-medium">
                      <Link
                        href={`/${Params.auth}/V4/inventory/inventory/${Encrypt(product._id)}`}
                        className="hover:underline"
                      >
                        {product.productName}
                      </Link>
                    </TableCell>

                    <TableCell className="">
                      {product.Vendor?.Name || "—"}
                    </TableCell>

                    <TableCell
                      className={`font-semibold ${
                        product.currentQty < 0
                          ? "text-red-600 bg-red-50"
                          : product.currentQty === 0
                          ? "text-yellow-600 bg-yellow-50"
                          : "text-green-600 bg-green-50"
                      }`}
                    >
                      {product.currentQty}
                    </TableCell>

                    <TableCell
                      className={`font-semibold ${
                        product.pcs < 0
                          ? "text-red-600 bg-red-50"
                          : product.pcs === 0
                          ? "text-yellow-600 bg-yellow-50"
                          : "text-green-600 bg-green-50"
                      }`}
                    >
                      {product.pcs}
                    </TableCell>

                    <TableCell className="">
                      {product.expiryDate || "—"}
                    </TableCell>

                    <TableCell className="">
                      {product.LastBatchDate || "—"}
                    </TableCell>

                    <TableCell className="">
                      {moment(product.updatedAt).format('l') || "—"}
                    </TableCell>

                    <TableCell className="">
                      {product.category || "—"}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          product.isActivated
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.isActivated ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12">
                  No products found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 mt-6 px-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm">
            Page <span className="font-semibold">{currentPage}</span> of {totalPages}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}