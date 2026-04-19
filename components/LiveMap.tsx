"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Bus } from "@/types/busmate";

const ClientMap = dynamic(() => import("@/components/MapComponent").then((mod) => mod.MapComponent), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] items-center justify-center rounded-2xl bg-slate-100">
      <div className="h-24 w-[90%] animate-pulse rounded-2xl bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" />
    </div>
  ),
});

export function LiveMap({ buses }: { buses: Bus[] }) {
  const gpsBuses = useMemo(
    () => buses.filter((b) => b.isGpsActive === true),
    [buses],
  );
  const anyGpsSharing = buses.some((b) => b.isGpsActive === true);

  return (
    <div className="relative">
      <ClientMap buses={gpsBuses} />
      {!anyGpsSharing && (
        <div className="pointer-events-none absolute inset-0 z-[500] flex items-end justify-center pb-4">
          <p className="max-w-sm rounded-2xl border border-amber-200/90 bg-amber-50/95 px-4 py-2.5 text-center text-xs font-medium text-amber-950 shadow-md backdrop-blur-sm">
            No buses are currently sharing live location.
          </p>
        </div>
      )}
    </div>
  );
}
