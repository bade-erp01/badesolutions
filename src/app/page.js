"use client"

import Link from "next/link"
import Image from "next/image";
import { useRouter } from "next/navigation"
import Nav1 from "./Components/Nav1";

export default function LandingPage() {
  const router = useRouter()

  const redirect = (url) => {
    router.push(url)
  }
  
  const images = {
    hero: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80",
    dashboard: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    team: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
    workspace: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-800">

      {/* Navigation */}
      <Nav1/>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-[220px] sm:auto-rows-[260px]">
          <div className="lg:col-span-2 rounded-3xl overflow-hidden relative group min-h-[420px] sm:min-h-[540px]">
            <Image
              src={images.hero}
              fill
              quality={100}
              priority
              loading="eager"
              sizes="(max-width: 760px) 100vw, 50vw"
              alt="Enterprise office"
              className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-110 transition duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/55 to-black/90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="relative z-10 p-6 sm:p-10 lg:p-14 h-full flex flex-col justify-end">
              <div className="max-w-4xl space-y-4 sm:space-y-6">
                <p className="text-blue-400 text-xs sm:text-sm mb-2 tracking-[0.35em] uppercase font-semibold">
                  Business automated dynamic enterprise
                </p>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] max-w-4xl bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-2xl">
                  Precision systems for modern business velocity.
                </h2>
                <p className="max-w-2xl text-zinc-200 text-sm sm:text-lg lg:text-xl leading-relaxed font-light">
                  Architect scalable automation, operational intelligence, and enterprise-grade workflows with design language built for authority.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-4">
                  <button onClick={()=>redirect('/Pricing')} className="rounded-full bg-white text-zinc-950 px-6 py-3 text-sm font-semibold hover:scale-105 transition">
                    Explore Infrastructure
                  </button>
                  <button  onClick={()=>redirect('/SalesPortal')} className="rounded-full border border-zinc-500/60 backdrop-blur px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition">
                    Sales Portal
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col justify-between">
            <div>
              <p className="text-zinc-400 text-sm uppercase tracking-widest">Performance</p>
              <h3 className="text-5xl font-semibold mt-4">94%</h3>
              <p className="text-zinc-400 mt-2">Operational efficiency increase across integrated enterprise systems.</p>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full mt-6 overflow-hidden">
              <div className="h-full w-[94%] bg-zinc-200 rounded-full" />
            </div>
          </div>

          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6">
            <h3 className="text-xl font-medium mb-4">Infrastructure Intelligence</h3>
            <p className="text-zinc-400 mb-6">
              Adaptive workflow orchestration, analytics, and process synchronization.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-zinc-800 rounded-2xl p-4">Automation</div>
              <div className="bg-zinc-800 rounded-2xl p-4">Data Sync</div>
              <div className="bg-zinc-800 rounded-2xl p-4">Security</div>
              <div className="bg-zinc-800 rounded-2xl p-4">Scale</div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl overflow-hidden relative">
            <Image src={images.dashboard}
              alt="Dashboard"
              fill
              quality={100}
              priority
              loading="eager"
              sizes="(max-width: 760px) 100vw, 50vw"
              className="object-cover" 
            />
            <div className="absolute inset-0 bg-black/55" />
            <div className="relative p-6 sm:p-8 h-full flex flex-col justify-end">
              <h3 className="text-3xl font-semibold">Command Center Visibility</h3>
              <p className="text-zinc-300 mt-3 max-w-lg">
                Unified executive dashboards delivering strategic oversight in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            ["Operational Automation", "Replace fragmented manual systems with coordinated enterprise logic."],
            ["Scalable Architecture", "Infrastructure engineered for global deployment and resilience."],
            ["Executive Control", "Governance-ready systems with measurable strategic outputs."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 hover:border-zinc-700 transition">
              <h3 className="text-2xl font-semibold mb-4">{title}</h3>
              <p className="text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise Section */}
      <section id="enterprise" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative w-full h-[520px] rounded-3xl overflow-hidden">
              <Image
                src={images.team}
                alt="Team collaboration"
                fill
                quality={100}
                priority
                loading="eager"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 sm:p-12 flex flex-col justify-center">
            <p className="uppercase tracking-[0.3em] text-zinc-500 text-sm">Enterprise Design</p>
            <h2 className="text-4xl sm:text-5xl font-semibold mt-4 leading-tight">
              Built for leadership teams demanding execution at scale.
            </h2>
            <p className="text-zinc-400 mt-6 text-lg leading-relaxed">
              From systems modernization to dynamic business orchestration, this platform positions organizations for strategic acceleration.
            </p>
            <button className="mt-8 w-fit rounded-full bg-zinc-100 text-zinc-950 px-6 py-3 font-medium hover:scale-105 transition">
              Request Strategy Session
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="relative border-t border-zinc-800 mt-16 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-2 space-y-5">
              <p className="text-md tracking-[0.35em] uppercase text-blue-400 font-bold">
                Business automated dynamic enterprise
              </p>
              <h3 className="text-3xl sm:text-4xl font-semibold leading-tight max-w-xl">
                Enterprise systems engineered for decisive scale.
              </h3>
              <p className="text-zinc-400 max-w-lg leading-relaxed">
                Subscribe for strategic insights, infrastructure innovation, and operational intelligence designed for modern enterprises.
              </p>

              <form className="max-w-xl pt-2">
                <div className="flex flex-col sm:flex-row rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur overflow-hidden">
                  <input
                    type="email"
                    placeholder="Enter your executive email"
                    className="flex-1 px-5 py-4 bg-transparent text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-4 bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-zinc-300 mb-5">
                Navigation
              </h4>
              <div className="space-y-3 text-zinc-400">
                <Link href="#features" className="block hover:text-white transition">Solutions</Link>
                <Link href="#enterprise" className="block hover:text-white transition">Enterprise</Link>
                <Link href="#contact" className="block hover:text-white transition">Contact</Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-zinc-800">
            <div className="flex gap-4">
              {[
                "Facebook",
                "Twitter",
                "LinkedIn",
                "Instagram",
              ].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="h-11 w-11 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center text-sm text-zinc-400 hover:text-white hover:border-zinc-600 transition"
                >
                  {social.charAt(0)}
                </a>
              ))}
            </div>

            <div className="text-sm text-zinc-500 text-center md:text-right">
              © {new Date().getFullYear()} Business Automated Dynamic Enterprise. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
