export default function SettingsLoading() {
  return (
    <div className="p-6 lg:p-8 animate-pulse">
      <div className="mb-8">
        <div className="h-8 w-32 rounded bg-muted" />
        <div className="mt-2 h-4 w-48 rounded bg-muted" />
      </div>

      <div className="max-w-2xl space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6">
            <div className="h-5 w-36 rounded bg-muted" />
            <div className="mt-4 h-10 w-full rounded bg-muted" />
            <div className="mt-3 h-4 w-48 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
