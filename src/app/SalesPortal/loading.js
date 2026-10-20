// Shown while a Sales Portal screen loads: the app frame with grey placeholders.
export default function Loading() {
  return (
    <div className="sales-app min-h-dvh bg-sp-bg" aria-busy="true" aria-label="Loading">
      <div className="sticky top-0 border-b border-sp-line bg-sp-surface">
        <div className="mx-auto flex h-14 max-w-xl items-center gap-3 px-4">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-sp-line" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-32 animate-pulse rounded bg-sp-line" />
            <div className="h-2.5 w-20 animate-pulse rounded bg-sp-line" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-xl space-y-3 px-4 pt-4">
        <div className="h-12 animate-pulse rounded-xl bg-sp-surface ring-1 ring-sp-line" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl bg-sp-surface p-4 ring-1 ring-sp-line">
            <div className="h-11 w-11 animate-pulse rounded-xl bg-sp-line" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/5 animate-pulse rounded bg-sp-line" />
              <div className="h-2.5 w-2/5 animate-pulse rounded bg-sp-line" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
