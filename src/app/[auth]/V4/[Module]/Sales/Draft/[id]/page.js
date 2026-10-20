"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import moment from "moment";
import Notch from "@/app/Components/Notch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import BackButton from "@/app/Components/BackBotton";
import {
  Dencrypt,
  totalInWords,
  pricelistSetter,
} from "../../../../../../../../Functions/Functions";
import api from "@/lib/api";
import { printQuotationPdf } from "@/lib/pdf/quotationPdf";
import {
  ErrorMessage,
  SuccessToast,
  plsWait,
} from "../../../../../../../../Functions/Mics";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import { Badge } from "@/components/ui/badge";
import {
  TrashIcon,
  PrinterIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/solid";

export default function DraftInvoicePage({ Business, bill, products, user }) {
  const router = useRouter();
  const params = useParams();

  const [inputValue, setInputValue] = useState("");
  const [productList] = useState(products || []);
  const [Singlebill, setSinglebill] = useState(bill);

  const userInfo = {
    user,
    business: Business,
  };

  const isCancelled = Singlebill?.billStatus?.toLowerCase() === "cancelled";
  const isDraft = Singlebill?.billStatus?.toLowerCase() === "draft";

  // Check if draft is still within 24 hours
  const createdAt = moment(Singlebill?.createdAt);
  const isOlderThan24Hours = moment().diff(createdAt, "hours") < 24;

  useEffect(() => {
    Swal.close();
  }, []);

  const checkExpiryDate = (createdAt) => {
    try {
      const expiryTime = moment(createdAt).add(24, "hours");
      const now = moment();
      const duration = moment.duration(expiryTime.diff(now));

      if (duration.asMilliseconds() <= 0) return "Expired";

      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      const seconds = duration.seconds();
      return `Expire in: ${hours}h ${minutes}m ${seconds}s`;
    } catch {
      return "";
    }
  };

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount || 0);

  // ==================== PDF GENERATOR ====================
  // The layout lives in src/lib/pdf/quotationPdf.js (shared with the Sales Portal).
  const generatePdf = async (business, customer, billData) => {
    try {
      plsWait("Preparing quotation ⌛...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      await printQuotationPdf(business, customer, billData, {
        onOpen: () => Swal.close(),
      });
    } catch (error) {
      Swal.close();

      console.error("Error generating quotation PDF:", error);

      Swal.fire({
        icon: "error",
        title: "Quotation Error",
        text: "Unable to generate the quotation PDF.",
      });
    }
  };

  // ==================== HANDLERS ====================
  const handleProductSelection = async (productId) => {
    try {
      plsWait("Adding product...");
      const cleanedProducts = products.find(
        (product) =>
          product.item?.ACDcode === productId ||
          product.item?.ADCcode === productId,
      );

      if (!cleanedProducts) throw new Error("Product not found");

      const url = `/api/Draft/add/order/${bill._id}?productId=${productId}&priceList=${Singlebill.priceList}`;

      const res = await api.put(url, { product: cleanedProducts.storeId });

      const data = res.data || {};
      if (data.message) {
        SuccessToast(data.message);
        setInputValue("");
        setSinglebill(data.updatedBill);
      } else {
        throw new Error(data.error || res.error || "Unknown error occurred.");
      }
    } catch (error) {
      ErrorMessage(error.message);
      setInputValue("");
      router.refresh();
    }
  };

  const deleteDraftInvoice = async () => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      plsWait("Deleting draft. Please wait.");
      const url = `/api/Draft/order/Delete/${bill._id}`;
      const response = await api.del(url, {
        headers: {
          "idempotency-key": `delete-${bill._id}`,
        },
      });
      const data = response.data || {};

      if (data.message) {
        SuccessToast(data.message);
        router.back();
      } else {
        ErrorMessage(data.error || response.error || "Failed to delete draft invoice.");
        Swal.close();
        router.refresh();
      }
    } catch (error) {
      ErrorMessage(error.message || "Unexpected error occurred.");
      Swal.close();
      router.refresh();
    }
  };

  const handleQtyChange = async (
    lineId,
    value,
    toUpdate,
    billId,
    storeId,
    userId,
    companyName,
  ) => {
    try {
      plsWait("Updating cart...");

      const url = `/api/Invoice/Cart/Update?user=${userId}`;

      const response = await api.put(url, { lineId, value, toUpdate, billId, storeId });

      const data = response.data || {};

      if (data.message) {
        SuccessToast(data.message);
        setSinglebill(Dencrypt(data.Updatedinvoice));
      } else {
        throw new Error(data.error || response.error || "An unknown error occurred.");
      }
    } catch (err) {
      ErrorMessage(err.message);
      router.refresh();
    }
  };

  let isProcessing = false;

  const processInvoice = async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
      const { value: userInput } = await Swal.fire({
        title: "Enter your Operational Code",
        input: "password",
        inputLabel: "This action will Adjust Inventory of Billing location.",
        inputPlaceholder: "Provide OPS CODE",
        inputAutoFocus: true,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) return "You need to Enter your code!";
        },
      });

      if (!userInput) {
        isProcessing = false;
        return;
      }

      plsWait(
        "Please wait while I process your request. Do not reload this page...",
      );

      const response = await api.patch(
        `/api/wareHouse/Bill`,
        {
          billId: bill._id,
          customer: Singlebill.customer._id,
          restriction: userInfo.business?.InvoiceRestriction,
          ops: userInput, // ops code in the body, never the URL
        },
        {
          headers: {
            "idempotency-key": `invoice-${bill._id}`,
          },
        },
      );

      const data = response.data || {};

      if (response.ok) {
        SuccessToast(data.message || "Operation completed successfully!");
        router.push(`/${params.auth}/V4/Sales/Sales/${bill._id}`);
      } else {
        throw new Error(data.error || response.error || "An error occurred.");
      }
    } catch (error) {
      ErrorMessage(error.message);
      router.refresh();
    } finally {
      isProcessing = false;
      router.refresh();
    }
  };

  const removeLineItem = async (lineId) => {
    try {
      plsWait("Removing item from order...");

      const url = `/api/Draft/delete/order?user=${user._id}`;

      const response = await api.del(url, { body: { lineId, billId: bill._id } });

      const data = response.data || {};

      if (data.message) {
        SuccessToast(data.message);
        setSinglebill(data.updatedBill);
      } else {
        ErrorMessage(data.error || response.error || "Something went wrong.");
        router.refresh();
      }
    } catch {
      ErrorMessage("Unexpected error occurred.");
      router.refresh();
    }
  };

  const updateDiscount = async (billId, value) => {
    try {
      plsWait("Updating Discount");

      const url = `/api/Draft/discount/update?user=${user._id}`;

      const response = await api.patch(url, { billId, value });

      const result = response.data || {};

      if (result.message) {
        SuccessToast(result.message);
        setSinglebill(Dencrypt(result.Updatedinvoice));
      } else {
        throw new Error(result.error || response.error || "Something went wrong.");
      }
    } catch (error) {
      ErrorMessage(
        error.message || "Network or server error. Please try again.",
      );
    }
  };

  // display inventory 
   const getInventoryValue = (id) => {
    try {
      const product = productList.find((p) => p.storeId === id || p.storeId?.toString() === id?.toString())

      if (!product) return "N/A"

      return `C:${product.Case ?? 0} P:${product.pcs ?? 0}`
    } catch (err) {
      return "N/A"
    }
  }

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={"Draft"} />}>
      <div className="px-3 sm:px-6 py-6 sm:py-10 bg-card text-card-foreground shadow-sm text-xs border border-border rounded-lg">
        <Notch>
          <BackButton />
          <hr className="my-4 border-gray-700" />
          <div className="bg-gray-700 rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-700">
              {Singlebill?.ActivityLog?.map((log, index) => {
                return (
                  <li key={index} className="py-3 px-4 text-xs">
                    <div className="flex justify-between items-center">
                      <span>{log.logMsg}</span>
                    </div>
                    <hr className="border-gray-500" />
                  </li>
                );
              }) || <li className="py-3 px-4 text-sm">No activity logs.</li>}
            </ul>
          </div>
          <Separator className="my-4 border-gray-700" />
          <ProgressDemo count={Singlebill?.orders?.length || 0} />
        </Notch>
        {/* ========== TOP HEADER ========== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
          <span
            className={`px-4 py-1.5 rounded-full font-semibold text-sm tracking-wide border w-fit ${
              isCancelled
                ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800"
            }`}
          >
            {Singlebill.billStatus}
          </span>
          <div className="text-left sm:text-right">
            <span className="text-xs text-muted-foreground">
              Created on:{" "}
              {moment(Singlebill.createdAt).format(
                "dddd DD MMMM YYYY [at] hh:mm A",
              )}
            </span>
          </div>
        </div>

        {/* ========== COMPANY + CUSTOMER ========== */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 border-t border-b border-border py-6 sm:py-8 mb-6">
          {/* Business */}
          <div className="flex items-start gap-4 sm:gap-6">
            <Image
              src={userInfo.business.companyLogo}
              width={80}
              height={80}
              alt="logo"
              className="rounded-md shrink-0"
            />
            <div className="text-sm space-y-1 min-w-0 break-words">
              <h3 className="text-base sm:text-lg font-extrabold text-foreground">
                {userInfo.business.companyName}
              </h3>
              <p className="text-muted-foreground">{userInfo.business.email}</p>
              <p className="text-muted-foreground">{userInfo.business.Tel}</p>
              <p className="text-muted-foreground">
                {userInfo.business.Address}
              </p>
              <p className="text-muted-foreground">
                {userInfo.business.CompanyCity}
              </p>

              <h2
                className={`mt-3 font-bold text-sm sm:text-base ${
                  isCancelled
                    ? "text-red-600 dark:text-red-400"
                    : "text-foreground"
                }`}
              >
                {Singlebill.billStatus.toUpperCase()} /{" "}
                {Singlebill.billReferenceNo} / {Singlebill.invoicelocation}
              </h2>
              <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-1">
                {Singlebill.WayBillNo}
              </p>
            </div>
          </div>

          {/* Customer */}
          <div className="text-left lg:text-right text-sm space-y-1">
            <h3 className="text-lg font-bold text-foreground">
              {Singlebill.customerName?.toUpperCase()}
            </h3>
            {Singlebill.merchantName && (
              <p>
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                  Merchant: {Singlebill.merchantName}
                </span>
              </p>
            )}
            <p className="text-muted-foreground">
              {Singlebill.customer?.billingAddress?.slice(0, 40) || "N/A"}
            </p>
            <p>
              <a
                href={`mailto:${Singlebill.customer?.Email}`}
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {Singlebill.customer?.Email || "N/A"}
              </a>
            </p>
            <p className="text-muted-foreground">
              {moment(Singlebill.startDate).format("YYYY-MM-DD")}
            </p>
            <p className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
              Current Pricelist:{" "}
              {pricelistSetter(Singlebill.priceList, Business)}
            </p>
          </div>
        </div>

        {/* ========== ACTION BUTTONS ========== */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {((!userInfo.business.InvoiceRestriction &&
            user._id === Singlebill.invoicerId &&
            user.raiseInvoice &&
            isDraft) ||
            (userInfo.business.InvoiceRestriction &&
              user._id === Singlebill.invoicerId &&
              user.raiseInvoice &&
              isDraft &&
              isOlderThan24Hours)) &&
            Singlebill.orders?.length > 0 && (
              <button
                title="Process this draft to order"
                onClick={processInvoice}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background font-semibold text-sm hover:opacity-90 transition"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span>Checkout Cart</span>
              </button>
            )}

          {user._id === Singlebill.invoicerId &&
            user.raiseInvoice &&
            isDraft && (
              <button
                title="Delete this draft"
                onClick={deleteDraftInvoice}
                className="inline-flex items-center justify-center p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <TrashIcon className="h-6 w-6 text-red-500" />
              </button>
            )}

          {isDraft && (
            <button
              title={`Download and Print ${Singlebill.billStatus}`}
              onClick={() => generatePdf(Business, Singlebill.customer, Singlebill)}
              className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-foreground text-background font-semibold text-sm hover:opacity-90 transition ml-auto"
            >
              <PrinterIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Print Quotation</span>
            </button>
          )}
        </div>

        {/* ========== DESKTOP TABLE ========== */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card mb-8">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                {[
                  "S/N",
                  "Product",
                  "Photo",
                  "Code",
                  "Inventory",
                  "Case",
                  "PCS",
                  "Price",
                  "Promo",
                  "VAT",
                  `Total (${userInfo.business.currency?.currency.Symbol})`,
                  " ",
                ].map((th, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 font-semibold whitespace-nowrap text-center"
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-foreground">
              {Singlebill.orders?.map((billItem, index) => (
                <tr
                  key={billItem._id}
                  className="border-t border-border hover:bg-muted/30 transition"
                >
                  <td className="px-4 py-2 text-center text-xs">{index + 1}</td>
                  <td className="px-4 py-2 text-center">
                    <Link
                      href={`/${params.auth}/V4/product/product/${billItem.item._id}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-medium"
                    >
                      {billItem.item.Name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Image
                      src={
                        billItem.item.image ||
                        billItem.item.QrCode ||
                        "/preview.png"
                      }
                      width={38}
                      height={38}
                      alt="preview"
                      className="rounded-md mx-auto"
                    />
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {billItem.item.ACDcode || billItem.item.ADCcode}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    <Badge variant="outline">
                        {getInventoryValue(billItem.storeProductId)}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {(Singlebill.means ?? "") !== "Ecomm" &&
                    user._id === Singlebill.invoicerId &&
                    isDraft ? (
                      <input
                        type="number"
                        defaultValue={billItem.Qty || 0}
                        min={0}
                        onBlur={(e) => {
                          let val = e.target.value;
                          if (val < 0) return;
                          handleQtyChange(
                            billItem._id,
                            val,
                            "Qty",
                            Singlebill._id,
                            billItem.storeProductId,
                            userInfo.user._id,
                            userInfo.business.companyName,
                          );
                        }}
                        className="w-16 px-2 py-1 border border-border rounded text-center bg-background"
                      />
                    ) : (
                      billItem.Qty
                    )}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {Business.allowSkuSplitting &&
                    user._id === Singlebill.invoicerId &&
                    isDraft ? (
                      <input
                        type="number"
                        defaultValue={billItem.pcsReq || 0}
                        className="w-16 px-2 py-1 border border-border rounded text-center bg-background"
                        onBlur={(e) => {
                          let val = e.target.value;
                          if (val < 0) return;
                          handleQtyChange(
                            billItem._id,
                            val,
                            "pcs",
                            Singlebill._id,
                            billItem.storeProductId,
                            userInfo.user._id,
                            userInfo.business.companyName,
                          );
                        }}
                      />
                    ) : (
                      billItem.pcsReq || 0
                    )}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {user._id === Singlebill.invoicerId &&
                    Business.allowPriceChangeOnInvoice &&
                    isDraft ? (
                      <input
                        type="number"
                        defaultValue={billItem.priceListPrice || 0}
                        className="w-20 px-2 py-1 border border-border rounded text-center bg-background"
                        onBlur={(e) => {
                          let val = e.target.value;
                          if (val < 0) return;
                          handleQtyChange(
                            billItem._id,
                            val,
                            "priceListPrice",
                            Singlebill._id,
                            billItem.storeProductId,
                            userInfo.user._id,
                            userInfo.business.companyName,
                          );
                        }}
                      />
                    ) : (
                      billItem.priceListPrice
                    )}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {userInfo.business.currency?.currency.Symbol}
                    {billItem.promotionData || 0}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {billItem.vat > 0 && billItem.item.VAT
                      ? billItem.item.VAT.$numberDecimal
                      : 0}
                  </td>
                  <td className="px-4 py-2 font-bold text-right text-xs">
                    {userInfo.business.currency?.currency.Symbol}
                    {billItem.total?.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {user._id === Singlebill.invoicerId &&
                      user.raiseInvoice &&
                      isDraft && (
                        <button
                          title={`Remove ${billItem.item?.ADCcode?.toLowerCase()} from cart`}
                          onClick={() => removeLineItem(billItem._id)}
                        >
                          <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-600" />
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-sm font-medium text-muted-foreground bg-muted/50 p-2 text-center">
            Ensure to verify pricelist on account before closing Draft
          </div>
        </div>

        {/* ========== MOBILE PRODUCT CARDS ========== */}
        <div className="md:hidden space-y-4 mb-8">
          {Singlebill.orders?.map((billItem, index) => (
            <div
              key={billItem._id}
              className="border border-border rounded-lg bg-card p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <Image
                  src={
                    billItem.item.image ||
                    billItem.item.QrCode ||
                    "/preview.png"
                  }
                  width={48}
                  height={48}
                  alt="preview"
                  className="rounded-md shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/${params.auth}/V4/product/product/${billItem.item._id}`}
                    className="font-medium text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {billItem.item.Name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {billItem.item.ACDcode || billItem.item.ADCcode}
                  </p>
                </div>
                {user._id === Singlebill.invoicerId &&
                  user.raiseInvoice &&
                  isDraft && (
                    <button onClick={() => removeLineItem(billItem._id)}>
                      <TrashIcon className="w-5 h-5 text-red-500" />
                    </button>
                  )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm [&>*]:min-w-0">
                <div>
                  <p className="text-xs text-muted-foreground">Case</p>
                  {(Singlebill.means ?? "") !== "Ecomm" &&
                  user._id === Singlebill.invoicerId &&
                  isDraft ? (
                    <input
                      type="number"
                      defaultValue={billItem.Qty || 0}
                      min={0}
                      onBlur={(e) => {
                        let val = e.target.value;
                        if (val < 0) return;
                        handleQtyChange(
                          billItem._id,
                          val,
                          "Qty",
                          Singlebill._id,
                          billItem.storeProductId,
                          userInfo.user._id,
                          userInfo.business.companyName,
                        );
                      }}
                      className="w-full mt-1 px-2 py-1.5 border border-border rounded text-center bg-background text-base sm:text-sm"
                    />
                  ) : (
                    <p className="font-medium">{billItem.Qty}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Pcs</p>
                  {Business.allowSkuSplitting &&
                  user._id === Singlebill.invoicerId &&
                  isDraft ? (
                    <input
                      type="number"
                      defaultValue={billItem.pcsReq || 0}
                      onBlur={(e) => {
                        let val = e.target.value;
                        if (val < 0) return;
                        handleQtyChange(
                          billItem._id,
                          val,
                          "pcs",
                          Singlebill._id,
                          billItem.storeProductId,
                          userInfo.user._id,
                          userInfo.business.companyName,
                        );
                      }}
                      className="w-full mt-1 px-2 py-1.5 border border-border rounded text-center bg-background text-base sm:text-sm"
                    />
                  ) : (
                    <p className="font-medium">{billItem.pcsReq || 0}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  {user._id === Singlebill.invoicerId &&
                  Business.allowPriceChangeOnInvoice &&
                  isDraft ? (
                    <input
                      type="number"
                      defaultValue={billItem.priceListPrice || 0}
                      onBlur={(e) => {
                        let val = e.target.value;
                        if (val < 0) return;
                        handleQtyChange(
                          billItem._id,
                          val,
                          "priceListPrice",
                          Singlebill._id,
                          billItem.storeProductId,
                          userInfo.user._id,
                          userInfo.business.companyName,
                        );
                      }}
                      className="w-full mt-1 px-2 py-1.5 border border-border rounded text-center bg-background text-base sm:text-sm"
                    />
                  ) : (
                    <p className="font-medium">
                      {userInfo.business.currency?.currency.Symbol}
                      {billItem.priceListPrice}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-bold">
                    {userInfo.business.currency?.currency.Symbol}
                    {billItem.total?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ========== ADD PRODUCT ========== */}
        {user._id === Singlebill.invoicerId && isDraft && (
          <div className="mb-8">
            {/* Mobile Select */}
            <div className="block md:hidden">
              <label className="block mb-2 text-sm font-medium text-foreground">
                Select from {productList.length} Products
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value !== "") {
                    handleProductSelection(e.target.value);
                  }
                }}
                className="w-full px-4 py-2.5 border border-border rounded-md bg-background text-foreground text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Choose product...</option>
                {products.map((product) => (
                  <option
                    key={product.item._id}
                    value={product.item.ACDcode || product.item.ADCcode}
                  >
                    {product.item.Name} [Case: {product.Case} | Pcs:{" "}
                    {product.pcs}]
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:block">
              <label className="block mb-2 text-sm font-medium text-foreground">
                Search {productList.length} Products
              </label>
              <input
                type="text"
                defaultValue={inputValue}
                list="productsList"
                onBlur={(e) => {
                  const trimmedValue = e.target.value.trim();
                  if (trimmedValue !== "") {
                    handleProductSelection(trimmedValue);
                  }
                  e.target.value = "";
                }}
                className="w-full max-w-md px-4 py-2.5 border border-border rounded-md bg-background text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Type product code to search..."
              />
              <datalist id="productsList">
                {products.map((product) => (
                  <option
                    key={product.item._id}
                    value={product.item.ACDcode || product.item.ADCcode}
                  >
                    {product.item.Name} [Case: {product.Case} | Pcs:{" "}
                    {product.pcs}]
                  </option>
                ))}
              </datalist>
            </div>
          </div>
        )}

        {/* ========== SUMMARY ========== */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6">
            <h3 className="text-lg font-bold mb-4 text-foreground border-b border-border pb-2">
              Summary
            </h3>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <strong>
                  {userInfo.business.currency?.currency.Symbol}
                  {(
                    (Singlebill?.subTotal ?? 0) - (Singlebill?.taxRate ?? 0)
                  ).toFixed(2)}
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Discount Allowed:</span>
                {user._id === Singlebill.invoicerId && isDraft ? (
                  <input
                    type="number"
                    defaultValue={Singlebill.discount || 0}
                    className="w-24 px-2 py-1 border border-border rounded text-center bg-background text-base sm:text-sm"
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      if (val < 0) return;
                      updateDiscount(
                        Singlebill._id,
                        isNaN(val) || val < 0 ? 0 : val,
                      );
                    }}
                  />
                ) : (
                  <strong>
                    {userInfo.business.currency?.currency.Symbol}
                    {Singlebill.discount ? Singlebill.discount.toFixed(2) : 0}
                  </strong>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax Rate:</span>
                <strong>
                  {userInfo.business.currency?.currency.Symbol}
                  {Singlebill.taxRate ? Singlebill.taxRate.toFixed(2) : "0.00"}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping Fee:</span>
                <strong>
                  {userInfo.business.currency?.currency.Symbol}
                  {Singlebill.shippingFee?.toFixed(2)}
                </strong>
              </div>

              <div className="flex justify-between text-base font-bold mt-4 border-t border-border pt-3">
                <span>GRAND TOTAL:</span>
                <span>
                  {userInfo.business.currency?.currency.Symbol}
                  {Singlebill.grandTotal
                    ? Singlebill.grandTotal?.toFixed(2)
                    : 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6">
            <h3 className="text-lg font-bold mb-4 text-foreground">
              Total In Words
            </h3>
            <p className="italic text-base text-orange-600 dark:text-orange-400">
              {totalInWords(
                Singlebill.grandTotal ? Singlebill.grandTotal : 0,
                userInfo.business.currency?.currency,
              )}
            </p>
          </div>
        </div>

        {/* ========== TERMS & ISSUED BY ========== */}
        <div className="mt-10 sm:mt-12 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-md">
            <h4 className="font-semibold text-foreground mb-2">
              Terms & Conditions
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {userInfo.business.invoicePolicy}
            </p>
          </div>
          <div className="text-left md:text-right">
            <h4 className="font-semibold text-foreground mb-2">Issued by</h4>
            <p className="text-sm font-medium">{Singlebill.RaiseBy}</p>
          </div>
        </div>

        {/* ========== FOOTER ========== */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          {userInfo.business.InvoiceRestriction ? (
            <>{checkExpiryDate(Singlebill.createdAt)}</>
          ) : (
            <h2
              className={`font-bold text-base ${
                isCancelled
                  ? "text-red-600 dark:text-red-400"
                  : "text-foreground"
              }`}
            >
              {Singlebill.billStatus.toUpperCase()} /{" "}
              {Singlebill.billReferenceNo} / {Singlebill.invoicelocation}
            </h2>
          )}
        </div>
      </div>
    </Suspense>
  );
}

// progress on invoice qty
export function ProgressDemo({ count }) {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <h2 className="text-base font-semibold">{200 - count} Order available </h2>
      <Progress
        value={(count / 200) * 100}
        className="h-4  [&>div]:bg-yellow-500"
      />
      <p className="text-sm text-gray-200">
        {count} / 200 orders added to this invoice.
      </p>
    </div>
  );
}
