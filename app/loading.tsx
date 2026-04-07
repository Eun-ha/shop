export default function Loading() {
  return (
    <main className="min-h-screen bg-background py-12 px-4 text-foreground">
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="mb-8 h-10 w-40 rounded-xl bg-surface-variant" />

        <div className="mb-6 rounded-2xl border border-outline/70 bg-surface p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="h-11 rounded-xl bg-surface-variant" />
            <div className="h-11 rounded-xl bg-surface-variant" />
            <div className="h-11 rounded-xl bg-surface-variant" />
            <div className="h-11 rounded-full bg-surface-variant" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-outline/70 bg-surface p-3">
              <div className="h-60 w-full rounded-xl bg-surface-variant" />
              <div className="mt-3 h-6 w-3/4 rounded bg-surface-variant" />
              <div className="mt-2 h-4 w-full rounded bg-surface-variant" />
              <div className="mt-3 h-5 w-1/3 rounded bg-surface-variant" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
