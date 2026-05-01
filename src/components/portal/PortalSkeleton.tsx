import { cn } from "@/lib/utils";

const Pulse = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded bg-muted", className)} />
);

export const StatCardSkeleton = () => (
  <div className="glass rounded-xl p-5 space-y-3">
    <div className="flex items-center justify-between">
      <Pulse className="h-3 w-24" />
      <Pulse className="h-4 w-4 rounded" />
    </div>
    <Pulse className="h-8 w-20" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass rounded-xl p-5 space-y-3">
    <Pulse className="h-4 w-32 mb-4" />
    <Pulse className="h-[180px] w-full rounded-lg" />
  </div>
);

export const CardRowSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="glass rounded-xl p-4 flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Pulse className="h-4 w-40" />
          <Pulse className="h-3 w-60" />
        </div>
        <Pulse className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

export const ProjectCardSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="grid gap-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Pulse className="h-5 w-48" />
            <Pulse className="h-3 w-72" />
          </div>
          <Pulse className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <Pulse className="h-2 flex-1 rounded-full" />
          <Pulse className="h-3 w-8" />
        </div>
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8">
    <div className="space-y-1">
      <Pulse className="h-7 w-48" />
      <Pulse className="h-4 w-64" />
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
    <div className="grid lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => <ChartSkeleton key={i} />)}
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <CardRowSkeleton rows={4} />
      <CardRowSkeleton rows={4} />
    </div>
  </div>
);

export const ChatSkeleton = () => (
  <div className="flex flex-col gap-3 p-4">
    {[false, true, false, false, true].map((own, i) => (
      <div key={i} className={`max-w-[70%] ${own ? "self-end" : "self-start"}`}>
        <Pulse className={`h-10 rounded-xl ${own ? "w-40" : "w-56"}`} />
      </div>
    ))}
  </div>
);

export const TimelineSkeleton = () => (
  <div className="relative space-y-4 pl-2">
    <div className="absolute left-5 top-0 bottom-0 w-px bg-muted" />
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <Pulse className="z-10 shrink-0 w-7 h-7 rounded-full" />
        <div className="glass rounded-xl flex-1 p-4 space-y-2">
          <Pulse className="h-4 w-32" />
          <Pulse className="h-3 w-20" />
        </div>
      </div>
    ))}
  </div>
);
