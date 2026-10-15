export const metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function Offline() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">You&apos;re offline</h1>
      <p className="max-w-sm text-gray-600">
        B.A.D.E can&apos;t reach the network right now. Check your connection and try again.
      </p>
    </main>
  );
}
