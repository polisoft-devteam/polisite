// Shown while a member page fetches. Without it the browser sits on the old page and the
// click appears to have done nothing.

export default function MemberPageLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <div className="flex items-start gap-4">
        <div className="bg-muted size-16 animate-pulse rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="bg-muted h-7 w-48 animate-pulse rounded" />
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
        </div>
      </div>

      <div className="bg-muted mt-6 h-4 w-full max-w-md animate-pulse rounded" />

      <div className="mt-12 space-y-4">
        <div className="bg-muted h-6 w-40 animate-pulse rounded" />
        <div className="bg-muted h-20 w-full animate-pulse rounded-lg" />
      </div>
    </div>
  )
}
