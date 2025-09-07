import Footer2 from "@/app/Components/Footer2";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import Nav1 from "@/app/Components/Nav1";
import Link from "next/link";
import Image from "next/image";
import dbConnect from "../../../../lib/mongoose";
import moment from "moment";
import { Dencrypt,Encrypt,EXPRESS_PRIVATE_URL } from "../../../../Functions/Functions";
import {fetchUser} from "../../../../Functions/useerDataRefresh";
import GenerealSalesMargin from "@/app/Components/GenerealSalesMargin";
import {ScaleIcon,CpuChipIcon} from "@heroicons/react/24/outline"
import Logout from "@/app/Components/Logout"
import Marquee from "react-fast-marquee";

export default async function TenantPage({ params }) {
  await dbConnect();  
  const userData  = await fetchUser();
  //  make fetch request to backend api
  const fetchTenantData = async () => {
    try {
      const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/Report`, {
        headers: {
          Authorization: `Bearer ${Encrypt(userData?.business.tenantId)}`,
        },
        // cache: 'no-store', // Ensures fresh data on every request
        next: {
        revalidate: 120 ,// revalidate every 3min
        cache: "force-cache"
      }
      });

      const data = await res.json();
      return data;

    } catch (error) {
      throw error;
    }
  };


  let tenantData = await fetchTenantData();

  const lang = ['es','en','de','fr']

  // function that randomly selects a language
  function getRandomLanguage() {
    return lang[Math.floor(Math.random() * lang.length)];
  }

  function getLocalizedGreeting(name = 'Guest', lang = getRandomLanguage()) {
  const now = moment();
  const hour = now.hour();

  let timeOfDay;
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
  else timeOfDay = 'generic';

  const greetings = {
    en: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
      generic: 'Hello'
    },
    fr: {
      morning: 'Bonjour',
      afternoon: 'Bon après-midi',
      evening: 'Bonsoir',
      generic: 'Salut'
    },
    es: {
      morning: 'Buenos días',
      afternoon: 'Buenas tardes',
      evening: 'Buenas noches',
      generic: 'Hola'
    },
    de: {
      morning: 'Guten Morgen',
      afternoon: 'Guten Tag',
      evening: 'Guten Abend',
      generic: 'Hallo'
    }
  };

  const greeting = greetings[lang]?.[timeOfDay] || greetings.en[timeOfDay];
  return `${greeting}, ${name}.`;
}


  const truncate = (str, maxLength) =>
  str.length > maxLength ? str.slice(0, maxLength) + '...' : str;

  return (
    <div className="flex flex-col min-h-screen overflow-auto">
      <Nav1
        user={userData?.user}
        business={userData?.business}
        page={`${userData?.business?.companyName}!`}
      />

      <div className="flex flex-1 text-white text-xs">
        {/* Sidebar (collapsible on mobile) */}
        <aside
          className={`w-70 text-xs
          text-white px-4 py-6 transition-all duration-300 h-[520px] max-h-[600px] overflow-y-auto md:block bg-[#1e2939]`}
          style={{ maxHeight: "580px", overflowY: "auto" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CpuChipIcon className="h-7 w-7 text-gray-100" />
            <h2 className="text-sm font-extrabold text-white tracking-tight">
              Application Pane
            </h2>
          </div>
          <hr />
          <nav className="space-y-3 text-xs">
            {userData?.user?.Apps.map((app, index) => (
              <Link
                key={index}
                href={`/${userData.business.companyName
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                  userData.user._id
                )}/${app.url.toLowerCase().replace(/\s+/g, "")}/${app.url
                  .toLowerCase()
                  .replace(/\s+/g, "")}`}
                title={app.Description || ""}
                className="cursor-pointer flex items-center gap-3 p-3 rounded-md w-full hover:bg-gray-700 transition"
              >
                <Image src={app.icon} width={24} height={24} alt={app.Name} />
                <span className="text-xs">{app.Name}</span>
              </Link>
            ))}
            {userData?.user?.isAdmin && (
              <Link
                href={`/auth/Apps`}
                className="cursor-pointer flex items-center bg-gray-400 gap-3 p-3 rounded-md w-full hover:bg-gray-700 transition"
              >
                <Image
                  src="https://img.icons8.com/avantgarde/100/apple-app-store.png"
                  width={24}
                  height={24}
                  alt="Settings"
                />
                <span className="text-sm">App Store</span>
              </Link>
            )}
          </nav>

          {/* Bottom Section with Settings Link */}
            {userData?.user?.isAdmin && (
              <Link
                href={`/${userData?.business?.companyName
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}/account/${
                  userData?.business?._id
                }`}
                className="flex items-center gap-3 bg-gray-400 mt-1 mb-1 p-3 rounded-md hover:bg-gray-700 transition"
              >
                <Image
                  src="https://img.icons8.com/3d-fluency/94/gear--v1.png"
                  width={24}
                  height={24}
                  alt="Settings"
                />
                <span className="text-sm">Business Settings</span>
              </Link>
            )}
            {/* logout btn */}
            <Logout/>

        </aside >{" "}
        {/* Main Content Area */}
        {userData.user.c_levelDash ? (
        <main className="flex-1" style={{ overflowY: "hidden" }}>
          <section className="w-full max-w-screen-xl  p-5 h-[520px] overflow-y-auto bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 backdrop-blur-md rounded-sm ">
            {/* Header */}
            <header className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {getLocalizedGreeting(userData.user.firstName)}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Overview of Business activity and performance
                </p>
              </div>
            </header>

            {/* KPI cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-5 rounded card-shadow shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-gray-500">Today's Sales</h3>
                    <p className="text-2xl text-green-600 font-bold mt-1">
                      {userData.business.currency?.currency.Symbol}
                      {tenantData.TodaySale?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Updated at {moment().format("HH:MM")}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-700 text-white text-xl shadow-md">
                    📈
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded card-shadow shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-gray-500">Revenue</h3>
                    <p className="text-2xl text-gray-500 font-bold mt-1">
                      {userData.business.currency?.currency.Symbol}
                      {tenantData.Revenue?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-500 text-white shadow-md">
                    💰
                  </div>
                </div>
              </div>
              {tenantData.yearlysales.length > 0 ? (
                <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-gray-500">Avg Sales</h3>
                    <p className="text-sm text-gray-800 font-semibold mt-1">
                       {userData.business.currency?.currency.Symbol}
                      {Math.round(
                        tenantData.yearlysales.reduce((acc, curr) => acc + (curr.grandTotal || 0), 0) /
                        tenantData.yearlysales.length
                      ).toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-red-100 text-white px-4 py-2 rounded shadow-sm">
                    <ScaleIcon className="h-6 w-6 text-gray-900" />
                  </div>
                </div>
              </div>
              ):""}
              
              {tenantData.Bestproduct.length > 0 ? (
                <div className="bg-white p-5 rounded card-shadow shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-gray-500">Best Seller</h3>
                    <p className="text-sm text-gray-500 font-bold mt-1">
                      {tenantData.Bestproduct[0]?.Name} [
                      {tenantData.Bestproduct[0]?.TotalSale?.toLocaleString()}]
                    </p>
                  </div>
                  <Image
                    src={tenantData.Bestproduct[0]?.image || null}
                    width={58}
                    height={58}
                    quality={100}
                    priority={true}
                    alt={tenantData.Bestproduct[0]?.Name}
                    className="w-18 h-18 rounded-full"
                  />
                </div>
              </div>
              ):""}
              
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity / feed */}
              <section className="lg:col-span-2">
                <div className="bg-white rounded p-3 shadow-xl">
                  {/* Chart */}
                  <GenerealSalesMargin
                    yearlysales={tenantData.yearlysales}
                    warehouses={tenantData.warehouses}
                  />
                </div>

                {/* Properties table */}
                {tenantData.invoice?.length > 0 && (
                  <div className="bg-white rounded p-6 mt-6 card-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg text-gray-500 font-semibold">
                        Recent Sales
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-xs text-gray-500 border-b">
                          <tr>
                            <th className="py-3">Ref</th>
                            <th className="py-3">Customer</th>
                            <th className="py-3">Grand Total</th>
                            <th>Raised By</th>
                            <th className="py-3">Status</th>
                            <th> Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-700">
                          {tenantData.invoice.map((invoice, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-3">
                                {invoice.billReferenceNo}
                              </td>
                              <td className="py-3">{invoice.customerName}</td>
                              <td className="py-3">
                                {userData.business.currency?.currency.Symbol}
                                {invoice.grandTotal?.toLocaleString()}
                              </td>
                              <td className="py-3">{invoice.RaiseBy}</td>
                              <td
                                className={`py-3 ${
                                  invoice.billStatus !== "Cancelled"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {invoice.billStatus}
                              </td>
                              <td className="py-3">
                                {" "}
                                <a href="#" className="text-indigo-600">
                                  View
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>

              {/* Quick stats / chart placeholder */}
              <aside className="bg-white rounded p-6 card-shadow text-xs">
                <h4 className="text-sm text-gray-500 font-semibold mb-4">
                  Sales target Millestone
                </h4>

                {tenantData.result.map((person, index) => (
                  <div
                    key={index}
                    className="text-xs bg-white rounded-lg p-4 mb-2 hover: border hover:border-gray-200  hover:shadow-md transition duration-200"
                    title={`${person.firstName}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-600 text-right justify-content-end">
                        {userData.business.currency?.currency.Symbol}{person.totalSales?.toLocaleString()} /
                        {userData.business.currency?.currency.Symbol}{person.salesTarget?.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-1">
          
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${Math.min(Math.round(person.percentage), 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="text-gray-700 font-semibold truncate max-w-[100px]">
                      {truncate(person.firstName, 10)}
                    </span>
                    <span className="text-green-600 font-medium text-xs">
                      {`${parseFloat(person.percentage).toFixed(2)}% achieved`}
                    </span>
                  </div>
                  </div>
                ))}
                <div className="text-center mt-6 border-bottom ">
                  <ExcelDownloadBtn data={tenantData.result} page={`Sales Team Performance`} />
                </div>
                <hr />
                <div className="mt-6 border-t-2">
                  <h4 className="text-lg text-gray-500 font-semibold mb-4">
                    Upcoming Events 📆
                  </h4>
                  <ul className="list-disc list-inside">
                    {tenantData.birthdayCelebrants.map((element) => (
                      <li key={element._id} className="text-gray-700 ">
                        <Image
                          src={"/person.png"}
                          priority={false}
                          quality={100}
                          loading="lazy"
                          alt={`${element.name}'s profile`}
                          className="inline-block w-6 h-6 rounded-full mr-2"
                          width={24}
                          height={24}
                        />
                        Today is {element.name}'s birthday
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
            {tenantData.debtorsArray?.length > 0 && (
              <div className="w-full text-center mt-3">
                  {tenantData.debtorsArray?.length > 0 && (
                      <div className="w-full text-center mt-3">
                        <Marquee
                          gradient={false}
                          speed={30}
                          className="w-full bg-gray-600 py-2"
                        >
                          <span className="text-gray-700 bg-red-200 px-2 py-1 rounded mr-2">
                            ⚠️ Debtors:
                          </span>
                          {tenantData.debtorsArray.map((debtor) => (
                            <span
                              key={debtor._id}
                              className="mx-1 text-white bg-gray-400 px-2 py-1 rounded"
                            >
                              {debtor.Username} owes{" "}
                              {userData.business.currency?.currency.Symbol}
                              {debtor.Debt?.toLocaleString()},
                            </span>
                          ))}
                        </Marquee>
                      </div>
                    )}
                </div>
            )}
            
            {/* Footer */}
            <footer className="mt-8 text-sm text-gray-500">
              © <span id="year">{moment().format("YYYY")}</span> Business
              Automated Dynamic Enterprise — All rights reserved.
            </footer>
          </section>
        </main>
        ):(
          <main className="flex-1">
            <section className="w-full max-w-screen-xl mx-auto p-6 h-[500px] overflow-y-auto bg-gradient-to-br from-gray-100 via-white to-gray-200 backdrop-blur-md rounded-xl shadow-xl">
              
              {/* Header */}
              <header className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {getLocalizedGreeting(userData.user.firstName)}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Navigate to any module to carry out business operations.
                  </p>
                </div>
              </header>

              {/* Birthday Marquee */}
              <div className="mt-6">
                <div className="w-full text-center">
                {tenantData.birthdayCelebrants?.length > 0 ? (
                  <div className="bg-indigo-50 rounded-lg py-2 px-4 shadow-inner">
                    <marquee
                      behavior="scroll"
                      direction="left"
                      scrollamount="3"
                      className="text-sm text-indigo-700 font-medium"
                      style={{ width: "100%" }}
                    >
                        <ul className="flex gap-6 list-none">
                          {tenantData.birthdayCelebrants.map((element) => (
                            <li key={element._id} className="flex items-center gap-2">
                              <Image
                                src="/person.png"
                                alt={`${element.name}'s profile`}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                              <span>🎉 Today is <strong>{element.name}</strong>'s birthday!</span>
                            </li>
                          ))}
                        </ul>
                        </marquee>
                        </div>
                      ) : (
                        ""
                      )}
                </div>
              </div>
            </section>
          </main>
        )}
      </div>
      <Footer2 />
    </div>
  );
}
