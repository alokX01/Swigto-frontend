export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[var(--color-customer-primary)]/20 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-transparent border-t-[var(--color-customer-primary)] rounded-full absolute top-0 left-0 animate-spin"></div>
        </div>
        <p className="text-[var(--color-customer-text-secondary)] font-medium text-sm tracking-wide">Loading...</p>
      </div>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-[skeleton_1.5s_ease-in-out_infinite] ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}
