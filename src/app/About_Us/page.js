// components/AboutUs.tsx
import {
  Globe,
  Rocket,
  Lightbulb,
  Star,
  CheckCircle2,
  Users,
  Settings,
  Cloud,
  Headphones,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Nav1 from "@/app/Components/Nav1";

export default function AboutUs() {
  return (
    <section className="bg-white text-slate-800">
      <Nav1 />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-indigo-300/90">
              About Us
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              BADE is redefining business operations with intelligent ERP solutions
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
              We are redefining how businesses operate by delivering intelligent,
              scalable, and user-friendly ERP solutions. Our mission is to empower
              organizations to streamline operations, improve efficiency, and unlock
              growth through technology.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28 space-y-28">
        {/* Who We Are – Bento style */}
        <div>
          <div className="mb-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-1.5 text-sm font-medium text-indigo-700">
              <Globe className="h-4 w-4" />
              Who We Are
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Built on innovation, integrity & impact
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-2">
            {/* Large text block */}
            <div className="flex flex-col justify-center rounded-3xl bg-slate-50 p-8 md:col-span-5 md:row-span-2 lg:p-10">
              <p className="text-lg leading-relaxed text-slate-600">
                BADE is a forward-thinking ERP built on innovation,
                integrity, and impact. We bring together a team of engineers,
                designers, and business strategists passionate about solving
                complex challenges with simple, effective solutions.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-white bg-indigo-100"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-500">
                  Engineers · Designers · Strategists
                </span>
              </div>
            </div>

            {/* Large image */}
            <div className="relative overflow-hidden rounded-3xl md:col-span-7 md:row-span-2">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                alt="BADE team collaboration"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* What We Do – Bento Grid */}
        <div>
          <div className="mb-12 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-1.5 text-sm font-medium text-indigo-700">
              <Rocket className="h-4 w-4" />
              What We Do
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Complete ERP solutions that scale with you
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2">
            {/* Large featured card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white sm:col-span-2 lg:col-span-7 lg:row-span-2">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                    <Settings className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold">ERP Solutions</h3>
                  <p className="mt-4 max-w-md text-indigo-100 leading-relaxed">
                    Robust systems that integrate finance, HR, supply chain, sales,
                    and operations into one seamless platform.
                  </p>
                </div>
                <div className="mt-10 flex items-center gap-2 text-sm font-medium text-indigo-200">
                  Explore our platform
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>

            {/* Smaller cards */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-md lg:col-span-5">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Customization</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                Every business is unique. Our solutions are tailored to fit specific
                industry needs.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-md lg:col-span-5">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Cloud className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Cloud & On-Premise</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                Flexible deployment options that scale with your business — wherever
                you are.
              </p>
            </div>
          </div>

          {/* Support card full width under */}
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-7 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div className="flex items-start gap-5">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Support & Training
                </h3>
                <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-slate-600">
                  We don’t just deliver software — we equip your team to maximize its
                  potential with ongoing support and training.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Values – Bento */}
        <div>
          <div className="mb-12 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-1.5 text-sm font-medium text-indigo-700">
              <Lightbulb className="h-4 w-4" />
              Our Values
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              What drives everything we build
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Innovation",
                desc: "Constantly evolving to meet the demands of modern businesses.",
                image:
                  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
              },
              {
                title: "Excellence",
                desc: "Delivering reliable, high-quality solutions that drive measurable results.",
                image:
                  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
              },
              {
                title: "Collaboration",
                desc: "Partnering with clients to co-create solutions that truly fit.",
                image:
                  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80",
              },
              {
                title: "Trust",
                desc: "Building long-term relationships based on transparency and accountability.",
                image:
                  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80",
              },
            ].map((value, index) => (
              <div
                key={value.title}
                className="group relative overflow-hidden rounded-3xl bg-slate-900"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={value.image}
                    alt={value.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="mb-2 block text-xs font-semibold tracking-widest text-indigo-300">
                    0{index + 1}
                  </span>
                  <h3 className="text-xl font-semibold text-white">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {value.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose BADE */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-8 py-14 text-white sm:px-12 lg:px-16 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.2),transparent_60%)]" />

          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-indigo-200 backdrop-blur-sm">
                <Star className="h-4 w-4" />
                Why Choose BADE
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                More than an ERP — a strategic partner
              </h2>
              <p className="mt-5 text-lg text-slate-300">
                With BADE, you gain a partner committed to your success. Our solutions
                help businesses:
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Reduce operational costs",
                  "Improve decision-making with real-time insights",
                  "Enhance productivity through automation",
                  "Scale confidently in competitive markets",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3.5">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
                      <CheckCircle2 className="h-4 w-4 text-indigo-300" />
                    </div>
                    <span className="text-[15px] text-slate-200">{point}</span>
                  </div>
                ))}
              </div>

              <Link
                href="https://wa.me/2347044889034?text=Hello%20BADE%2C%20I%27d%20like%20to%20know%20more%20about%20your%20ERP%20solutions"
                className="group mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-indigo-50"
              >
                Start a conversation
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Side image */}
            <div className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl lg:block">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
                alt="Strategic partnership"
                fill
                className="object-cover"
                sizes="40vw"
              />
              <div className="absolute inset-0 bg-indigo-950/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}