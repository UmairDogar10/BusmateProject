"use client";

import { useEffect, useRef } from "react";
import { useBusMateStore } from "@/store/useBusMateStore";
import type { Bus } from "@/types/busmate";

const SIGNIFICANT_ETA_INCREASE_MIN = 5;

function normalizeSeats(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  return 0;
}

export type StudentRouteRow = {
  id: string;
  name: string;
  tripInProgress: boolean;
  seatsAvailable: number;
  eta?: number;
};

type PrevRow = { trip: boolean; eta?: number; seats: number };

/**
 * Pushes in-app notifications only on meaningful fleet events (trip start,
 * notable ETA increase while active, bus becoming full).
 */
export function useStudentLiveNotifications(
  routes: StudentRouteRow[],
  buses: Bus[],
  liveSeatsByRouteId: Map<string, number>,
) {
  const pushNotification = useBusMateStore((state) => state.pushNotification);
  const prevByRoute = useRef<Record<string, PrevRow>>({});
  const primed = useRef(false);

  useEffect(() => {
    const tripLiveForRoute = (routeId: string, routeTripFlag: boolean) => {
      if (routeTripFlag) return true;
      const b = buses.find((bus) => bus.routeId === routeId);
      return Boolean(b?.isLive);
    };

    const etaForRoute = (route: StudentRouteRow) => {
      const fromBus = buses.find((bus) => bus.routeId === route.id);
      if (fromBus && typeof fromBus.eta === "number" && Number.isFinite(fromBus.eta)) {
        return fromBus.eta;
      }
      return route.eta;
    };

    const seatsForRoute = (route: StudentRouteRow) => {
      const live = liveSeatsByRouteId.get(route.id);
      const merged = live !== undefined ? live : route.seatsAvailable;
      return normalizeSeats(merged ?? 0);
    };

    const nextSnapshot: Record<string, PrevRow> = {};

    for (const route of routes) {
      const trip = tripLiveForRoute(route.id, route.tripInProgress);
      const eta = etaForRoute(route);
      const seats = seatsForRoute(route);
      nextSnapshot[route.id] = { trip, eta, seats };

      if (!primed.current) continue;

      const prev = prevByRoute.current[route.id];
      if (!prev) continue;

      if (trip && !prev.trip) {
        pushNotification(
          `${route.name} is now live and on its way.`,
          "success",
        );
      }

      if (trip && prev.trip) {
        const prevEta = prev.eta;
        if (
          typeof eta === "number" &&
          typeof prevEta === "number" &&
          eta - prevEta >= SIGNIFICANT_ETA_INCREASE_MIN
        ) {
          pushNotification(
            `${route.name}: ETA updated — now about ${eta} min (significant delay).`,
            "warning",
          );
        }
      }

      if (seats === 0 && prev.seats > 0) {
        pushNotification(`${route.name} is currently full.`, "warning");
      }
    }

    prevByRoute.current = nextSnapshot;
    primed.current = true;
  }, [routes, buses, liveSeatsByRouteId, pushNotification]);
}
