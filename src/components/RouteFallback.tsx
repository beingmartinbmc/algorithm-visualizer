/**
 * Suspense fallback shown while a lazy-loaded route chunk is being fetched.
 * Deliberately understated — most chunks load in well under a frame on
 * fast networks, so a heavy spinner would flash distractingly.
 */
export default function RouteFallback() {
  return (
    <div className="flex flex-1 items-center justify-center" role="status" aria-label="Loading page">
      <div className="flex items-center gap-3 text-slate-500">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-400 [animation-delay:120ms]" />
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-400 [animation-delay:240ms]" />
      </div>
    </div>
  );
}
