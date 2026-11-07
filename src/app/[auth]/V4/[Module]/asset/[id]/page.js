"use client";

import { useState } from "react";
import Image from "next/image";
import { plsWait, ErrorMessage, SuccessToast } from "../../../../../../../Functions/Mics";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const ITEMS_PER_PAGE = 10;

export default function Page({ DecryptedAsset, StoreList, userInfo, users }) {
  const [Stores] = useState(StoreList);
  const [formData, setFormData] = useState(DecryptedAsset || {});
  const [user] = useState(userInfo);
  const [usersList] = useState(users || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [transferLocation, setTransferLocation] = useState(DecryptedAsset.Location?._id || "");
  const [transferEmployee, setTransferEmployee] = useState(DecryptedAsset.AssignedTo?._id || "unassigned");
  const [transferNotes, setTransferNotes] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("");
  const [maintenanceCost, setMaintenanceCost] = useState("");
  const [maintenanceVendor, setMaintenanceVendor] = useState("");
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [disposalNotes, setDisposalNotes] = useState("");
  const [lifecycleBusy, setLifecycleBusy] = useState(false);
  const router = useRouter();

  const activityLogs = DecryptedAsset?.AcivityLog || [];
  const lifecycleLogs = DecryptedAsset?.ActivityLog || [];
  const totalPages = Math.ceil(activityLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = activityLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitLifecycleAction = async (path, body, successMessage) => {
    setLifecycleBusy(true);
    try {
      const response = await api.post(`/api/asset/${DecryptedAsset._id}/${path}`, body);
      if (!response.ok) throw new Error(response.error || "Could not update asset");
      SuccessToast(successMessage);
      router.refresh();
      return true;
    } catch (error) {
      ErrorMessage(error.message || "Something went wrong");
      return false;
    } finally {
      setLifecycleBusy(false);
    }
  };

  const handleTransfer = () => {
    if (!transferLocation) return ErrorMessage("Select a destination location");
    submitLifecycleAction(
      "transfer",
      {
        Location: transferLocation,
        AssignedTo: transferEmployee === "unassigned" ? null : transferEmployee,
        notes: transferNotes.trim(),
      },
      "Asset transferred"
    );
  };

  const handleMaintenance = async () => {
    if (!maintenanceType.trim()) return ErrorMessage("Enter the maintenance type");
    if (
      maintenanceCost === "" ||
      !Number.isFinite(Number(maintenanceCost)) ||
      Number(maintenanceCost) < 0
    ) {
      return ErrorMessage("Enter a valid non-negative maintenance cost");
    }

    const ok = await submitLifecycleAction(
      "maintenance",
      {
        maintenanceType: maintenanceType.trim(),
        cost: Number(maintenanceCost),
        vendor: maintenanceVendor.trim(),
        notes: maintenanceNotes.trim(),
      },
      "Maintenance recorded"
    );

    if (ok) {
      setMaintenanceType("");
      setMaintenanceCost("");
      setMaintenanceVendor("");
      setMaintenanceNotes("");
    }
  };

  const handleDispose = () => {
    if (!disposalNotes.trim()) return ErrorMessage("Enter a disposal reason");
    submitLifecycleAction("dispose", { notes: disposalNotes.trim() }, "Asset disposed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      plsWait("Updating asset...");
      const r = await api.patch(`/api/update/asset/${DecryptedAsset._id}`, formData);
      if (!r.ok) throw new Error(r.error);
      const data = r.data;

      if (data?.message) {
        SuccessToast("Asset updated successfully");
        router.refresh();
      } else {
        throw new Error(data?.error || "Update failed");
      }
    } catch (error) {
      ErrorMessage(error.message || "Something went wrong");
      router.refresh();
    }
  };

  // Shared Tailwind classes
  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const selectClass =
    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const textareaClass =
    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const labelClass =
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
  const btnBase =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const btnDefault = `${btnBase} bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2`;
  const btnOutline = `${btnBase} border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2`;
  const btnDestructive = `${btnBase} bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2`;
  const btnLg = "h-11 rounded-md px-8";

  const statusBadgeClass =
    formData.status === "Running"
      ? "bg-primary text-primary-foreground"
      : formData.status === "Sold"
      ? "bg-secondary text-secondary-foreground"
      : "bg-destructive text-destructive-foreground";

  return (
    <div className="flex flex-col">
      <div className="flex-1 p-0 sm:p-4 min-w-0">
        <div className="rounded-xl border-0 bg-card text-card-foreground shadow-xl flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            {/* Header */}
            <div className="flex flex-col space-y-1.5 border-b p-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-semibold leading-none tracking-tight break-words">
                    {formData.Name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Asset Code:{" "}
                    <span className="font-mono font-medium">{formData.AssetCode}</span>
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-5 py-1.5 text-sm font-semibold transition-colors ${statusBadgeClass}`}
                >
                  {formData.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 pt-0">
              {/* Image & Basic Info */}
              <div className="flex flex-col p-3 sm:flex-row items-start gap-6">
                <div className="w-40 h-40 rounded-2xl overflow-hidden border bg-muted flex-shrink-0">
                  <Image
                    height={70}
                    width={70}
                    src={
                      formData.image ||
                      "https://img.icons8.com/stickers/100/decentralized-network.png"
                    }
                    alt="Asset"
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>

                <div className="space-y-4 flex-1 pt-2">
                  <div>
                    <label className={`${labelClass} text-muted-foreground`}>
                      Current Location
                    </label>
                    <p className="text-lg sm:text-xl font-medium mt-1 break-words">
                      {formData.Location?.WHName || "Not Assigned"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="my-4 h-px w-full bg-border" />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                <div className="space-y-2">
                  <label htmlFor="Name" className={labelClass}>
                    Asset Name
                  </label>
                  <input
                    id="Name"
                    name="Name"
                    value={formData.Name || ""}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Current Location</label>
                  <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                    {formData.Location?.WHName || "Not assigned"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Currently Assigned To</label>
                  <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                    {[formData.AssignedTo?.firstName, formData.AssignedTo?.lastName]
                      .filter(Boolean)
                      .join(" ") || "Unassigned"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="SerialNumber" className={labelClass}>
                    Serial Number
                  </label>
                  <input
                    id="SerialNumber"
                    name="SerialNumber"
                    value={formData.SerialNumber || ""}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="PurchasedValue" className={labelClass}>
                    Purchase Value
                  </label>
                  <input
                    id="PurchasedValue"
                    name="PurchasedValue"
                    type="number"
                    step="any"
                    min="0"
                    value={formData.PurchasedValue || 0}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="ResidualValue" className={labelClass}>
                    Residual Value
                  </label>
                  {!DecryptedAsset.runDepreciation ? (
                    <input
                      id="ResidualValue"
                      name="ResidualValue"
                      type="number"
                      step="any"
                      min="0"
                      value={Number(formData.ResidualValue) || 0}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-muted rounded-md text-sm">
                      {formData.ResidualValue?.$numberDecimal || "0.00"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="PurchsedDate" className={labelClass}>
                    Purchase Date
                  </label>
                  <input
                    id="PurchsedDate"
                    name="PurchsedDate"
                    type="date"
                    value={formData.PurchsedDate || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Current Value</label>
                  {!DecryptedAsset.runDepreciation ? (
                    <input
                      name="CurrentValue"
                      type="number"
                      step="any"
                      value={formData.CurrentValue || 0}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-muted rounded-md text-sm">
                      {DecryptedAsset?.CurrentValue || 0}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="Category" className={labelClass}>
                    Category
                  </label>
                  <input
                    id="Category"
                    name="Category"
                    value={formData.Category || ""}
                    onChange={handleChange}
                    placeholder="Equipment, Furniture, etc."
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="usefulYear" className={labelClass}>
                    Useful Life (Months)
                  </label>
                  {!DecryptedAsset.runDepreciation ? (
                    <input
                      id="usefulYear"
                      name="usefulYear"
                      type="number"
                      min="0"
                      value={formData.usefulYear || 0}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  ) : (
                    <div className="px-4 py-2.5 bg-muted rounded-md text-sm">
                      {DecryptedAsset?.usefulYear} months
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="vendor" className={labelClass}>
                    Supplier / Vendor
                  </label>
                  <input
                    id="vendor"
                    name="vendor"
                    value={formData.vendor || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Lifecycle actions */}
              {user.user.AssetManager && DecryptedAsset.status === "Running" && (
                <div className="grid grid-cols-1 gap-5 border-y py-6 lg:grid-cols-2">
                  <section className="space-y-3 rounded-md border p-4">
                    <h3 className="font-semibold">Transfer asset</h3>
                    <div className="space-y-2">
                      <label htmlFor="transferLocation" className={labelClass}>
                        Destination location
                      </label>
                      <select
                        id="transferLocation"
                        value={transferLocation}
                        onChange={(e) => setTransferLocation(e.target.value)}
                        className={selectClass}
                      >
                        <option value="" disabled>
                          Select location
                        </option>
                        {Stores.map((store) => (
                          <option key={store._id} value={store._id}>
                            {store.WHName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="transferEmployee" className={labelClass}>
                        Assign to employee
                      </label>
                      <select
                        id="transferEmployee"
                        value={transferEmployee}
                        onChange={(e) => setTransferEmployee(e.target.value)}
                        className={selectClass}
                      >
                        <option value="unassigned">Unassigned</option>
                        {usersList.map((employee) => (
                          <option key={employee._id} value={employee._id}>
                            {employee.firstName} {employee.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      value={transferNotes}
                      onChange={(e) => setTransferNotes(e.target.value)}
                      maxLength={1000}
                      placeholder="Transfer note (optional)"
                      className={textareaClass}
                    />
                    <button
                      type="button"
                      disabled={lifecycleBusy}
                      onClick={handleTransfer}
                      className={btnOutline}
                    >
                      Transfer
                    </button>
                  </section>

                  <section className="space-y-3 rounded-md border p-4">
                    <h3 className="font-semibold">Record maintenance</h3>
                    <input
                      value={maintenanceType}
                      onChange={(e) => setMaintenanceType(e.target.value)}
                      maxLength={100}
                      placeholder="Maintenance type"
                      aria-label="Maintenance type"
                      className={inputClass}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={maintenanceCost}
                      onChange={(e) => setMaintenanceCost(e.target.value)}
                      placeholder="Cost (₦)"
                      aria-label="Maintenance cost"
                      className={inputClass}
                    />
                    <input
                      value={maintenanceVendor}
                      onChange={(e) => setMaintenanceVendor(e.target.value)}
                      maxLength={200}
                      placeholder="Service provider (optional)"
                      aria-label="Service provider"
                      className={inputClass}
                    />
                    <textarea
                      value={maintenanceNotes}
                      onChange={(e) => setMaintenanceNotes(e.target.value)}
                      maxLength={1000}
                      placeholder="Maintenance notes (optional)"
                      className={textareaClass}
                    />
                    <button
                      type="button"
                      disabled={lifecycleBusy}
                      onClick={handleMaintenance}
                      className={btnOutline}
                    >
                      Record maintenance
                    </button>
                  </section>

                  <section className="space-y-3 rounded-md border border-destructive/40 p-4 lg:col-span-2">
                    <h3 className="font-semibold">Dispose of asset</h3>
                    <textarea
                      value={disposalNotes}
                      onChange={(e) => setDisposalNotes(e.target.value)}
                      maxLength={1000}
                      placeholder="Reason for disposal"
                      aria-label="Disposal reason"
                      className={textareaClass}
                    />
                    <button
                      type="button"
                      disabled={lifecycleBusy}
                      onClick={handleDispose}
                      className={btnDestructive}
                    >
                      Dispose asset
                    </button>
                  </section>
                </div>
              )}

              {/* Asset history */}
              {lifecycleLogs.length > 0 && (
                <section className="space-y-3 border-b py-6">
                  <h3 className="font-semibold text-lg">Asset history</h3>
                  <div className="divide-y rounded-md border">
                    {lifecycleLogs
                      .slice()
                      .reverse()
                      .map((log) => (
                        <article
                          key={log._id || `${log.action}-${log.at}`}
                          className="space-y-1 p-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-medium capitalize">{log.action}</span>
                            <time className="text-xs text-muted-foreground">
                              {log.at ? new Date(log.at).toLocaleString() : ""}
                            </time>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {log.performedBy?.firstName
                              ? `${log.performedBy.firstName} ${log.performedBy.lastName || ""}`
                              : "User"}
                            {log.notes ? ` · ${log.notes}` : ""}
                            {log.maintenanceType ? ` · ${log.maintenanceType}` : ""}
                            {log.maintenanceCost !== undefined
                              ? ` · ₦${Number(log.maintenanceCost).toLocaleString()}`
                              : ""}
                          </p>
                        </article>
                      ))}
                  </div>
                </section>
              )}

              {/* Depreciation Switch */}
              <div className="flex items-center justify-between gap-4 bg-muted/50 p-4 rounded-xl mt-6">
                <label
                  htmlFor="runDepreciation"
                  className="cursor-pointer font-medium text-sm leading-none"
                >
                  Activate Depreciation Schedule
                </label>

                <button
                  type="button"
                  role="switch"
                  id="runDepreciation"
                  aria-checked={!!formData.runDepreciation}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      runDepreciation: !prev.runDepreciation,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    formData.runDepreciation ? "bg-primary" : "bg-input"
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      formData.runDepreciation ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Description */}
              <div className="space-y-2 mt-6">
                <label htmlFor="description" className={labelClass}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Additional information about this asset..."
                  rows={4}
                  className={textareaClass}
                />
              </div>

              {/* Depreciation Schedule */}
              {activityLogs.length > 0 && (
                <>
                  <div className="my-6 h-px w-full bg-border" />
                  <div>
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                      <h3 className="font-semibold text-lg">Depreciation Schedule</h3>
                      <p className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </p>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground shadow">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                Date
                              </th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                Depreciation Amount
                              </th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                Asset Value After
                              </th>
                            </tr>
                          </thead>
                          <tbody className="[&_tr:last-child]:border-0">
                            {paginatedLogs.map((log, index) => (
                              <tr
                                key={index}
                                className="border-b transition-colors hover:bg-muted/50"
                              >
                                <td className="p-4 align-middle">{log.Date}</td>
                                <td className="p-4 align-middle font-medium">
                                  ₦
                                  {parseFloat(
                                    log.DepreciatedValue?.$numberDecimal || 0
                                  ).toFixed(2)}
                                </td>
                                <td className="p-4 align-middle font-medium">
                                  ₦{parseFloat(log.Assetvalue || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              {user.user.AssetManager && (
                <div className="pt-8 border-t mt-auto">
                  {DecryptedAsset.status === "Running" && (
                    <button
                      type="submit"
                      className={`${btnDefault} ${btnLg} w-full sm:w-auto`}
                    >
                      Save Changes
                    </button>
                  )}

                  {DecryptedAsset.status !== "Running" &&
                    DecryptedAsset.AcivityLog?.length === 0 && (
                      <button
                        type="submit"
                        className={`${btnDestructive} ${btnLg} w-full sm:w-auto`}
                      >
                        Delete Asset
                      </button>
                    )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}