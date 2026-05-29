function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`shimmer rounded-2xl border border-mint-100/30 ${className}`} />
  );
}

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-3xl border border-mint-100 bg-white p-5 shadow-sm">
          <SkeletonBlock className="aspect-square w-full" />
          <SkeletonBlock className="mt-4 h-3 w-16" />
          <SkeletonBlock className="mt-3 h-4 w-full" />
          <SkeletonBlock className="mt-2 h-4 w-2/3" />
          <div className="mt-5 flex items-end justify-between">
            <SkeletonBlock className="h-6 w-20" />
            <SkeletonBlock className="h-9 w-9 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div className="max-w-[1180px] mx-auto px-4 md:px-0 py-8 min-h-[75vh]">
      <div className="bg-white rounded-3xl p-6 mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-16 w-16 rounded-full" />
          <div>
            <SkeletonBlock className="h-6 w-40" />
            <SkeletonBlock className="mt-2 h-4 w-28" />
          </div>
        </div>
        <SkeletonBlock className="h-11 w-28 rounded-full" />
      </div>
      <div className="bg-white rounded-2xl mb-8 p-2 flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-11 w-36 rounded-xl" />
        ))}
      </div>
      <div className="bg-white rounded-3xl p-6 md:p-8">
        <SkeletonBlock className="h-7 w-52" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SkeletonBlock className="aspect-square w-full" />
          <SkeletonBlock className="aspect-square w-full" />
        </div>
      </div>
    </div>
  );
}

export default function PageSkeleton({ variant = "default" }: { variant?: "default" | "home" | "product" | "account" | "checkout" }) {
  if (variant === "account") return <AccountSkeleton />;

  if (variant === "product") {
    return (
      <div className="max-w-[1180px] mx-auto px-4 md:px-0 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <SkeletonBlock className="aspect-square w-full rounded-3xl" />
            <div className="mt-4 flex gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-20 w-20 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 md:p-8">
            <SkeletonBlock className="h-5 w-28 rounded-full" />
            <SkeletonBlock className="mt-5 h-10 w-4/5" />
            <SkeletonBlock className="mt-3 h-10 w-2/3" />
            <SkeletonBlock className="mt-6 h-12 w-40" />
            <SkeletonBlock className="mt-6 h-24 w-full" />
            <div className="mt-7 flex gap-4">
              <SkeletonBlock className="h-12 w-32" />
              <SkeletonBlock className="h-12 flex-1" />
              <SkeletonBlock className="h-12 w-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "checkout") {
    return (
      <div className="max-w-[1180px] mx-auto px-4 md:px-0 py-8">
        <SkeletonBlock className="mb-8 h-9 w-44" />
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-6">
            <SkeletonBlock className="h-80 w-full rounded-3xl" />
            <SkeletonBlock className="h-72 w-full rounded-3xl" />
          </div>
          <SkeletonBlock className="h-[430px] w-full rounded-3xl lg:w-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1180px] mx-auto px-4 md:px-0 py-8 pb-24">
      {variant === "home" ? (
        <div className="flex flex-col gap-6 md:flex-row">
          <SkeletonBlock className="min-h-[400px] flex-1 rounded-3xl" />
          <SkeletonBlock className="h-72 w-full rounded-3xl md:h-auto md:w-72" />
        </div>
      ) : (
        <div className="mb-10">
          <SkeletonBlock className="h-8 w-56" />
          <SkeletonBlock className="mt-3 h-4 w-80 max-w-full" />
        </div>
      )}

      <div className="mt-12 flex items-end justify-between gap-4">
        <div>
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="mt-3 h-8 w-64 max-w-full" />
        </div>
        <SkeletonBlock className="hidden h-10 w-28 sm:block" />
      </div>
      <div className="mt-6">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
