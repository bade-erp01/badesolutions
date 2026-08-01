"use client";
import { UpdateEmployeeData ,EXPRESS_PRIVATE_URL} from "../../../Functions/Functions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ErrorMessage, plsWait, SuccessToast } from "../../../Functions/Mics";
import { Encrypt } from "../../../Functions/Functions";
import { Combobox } from "@headlessui/react";
import Swal from "sweetalert2";
import { Switch } from "@/components/ui/switch";

export default function AccessControl({
  TenantData,
  userInfo,
  businessInfo,
  data,
}) {
  const [businessModules] = useState([...businessInfo.modules]);
  const [formData, setFormData] = useState({ ...data });
  const router = useRouter();


  const UpdateEmployeeModules = async (id, object) => {
    try {
      plsWait("Attempting remote access on user Work space");
      const body = JSON.stringify({
        id,
        object,
      });
      const response = await fetch("/api/EmployeeUpdate", {
        method: "PUT",
        body,
        headers: {
          Authorization: `Bearer ${businessInfo.tenantId}`,
          access: `${Encrypt(formData._id)}`,
          sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
        },
        timeout: 10000,
      });
      const req = await response.json();

      if (req.message) {
        SuccessToast(req.message);
        router.refresh();
      } else {
        throw new Error(req.error);
      }
    } catch (error) {
      ErrorMessage(error.message);
    }
  };

  const handleChange = async (e) => {
    const { name,  checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
   
    plsWait("Updating user access...")
    const request = await fetch(
      `${EXPRESS_PRIVATE_URL}/api/updateUser/${Encrypt(formData._id)}`,
      {
        method: "PATCH",
        body: JSON.stringify({[name]:checked}),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(businessInfo.tenantId)}`,
          sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
          access: `${Encrypt(userInfo._id)}`,
        },
      },
    );

    const response = await request.json();

    if (response.message) {
      SuccessToast(response.message);
      router.refresh();
    } else {
      ErrorMessage(response.error || "Failed to update user access");
    }
  };

  const handleChange2 = async (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    const selectedAppName = name;
    const selectedModule = businessModules.find(
      (mod) => mod.Name === selectedAppName,
    );

    if (selectedModule) {
      UpdateEmployeeModules(formData._id, selectedModule);
    }
  };

  return (
    <form>
      <fieldset className="grid grid-cols-1">
        <legend className="text-sm/6 font-semibold">
          Assign Operational Access
        </legend>
        <div className="flex flex-wrap gap-4 p-4">
          {/* Individual permission toggles using shadcn Switch */}
          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to onboard new customers`}>
              Create Customer
            </label>
            <Switch
              checked={formData.createCustomer || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "createCustomer", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to register new products`}>
              Create Product
            </label>
            <Switch
              checked={formData.createProduct || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "createProduct", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to update create new supplier`}>
              Create Vendor
            </label>
            <Switch
              checked={formData.createVendor || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "createVendor", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to update customer information `}>
              Update Customer
            </label>
            <Switch
              checked={formData.editCustomer || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "editCustomer", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to update general products information `}>
              Update Products
            </label>
            <Switch
              checked={formData.editProduct || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "editProduct", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData?.firstName} will be able to update purchase price of products`}>
              Update Buying Price
            </label>
            <Switch
              checked={formData.editPurchasePrice || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "editPurchasePrice", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer">
              Chief Financial Officer
            </label>
            <Switch
              checked={formData.isCFO || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "isCFO", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to update Suppliers infomation`}>
              Update Vendor
            </label>
            <Switch
              checked={formData.editVendor || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "editVendor", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to generate Sales receipt from BADE`}>
              Raise Invoice
            </label>
            <Switch
              checked={formData.raiseInvoice || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "raiseInvoice", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to generate L.P.O`}>
              Raise Purchase Order
            </label>
            <Switch
              checked={formData.raiseLpo || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "raiseLpo", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to POST and APPROVE credit and debit note respectively`}>
              Credit Officer
            </label>
            <Switch
              checked={formData.creditOfficer || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "creditOfficer", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to manage asset`}>
              Asset Manager
            </label>
            <Switch
              checked={formData.AssetManager || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "AssetManager", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to Raise/Request expense`}>
              Create Expense
            </label>
            <Switch
              checked={formData.expenseUser || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "expenseUser", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to Approve expense`}>
              Expense Approver
            </label>
            <Switch
              checked={formData.expenseApprover || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "expenseApprover", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to create and manage expense tags`}>
              Expense Manager
            </label>
            <Switch
              checked={formData.expenseManager || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "expenseManager", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be notified when a new Sales order is generated`}>
              Notify Sales Order
            </label>
            <Switch
              checked={formData.notifySalesOrder || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "notifySalesOrder", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to register payment to vendors ledger.`}>
              Register Vendor Payment
            </label>
            <Switch
              checked={formData.postVendorPayment || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "postVendorPayment", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to post payent to customers ledger.`}>
              Register Customer Payment
            </label>
            <Switch
              checked={formData.postPayment || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "postPayment", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to Assign credit limit to a customer's account`}>
              Edit Credit Limit
            </label>
            <Switch
              checked={formData.EditCreditLimit || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "EditCreditLimit", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be notified when selling price of products are updated`}>
              Notify pricelist update
            </label>
            <Switch
              checked={formData.notifyPricelistChange || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "notifyPricelistChange", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be notified when purchase price of products are updated`}>
              Notify Buying Price Change
            </label>
            <Switch
              checked={formData.notifyPriceChange || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "notifyPriceChange", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer">
              Human Resource Manager
            </label>
            <Switch
              checked={formData.isHRM || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "isHRM", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will verify inter-stores transfers and purchase from suppliers`}>
              Approve Transfers / Purchase
            </label>
            <Switch
              checked={formData.allowInternalTransfers || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "allowInternalTransfers", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be responsible for support related issue.`}>
              Help-Desk Officer
            </label>
            <Switch
              checked={formData.isHelpDeskOfficer || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "isHelpDeskOfficer", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will be able to perform full sales return`}>
              Cancel Invoice
            </label>
            <Switch
              checked={formData.cancelInvoice || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "cancelInvoice", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer">
              Request Leave
            </label>
            <Switch
              checked={formData.requestLeave || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "requestLeave", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer">
              Appraisal User
            </label>
            <Switch
              checked={formData.AppraisalUser || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "AppraisalUser", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer">
              Approve Leave
            </label>
            <Switch
              checked={formData.approveLeave || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "approveLeave", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`${formData.firstName} will act as a middleman to verify payments befor they impact customer ledger`}>
              Accountant
            </label>
            <Switch
              checked={formData.isAccountant || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "isAccountant", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer">
              Appraisal Manager
            </label>
            <Switch
              checked={formData.approveLeave || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "approveLeave", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`Grant ${formData.firstName} access to view sensitive business dashboards.`}>
              C-level Dashboard
            </label>
            <Switch
              checked={formData.c_levelDash || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "c_levelDash", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`Grant ${formData.firstName} access to view sensitive business Reports.`}>
              Report User
            </label>
            <Switch
              checked={formData.ReportUser || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "ReportUser", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-md">
            <label className="text-sm font-medium cursor-pointer" title={`Grant ${formData.firstName} access to sales portal.`}>
              Access sales portal
            </label>
            <Switch
              checked={formData.isSalesRep || false}
              onCheckedChange={(checked) => {
                const fakeEvent = { target: { name: "isSalesRep", checked } };
                handleChange(fakeEvent);
              }}
            />
          </div>
        </div>
      </fieldset>

      {/* Modular Application Access */}
      <hr />
      {businessInfo?.subscriptionplan?.trim() !== "Basic" && (
        <div className="mt-10 space-y-10" title={`Assign view only access to ${formData.firstName} on Apps installed on business enviroment`}>
          <fieldset className="grid grid-cols-4">
            <legend className="text-sm/6 font-semibold col-span-4">
              Push Modular Application Access
            </legend>
            <div className="mt-6 col-span-4 space-y-1">
              {businessInfo?.modules && Array.isArray(businessInfo.modules) && businessInfo.modules.length > 0 ? (
                businessInfo.modules.map((app, index) => {
                  const isChecked = formData.Apps?.some((a) => a.Name === app.Name) || false;

                  return (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0 px-2 rounded-lg">
                      <label className="text-sm font-medium cursor-pointer">
                        {app?.Name || ""}
                      </label>
                      <Switch
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const fakeEvent = { target: { name: app.Name, checked } };
                          handleChange2(fakeEvent);
                        }}
                      />
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No business apps available.</p>
              )}
            </div>
          </fieldset>
        </div>
      )}

      <hr />

      {userInfo?.isDev && (
        <>
          <AssignTenantDropdown businessData={TenantData} businessInfo={businessInfo} userInfo={userInfo} data={data}/>

          <div className="mt-10">
            <h3 className="text-sm font-semibold mb-3">
              Assigned Tenants
            </h3>
            <div className="flex flex-wrap gap-2">
              {data?.toogledTenants?.filter((tenant) => tenant.tenantIds.tenantId !== data.tenantId).map((tenant) => (
                <span
                  key={tenant._id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                >
                  {tenant.tenantIds.companyName || "Unknown Tenant"}
                  <button
                    onClick={() => handleRemoveTenant(tenant._id)}
                    className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </form>
  );
}

export function AssignTenantDropdown({businessInfo, businessData, userInfo, data }) {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [query, setQuery] = useState("");

  const filteredTenants =
    query === ""
      ? businessData
      : businessData.filter((tenant) =>
          tenant.companyName.toLowerCase().includes(query.toLowerCase()),
        );

  const handleTenantAssign = async (tenantId) => {
    try {
      const result = await Swal.fire({
        title: "Assign Tenant?",
        text: "Are you sure you want to assign this tenant?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#30d6b2",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, assign it",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        plsWait('Assigning tenant...');
        const response = await fetch(
          `${EXPRESS_PRIVATE_URL}/api/assign-tenant/${Encrypt(data._id)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Encrypt(businessInfo.tenantId)}`,
              access: `${Encrypt(userInfo._id)}`,
              sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`
            },
            body: JSON.stringify({ tenantId: Encrypt(tenantId) }),
          }
        );

        if (response.ok) {
          SuccessToast(response.message || "Tenant assigned successfully.");
          setQuery("");
          setSelectedTenant(null);
          window.location.reload();
        } else {
          throw new Error("Failed to assign tenant.");
        }
      }
    } catch (error) {
      setQuery("");
      setSelectedTenant(null);
      ErrorMessage(error.message);
    }
  };

  return (
    <div className="mt-10 space-y-10">
      <fieldset className="grid grid-cols-4 gap-4">
        <legend className="text-sm font-semibold col-span-4">
          Assign Tenant
        </legend>

        <div className="col-span-4">
          <Combobox
            value={selectedTenant}
            onChange={(tenant) => {
              setSelectedTenant(tenant);
              handleTenantAssign(tenant._id);
            }}
          >
            <Combobox.Input
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs"
              displayValue={(tenant) => tenant?.companyName || ""}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tenant..."
            />
            <Combobox.Options className="mt-2 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
              {filteredTenants.length === 0 && (
                <div className="px-4 py-2 text-gray-500">No tenants found</div>
              )}
              {filteredTenants.map((tenant, index) => (
                <Combobox.Option
                  key={tenant.tenantId}
                  value={tenant}
                  className={({ active }) =>
                    `cursor-pointer px-4 py-2 text-xs ${
                      active ? "bg-blue-600 text-white" : ""
                    }`
                  }
                >
                  {tenant.companyName || `Tenant ${index + 1}`}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox>
        </div>
      </fieldset>
    </div>
  );
}