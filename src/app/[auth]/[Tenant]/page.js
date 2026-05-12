import Footer2 from "@/app/Components/Footer2";
import Nav1 from "@/app/Components/Nav1";
import Link from "next/link";
import Image from "next/image";
import moment from "moment";
import { Encrypt } from "../../../../Functions/Functions";
import { fetchUser } from "../../../../Functions/useerDataRefresh";
import TermsAndConditionsLink from "@/app/Components/TermsAndCondition";
import Logout from "@/app/Components/Logout";
import MainDash from "@/app/Components/MainDash";
import SubscriptionReminder from "@/app/Components/SubscritionReminder";
import BirthdayGreetings from "@/app/Components/BithdayToast";
import { Squares2X2Icon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function TenantPage({ params }) {
  const userData = await fetchUser();

  const languages = ["es", "en", "de", "fr"];

  const getRandomLanguage = () =>
    languages[Math.floor(Math.random() * languages.length)];

  const getLocalizedGreeting = (name = "Guest", lang = getRandomLanguage()) => {
    const hour = moment().hour();
    const timeOfDay =
      hour >= 5 && hour < 12
        ? "morning"
        : hour >= 12 && hour < 17
          ? "afternoon"
          : hour >= 17 && hour < 22
            ? "evening"
            : "generic";

    const greetings = {
      en: {
        morning: "Good morning",
        afternoon: "Good afternoon",
        evening: "Good evening",
        generic: "Hello",
      },
      fr: {
        morning: "Bonjour",
        afternoon: "Bon après-midi",
        evening: "Bonsoir",
        generic: "Salut",
      },
      es: {
        morning: "Buenos días",
        afternoon: "Buenas tardes",
        evening: "Buenas noches",
        generic: "Hola",
      },
      de: {
        morning: "Guten Morgen",
        afternoon: "Guten Tag",
        evening: "Guten Abend",
        generic: "Hallo",
      },
    };

    return `${
      greetings[lang]?.[timeOfDay] || greetings.en[timeOfDay]
    }, ${name}.`;
  };

  const companySlug = userData?.business?.companyName
    ?.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return (
    <div className="flex flex-col bg-gray-100">
      <Nav1
        user={userData?.user}
        business={userData?.business}
        page={`${userData?.business?.companyName}!`}
      />

      <div className="flex flex-2 max-h-[83vh] overflow-y-hidden">
        {/* PROFESSIONAL SIDEBAR */}
        <aside className="w-72 h-screen sticky top-0 bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#020617] border-r border-white/10 text-white flex flex-col overflow-hidden">
           {/* HEADER */}
          <div className="px-5 py-5 border-b border-white/10 backdrop-blur-xl bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-medium">
                Applications
              </p>

              <h3 className="text-sm font-semibold mt-1 text-gray-100">
                Workspace Modules
              </h3>
            </div>

            <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
              <Squares2X2Icon className="h-4 w-4 text-gray-300" />
            </div>
          </div>

          </div>

          {/* APPS */}
          <div
            className="flex-1 overflow-y-auto px-3 pb-4"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#334155 transparent",
            }}
          >
            <div className="space-y-1">
              {userData?.user?.Apps.map((app, index) => {
                const appHref = `/${companySlug}/${Encrypt(
                  userData.user._id,
                )}/${app.url.toLowerCase().replace(/\s+/g, "")}/${app.url
                  .toLowerCase()
                  .replace(/\s+/g, "")}`;

                return (
                  <Link
                    key={index}
                    href={appHref}
                    title={app.Description || ""}
                    className="group relative flex items-center gap-3 rounded-xl px-1 py-1 transition-all duration-300 hover:bg-white/8 border border-transparent hover:border-white/10"
                  >
                    {/* ACTIVE GLOW */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* ICON */}
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all duration-300 shadow-lg">
                      <Image
                        src={
                          app.icon ||
                          "https://img.icons8.com/deco/48/open-box.png"
                        }
                        width={20}
                        height={20}
                        alt={app.Name}
                        className="object-contain"
                      />
                    </div>

                    {/* TEXT */}
                    <div className="flex-1 min-w-0 relative">
                      <p className="text-xs font-medium text-gray-100 truncate">
                        {app.Name}
                      </p>

                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {app.Description?.slice(0, 45) || "Business module"}
                      </p>
                    </div>
                  </Link>
                );
              })}

              {/* SPECIAL APPS */}
              {userData?.user?.Email.trim() === "tobenna970@gmail.com" && (
                <>
                  {[
                    {
                      name: "CRM",
                      url: "crm",
                      icon: "https://img.icons8.com/?size=80&id=6Dhx5KybHIh2&format=png",
                      description: "Customer relationship management.",
                    },
                    {
                      name: "Employee Management",
                      url: "employee",
                      icon: "https://img.icons8.com/?size=80&id=SiarGqFdE5SR&format=png",
                      description: "Manage employee operations efficiently.",
                    },
                    {
                      name: "Product Management",
                      url: "product",
                      icon: "https://img.icons8.com/?size=64&id=aR2Ar4o65ts7&format=png",
                      description: "Centralized product operations.",
                    },
                    {
                      name: "Cash Register",
                      url: "payment",
                      icon: "https://img.icons8.com/dusk/64/cash-register.png",
                      description: "Process transactions and payments.",
                    },
                    {
                      name: "Stores Operations",
                      url: "store",
                      icon: "https://img.icons8.com/arcade/64/garage-closed.png",
                      description: "Warehouse and inventory management.",
                    },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      href={`/${companySlug}/${Encrypt(
                        userData.user._id,
                      )}/${item.url}/${item.url}`}
                      className="group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-300 hover:bg-white/8 border border-transparent hover:border-white/10"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                        <Image
                          src={item.icon}
                          width={24}
                          height={24}
                          alt={item.name}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-100 truncate">
                          {item.name}
                        </p>

                        <p className="text-[11px] text-gray-400 truncate">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-4 border-t border-white/10 bg-white/[0.03] backdrop-blur-xl space-y-3">
            {/* APP STORE */}
            {userData?.user?.isAdmin &&
              userData.business.subscriptionplan === "Standard" && (
                <Link
                  href={`/auth/Apps`}
                  className="group flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-1 py-1 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                    <Image
                      src="https://img.icons8.com/avantgarde/100/apple-app-store.png"
                      width={22}
                      height={22}
                      alt="App Store"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">App Store</p>

                    <p className="text-[11px] text-blue-200">
                      Install more modules
                    </p>
                  </div>
                </Link>
              )}

            {/* SETTINGS */}
            {userData?.user?.isAdmin && (
              <Link
                href={`/${companySlug}/account/${Encrypt(
                  userData?.business?._id,
                )}`}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-1 py-1 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                  <Image
                    src="https://img.icons8.com/3d-fluency/94/gear--v1.png"
                    width={22}
                    height={22}
                    alt="Settings"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    Business Settings
                  </p>

                  <p className="text-[11px] text-gray-400">
                    Manage organization
                  </p>
                </div>
              </Link>
            )}

            {/* LOGOUT */}
            <div className="pt-1">
              <Logout />
            </div>

            {/* TERMS */}
            <div className="pt-1">
              <TermsAndConditionsLink
                BusinessPlan={userData?.business?.subscriptionplan}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className="flex-2 max-w-7xl h-[83vh] overflow-y-scroll p-6 bg-linear-to-br from-gray-200 via-gray-100 to-gray-300"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#453d46ff transparent",
          }}
        >
          <section className=" ">
            <header className="mb-2">
              <div className="flex items-center space-x-2">
                <Image
                  src={userData.user.image || "/person.png"}
                  className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)] border-2 rounded-full object-cover "
                  // loading="lazy"
                  priority={true}
                  quality={100}
                  width={25}
                  height={25}
                  alt="user image"
                />
                <h2 className="text-xl font-bold text-gray-900">
                  {getLocalizedGreeting(userData.user.firstName)}
                </h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {`It's ${moment().format("dddd, Do MMMM YYYY")}`}
              </p>
            </header>

            <MainDash userData={userData} />
          </section>
        </main>
      </div>
      <SubscriptionReminder Business={userData.business} />
      <BirthdayGreetings Business={userData.business} user={userData.user} />
      <Footer2 />
    </div>
  );
}
