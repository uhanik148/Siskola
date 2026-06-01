export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-7 w-56 bg-slate-200 rounded-lg mb-2" />
          <div className="h-4 w-72 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-10 w-44 bg-slate-100 rounded-xl" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm border-l-4 border-l-slate-200">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100" />
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded-lg mb-2" />
            <div className="h-4 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-100" />
              <div>
                <div className="h-5 w-36 bg-slate-200 rounded mb-1.5" />
                <div className="h-3.5 w-52 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <div className="w-2 h-2 rounded-full bg-slate-200 mt-2" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-slate-100 rounded mb-2" />
                  <div className="h-3 w-1/3 bg-slate-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <div className="h-5 w-24 bg-slate-200 rounded mb-1.5" />
            <div className="h-3.5 w-32 bg-slate-100 rounded" />
          </div>
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-slate-100" />
                <div className="h-4 w-32 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
