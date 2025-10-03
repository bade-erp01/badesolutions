import Footer2 from "@/app/Components/Footer2";
import Nav1 from "@/app/Components/Nav1";
import Link from "next/link";
import Image from "next/image"
import moment from "moment";
import { Encrypt } from "../../../../Functions/Functions";
import { fetchUser } from "../../../../Functions/useerDataRefresh";
import { CpuChipIcon } from "@heroicons/react/24/outline";
import Logout from "@/app/Components/Logout";
import MainDash from "@/app/Components/MainDash";
import SubscriptionReminder from "@/app/Components/SubscritionReminder";
import BirthdayGreetings from "@/app/Components/BithdayToast"

export default async function TenantPage({ params }) {
  const userData = await fetchUser();

  const languages = ['es', 'en', 'de', 'fr'];

  const getRandomLanguage = () =>
    languages[Math.floor(Math.random() * languages.length)];

  const getLocalizedGreeting = (name = 'Guest', lang = getRandomLanguage()) => {
    const hour = moment().hour();
    const timeOfDay =
      hour >= 5 && hour < 12
        ? 'morning'
        : hour >= 12 && hour < 17
        ? 'afternoon'
        : hour >= 17 && hour < 22
        ? 'evening'
        : 'generic';

    const greetings = {
      en: { morning: '🌅 Good morning', afternoon: '☀️ Good afternoon', evening: '🌇 Good evening', generic: '👋 Hello' },
      fr: { morning: '🌅 Bonjour', afternoon: '☀️ Bon après-midi', evening: '🌇 Bonsoir', generic: '👋 Salut' },
      es: { morning: '🌅 Buenos días', afternoon: '☀️ Buenas tardes', evening: '🌇 Buenas noches', generic: '👋 Hola' },
      de: { morning: '🌅 Guten Morgen', afternoon: '☀️ Guten Tag', evening: '🌇 Guten Abend', generic: '👋 Hallo' },
    };

    return `${greetings[lang]?.[timeOfDay] || greetings.en[timeOfDay]}, ${name}.`;
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

      <div className="flex flex-2">
        {/* Sidebar */}
        <aside className="w-72 bg-[#1e2939] text-white px-4 py-4 overflow-y-hidden" >
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold">Application Pane</h2>
          </div>
          <hr className="border-gray-600 mb-4" />

          <nav className="space-y-4">
            <div className="max-h-[83vh] overflow-y-hidden">
              {userData?.user?.Apps.map((app, index) => (
                <Link
                  key={index}
                  href={`/${companySlug}/${Encrypt(userData.user._id)}/${app.url.toLowerCase().replace(/\s+/g, "")}/${app.url.toLowerCase().replace(/\s+/g, "")}`}
                  title={app.Description || ""}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <Image src={app.icon || "https://img.icons8.com/deco/48/open-box.png"} width={24} height={24} alt={app.Name} />
                  <span className="text-xs">{app.Name}</span>
                </Link>
              ))}
            </div>

            {userData?.user?.isAdmin && (
              <>
                <Link
                  href={`/auth/Apps`}
                  className="flex items-center gap-3 p-3 rounded-md bg-gray-400 hover:bg-gray-700 transition"
                >
                  <Image
                    src="https://img.icons8.com/avantgarde/100/apple-app-store.png"
                    width={24}
                    height={24}
                    alt="App Store"
                  />
                  <span className="text-sm">App Store</span>
                </Link>

                <Link
                  href={`/${companySlug}/account/${userData?.business?._id}`}
                  className="flex items-center gap-3 p-3 rounded-md bg-gray-400 hover:bg-gray-700 transition"
                >
                  <Image
                    src="https://img.icons8.com/3d-fluency/94/gear--v1.png"
                    width={24}
                    height={24}
                    alt="Settings"
                  />
                  <span className="text-sm">Business Settings</span>
                </Link>
              </>
            )}

            <Logout />
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className="flex-2 max-w-screen-xl h-[83vh] overflow-y-scroll p-6 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#453d46ff transparent' }}
        >
          <section className=" " >
            <header className="mb-2">
              <h2 className="text-xl font-bold text-gray-900">
                {getLocalizedGreeting(userData.user.firstName)}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
              {`It's ${moment().format('dddd, Do MMMM YYYY')}`}
              </p>
            </header>

            <MainDash userData={userData} />
          </section>
        </main>
      </div>
      <SubscriptionReminder Business={userData.business} />
      <BirthdayGreetings Business={userData.business} user={userData.user}/>
      <Footer2 />
    </div>
  );
}
