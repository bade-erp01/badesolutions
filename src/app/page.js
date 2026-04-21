"use client"

import Image from "next/image";
import Nav1 from "./Components/Nav1";
import Footer1 from "./Components/Footer1";
import Link from "next/link";
import "animate.css";
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  const redirect = (url) => {
    alert("Redirecting to " + url)
    router.push(url)
  }

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div
        className="relative"
        style={{
          backgroundImage: 'url("/adrian-sulyok-c_4eaGRDSVU-unsplash.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(40%)",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <Nav1 />
        <div className="relative z-10 mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 px-4 animate__slideInUp animate__animated">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center bg-black/20 backdrop-blur-xs rounded-xl">
            <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-200 ring-1 ring-gray-200/10 hover:ring-gray-200/20 font-semibold">
              Cloud ERP to enrich your business.{" "}
              <Link href="/Pricing" className="font-bold text-orange-300 hover:text-orange-400 transition">
                <span aria-hidden="true" className="absolute inset-0" />
                Get started with B.A.D.E <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
          <div className="text-center bg-black/20 backdrop-blur-xs rounded-xl p-6 sm:p-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-tight mb-6">
              <span className="text-balance bg-gradient-to-r from-gray-200 via-gray-300 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
                Business Automated Dynamic Enterprise.
              </span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-pretty text-white">
              Streamline Your Success with AI-powered automation, seamless collaboration, and real-time insights—all in one scalable ERP solution.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/Pricing"
                className="rounded-md bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition transform hover:scale-105"
              >
                Discover More →
              </Link>
              <Link
                href="#"
                className="rounded-md border-2 border-white bg-transparent px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Learn More →
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
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-xl -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#2e282b] to-[#2b2b30] opacity-30 sm:left-[calc(50%-30rem)] sm:w-6xl"
          />
        </div>
      </div>

      {/* Features Section - Why Choose B.A.D.E */}
      <section className="w-full max-w-5xl mx-auto py-12 md:py-16 px-4 md:px-0">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
          Why Choose B.A.D.E?
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Let B.A.D.E do the work. Manage your time on your tasks and increase your efficiency, create as many projects as you want.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Team Collaboration"
            description="Empower teamwork by connecting members and streamlining collaboration across projects."
            image="/Julian_Burford-removebg-preview.png"
          />
          <FeatureCard
            title="Sales Portal"
            description="Business on the go with our mobile-friendly portal, designed for sales teams to stay productive from anywhere."
            image="/Gps, Map, Navigation, Direction Solid Icon Vector Illustration Logo Template_ Suitable For Many Purposes_.jpg"
            hasLink={true}
            linkHref="/SalesPortal"
            linkText="Access Portal"
          />
          <FeatureCard
            title="Global Accessibility"
            description="Stay productive by reaching your business data globally, no matter where you are."
            image="/Gaming Keyboard Coloring Page Â€“ Cute Character Style - Print For Free From Our Website.jpg"
          />
        </div>
      </section>

      {/* Solutions Section */}
      <section className="w-full bg-gradient-to-br from-gray-50 to-gray-100 py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-6 justify-between">
            <SolutionCard
              title="CRM & Sales"
              description="Take full Ctrl of your business with our CRM tool—designed to put you in the driver's seat. Effortlessly manage customer relationships, monitor sales in real time, automate repetitive tasks, and gain crystal-clear insights into performance."
              image="/download (7).jpg"
            />
            <SolutionCard
              title="Customized Apps"
              description="We build applications that work the way your business works. Create tailored solutions that match your unique processes, goals, and business needs. Your business, your rules."
              image="/NeverGiveUp-JamesMin.webp"
            />
          </div>

          <div className="flex flex-col items-center justify-center animate__animated animate__zoomInDown">
            <div className="relative">
              <Image
                src="/download__1_-removebg-preview.png"
                alt="SaaS Illustration"
                width={250}
                height={250}
                className="mb-6 drop-shadow-lg transition duration-300 hover:scale-110"
                style={{
                  filter: "drop-shadow(2px 5px rgb(19, 20, 19))",
                }}
              />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-3">
              Your search for ERP is OVER...! 🔥
            </h3>
            <p className="text-gray-600 text-center text-sm max-w-sm">
              Scale your operations with confidence. Our system grows with your business, providing flexibility and adaptability for future expansion while promoting workspace collaboration.
            </p>
            <Link
              href="/Pricing"
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105"
            >
              Get Started Today
            </Link>
          </div>

          <div className="flex flex-col gap-6 justify-between">
            <SolutionCard
              title="Dashboard With Insights"
              description="Get instant insights with a centralized view of key metrics and performance data. Make informed decisions with real-time analytics. 🚀"
              image="/IMG_8442_1_-removebg-preview.png"
            />
            <SolutionCard
              title="Finance Management"
              description="Manage accounting, budgeting, and financial reporting with ease. Ensure compliance and make informed business decisions with accurate financial data."
              image="/3D_Graphic_Design_Illustration_for_Marketing_Analytics_Software-removebg-preview.webp"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
        {/* <section className="w-full py-16 md:py-20 text-center text-white">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Trusted by Businesses Worldwide</h2>
            <TestimonialCarousel />
          </div>
        </section> */}

        {/* Final CTA Section */}
      <section className="w-full py-20 px-4 text-center bg-gradient-to-b from-white to-gray-50">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
          Ready to Transform Your Business?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of businesses already leveraging B.A.D.E to scale operations and increase efficiency.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/Pricing"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105"
          >
            Get Started Today
          </Link>
          <Link
            href="/SalesPortal"
            className="px-8 py-4 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            View Live Demo
          </Link>
        </div>
      </section>

      <Footer1 />
    </div>
  );
}

// Feature Card Component
function FeatureCard({ title, description, image, hasLink, linkHref, linkText }) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col items-center text-center group">
      <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
        <Image
          src={image}
          alt={title}
          width={300}
          height={200}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 mb-4 flex-grow">{description}</p>
      {hasLink ? (
        <Link
          href={linkHref}
          className="mt-auto px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition"
        >
          {linkText} →
        </Link>
      ) : (
        <span className="text-2xl text-gray-400">→</span>
      )}
    </div>
  );
}

// Solution Card Component
function SolutionCard({ title, description, image }) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-left group">
      <h4 className="font-bold text-lg mb-2 text-gray-900">{title}</h4>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className="w-full rounded-lg overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={300}
          height={250}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
    </div>
  );
}


import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "Jane Doe",
    role: "CEO, Acme Corp",
    quote:
      "B.A.D.E streamlined our operations and gave us real-time visibility into our projects. Highly recommended!",
  },
  {
    name: "John Smith",
    role: "CTO, InnovateX",
    quote:
      "The customizable ERP modules helped us tailor workflows exactly to our needs. Fantastic support team too.",
  },
  {
    name: "Mary Johnson",
    role: "Founder, GrowthHub",
    quote:
      "With B.A.D.E, we scaled faster and improved collaboration across departments. A game-changer for our business.",
  },
]

export function TestimonialCarousel() {
  const [index, setIndex] = useState(0)

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])


  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative h-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700 hover:border-orange-500 transition-all duration-300 h-full flex flex-col justify-center">
              <p className="text-lg italic text-gray-100 mb-6">"{testimonials[index].quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600" />
                <div className="text-left">
                  <p className="font-semibold text-white">{testimonials[index].name}</p>
                  <p className="text-sm text-orange-400">{testimonials[index].role}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${i === index ? 'bg-orange-500 w-8' : 'bg-gray-400 w-2'}`}
          />
        ))}
      </div>
    </div>
  )
}