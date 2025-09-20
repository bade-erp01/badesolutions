import Image from "next/image";
import Nav1 from "./Components/Nav1";
import Footer1 from "./Components/Footer1";
import Link from "next/link";
import "animate.css";

export const metadata = {
  title: "Business Automated Dynamic Enterprise [B.A.D.E]",
  description:
    "Business Automated Dynamic Enterprise [B.A.D.E] - Automate, Optimize, and Scale Your Business Operations",
  keywords: [
    "Business Automation",
    "Enterprise Solutions",
    "B.A.D.E",
    "AI-powered Business",
    "Workflow Optimization",
    "Process Automation",
  ],
  author: "Business Automated Dynamic Enterprise",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#f4a8ff",
  ogTitle:
    "Business Automated Dynamic Enterprise [B.A.D.E] | Next-Level Automation",
  ogDescription:
    "Streamline your business with AI-driven automation, real-time insights, and scalability",
  ogImage: "/assets/bade.png",
  ogUrl: "https://badesolutions.com.ng",
  twitterCard: "favicon.ico",
  twitterTitle: "Business Automated Dynamic Enterprise [B.A.D.E]",
  twitterDescription:
    "Automate and optimize your enterprise with cutting-edge business solutions",
  twitterImage: "favicon.ico",
  favicon: "favicon.ico",
};

export default function Home() {
  return (
    <div className="">
     
      {/* Hero section */}
      <div
        className=""
        style={{
          backgroundImage: 'url("/josh-calabrese-Ca8r0PSWg9Q-unsplash.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(30%)",
          zIndex: -2,
        }}
      >
        <Nav1 />
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 animate__slideInUp animate__animated">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 font-semibold">
              Cloud ERP to enrich your business.{" "}
              <Link href="/Pricing" className="font-bold text-indigo-600">
                <span aria-hidden="true" className="absolute inset-0" />
                Get started with B.A.D.E <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-center text-gray-900 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-tight mb-6">
              <span className="text-balance bg-gradient-to-r from-gray-600 via-gray-600 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
                Business Automated Dynamic Enterprise.
              </span>
            </h1>
            <p
              className="mt-2 text-sm text-pretty text-grey-400 sm:text-xl/8 
              bg-white/20 backdrop-blur-xs rounded-xl px-6 py-4 border border-white/20 shadow-lg"
            >
              Streamline Your Success with 🚀 AI-powered automation, seamless
              collaboration, and real-time insights—all in one scalable ERP
              solution.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/Pricing"
                className="rounded-md bg-gray-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started with B.A.D.E
              </Link>
              <Link
                href="/auth/Apps"
                className="text-sm/6 font-semibold text-gray-900"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div>
      </div>

      <section className="w-full flex justify-center mt-2 mb-2">
        <div className="flex bg-gray-100 rounded-lg overflow-hidden shadow text-sm">
          <button className="px-6 py-2 text-gray-500 font-semibold hover:bg-gray-200 transition">
            Meeting
          </button>
          <button className="px-6 py-2 bg-white text-gray-900 font-bold border-b-2 border-gray-900">
            Management
          </button>
          <button className="px-6 py-2 text-gray-500 font-semibold hover:bg-gray-200 transition">
            Results
          </button>
        </div>
      </section>

      <section className="w-full max-w-5xl mx-auto py-8 md:py-12 px-4 md:px-0">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(30%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(30%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-900">
          Let Bade Do The Work.
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Manage your time on your tasks and increase your efficiency, create as
          many projects as you want.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition">
            <Image
              src="/window.svg"
              alt="Track time"
              width={64}
              height={64}
              className="mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">Sales</h3>
            <p className="text-gray-500 mb-2">
              Create your projects and start tracking sales immediately
            </p>
            <span className="text-2xl text-gray-400">→</span>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition ">
            <Image
              src="/globe.svg"
              alt="Performance"
              width={64}
              height={64}
              className="mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">Performance</h3>
            <p className="text-gray-500 mb-2">
              Manage your time on your tasks and increase your efficiency
            </p>
            <span className="text-2xl text-gray-400">→</span>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition">
            <Image
              src="https://img.icons8.com/external-icongeek26-glyph-icongeek26/64/external-report-virus-icongeek26-glyph-icongeek26.png"
              alt="Reports"
              width={64}
              height={64}
              className="mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">Reports</h3>
            <p className="text-gray-500 mb-2">
              Generate and export reports of your separate projects
            </p>
            <span className="text-2xl text-gray-400">→</span>
          </div>
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-12 px-4 md:px-0">
        <div className="flex flex-col gap-6 justify-between">
          <div className="bg-white rounded-xl shadow p-6 text-left hover:shadow-lg transition cursor-pointer">
            <h4 className="font-semibold mb-2">CRM & Sales.</h4>
            <p className="text-gray-500 text-xs">
              Take full <b className="font-bold">Ctrl</b> of your business with
              our CRM tool—designed to put you in the driver’s seat.
              Effortlessly manage customer relationships, monitor sales in real
              time, automate repetitive tasks, and gain crystal-clear insights
              into performance. With everything centralized and streamlined,
              you’re not just running your business—you’re mastering it.
            </p>
            <div className="w-full rounded-lg overflow-hidden ">
              <Image
                src="/download (7).jpg" // Update path if needed
                alt="Dashboard Interface"
                width={300}
                height={300}
                className="w-full h-auto object-cover transition duration-300 hover:scale-105"
              />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-left hover:shadow-lg transition cursor-pointer">
            <h4 className="font-semibold mb-2">CUSTOMIZED APPS.</h4>
            <p className="text-gray-500 text-xs">
              We Build applications that work the way your business works. Our
              platform empowers you to create tailored solutions that match your
              unique processes, goals, and business needs. No more adapting to
              generic tools—design features, workflows, and dashboards that give
              you full control and flexibility. Your business, your rules.
            </p>
            <div className="w-full rounded-lg overflow-hidden ">
              <Image
                src="/Never Give Up - James Min.jpg" // Update path if needed
                alt="Dashboard Interface"
                width={300}
                height={300}
                className="w-full h-auto object-cover transition duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center animate__animated animate__zoomInDown">
          <Image
            src="/download__1_-removebg-preview.png"
            alt="SaaS Illustration"
            width={250}
            height={250}
            className="mb-4 drop-shadow-lg transition duration-300 hover:scale-105"
            style={{
              filter: "drop-shadow(2px 5px rgb(19, 20, 19))",
              transition: "0.5s",
              objectFit: "cover",
            }}
          />
          <h3 className="text-lg font-semibold text-center mb-2">
            Your search for ERP is OVER...!🔥
          </h3>
          <p className="text-gray-500 text-center text-sm">
            Scale your operations with confidence. Our system grows with your
            business, providing flexibility and adaptability for future
            expansion while promoting workspace collaboration.
          </p>
        </div>

        <div className="flex flex-col gap-6 justify-between">
          <div className="bg-white rounded-xl shadow p-6 text-left hover:shadow-lg transition cursor-pointer">
            <h4 className="font-semibold mb-2">Dashboard With Idea</h4>
            <p className="text-gray-500 text-xs mb-4">
              Get instant insights with a centralized view of key metrics and
              performance data. Make informed decisions with real-time
              analytics.🚀
            </p>
            <div className="w-full rounded-lg overflow-hidden ">
              <Image
                src="/IMG_8442_1_-removebg-preview.png" // Update path if needed
                alt="Dashboard Interface"
                width={600}
                height={400}
                className="w-full h-auto object-cover transition duration-300 hover:scale-105"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-left hover:shadow-lg transition cursor-pointer">
            <h4 className="font-semibold mb-2">Finance.</h4>
            <p className="text-gray-500 text-xs">
              Manage accounting, budgeting, and financial reporting with ease.
              Ensure compliance and make informed business decisions with
              accurate financial data.
            </p>
            <div className="w-full rounded-lg overflow-hidden ">
              <Image
                src="/3D_Graphic_Design_Illustration_for_Marketing_Analytics_Software-removebg-preview.png" // Update path if needed
                alt="Dashboard Interface"
                width={300}
                height={300}
                priority={false}
                loading="lazy"
                className="w-full h-auto object-cover transition duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer1 />
    </div>
  );
}
