import Link from "next/link";

// Shown for any URL that doesn't exist, and wherever a page calls notFound().
// Next sends the 404 status and a noindex robots tag for it on its own.
export const metadata = {
  title: "Page not found",
  description: "We couldn't find the page you were looking for.",
};

// The illustration's own background, so the image sits on the page without a visible edge.
const PAPER = "#E9E6E0";

export default function NotFound() {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center"
      style={{ backgroundColor: PAPER }}
    >
      <picture className="block w-full max-w-2xl">
        {/* still frame for people who turned off animation */}
        <source srcSet="/404-binoculars.png" media="(prefers-reduced-motion: reduce)" />
        {/* plain <img>: next/image would re-encode the animated GIF */}
        <img
          src="/404-binoculars.gif"
          alt="Binoculars looking out over a sunset sea with a bird flying past"
          width={1008}
          height={606}
          className="h-auto w-full"
        />
      </picture>

      <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[#3F7A55]">
        Error 404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
        Nothing in sight
      </h1>
      <p className="mt-4 max-w-md text-base text-neutral-600 sm:text-lg">
        We looked everywhere, but this page isn&apos;t here. It may have moved, or the link may be
        mistyped.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-full bg-[#3F7A55] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#33664A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F7A55]"
        >
          Back to home
        </Link>
        <Link
          href="/Login"
          className="rounded-full border border-neutral-900/15 bg-white/60 px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          Log in to your account
        </Link>
      </div>

      <p className="mt-6 text-sm text-neutral-500">
        Looking for plans?{" "}
        <Link href="/Pricing" className="font-medium text-[#3F7A55] underline underline-offset-4">
          See pricing
        </Link>
      </p>
    </main>
  );
}
