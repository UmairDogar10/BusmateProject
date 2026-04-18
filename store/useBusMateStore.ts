"use client";

import { create } from "zustand";
import { initialBuses } from "@/data/mockData";
import type { Bus, BusNotification, NotificationType } from "@/types/busmate";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type BusMateState = {
  buses: Bus[];
  notifications: BusNotification[];
  driverTripActive: boolean;
  gpsActive: boolean;
  loadingAdminTable: boolean;
  setLoadingAdminTable: (value: boolean) => void;
  startTrip: () => void;
  endTrip: () => void;
  setGpsActive: (value: boolean) => void;
  updateSeatAvailability: (busId: string, seats: number) => void;
  updateBusFromFeed: (busId: string, payload: Partial<Bus>) => void;
  pushNotification: (message: string, type?: NotificationType) => void;
  dismissNotification: (id: string) => void;
};

export const useBusMateStore = create<BusMateState>((set) => ({
  buses: initialBuses,
  notifications: [],
  driverTripActive: false,
  gpsActive: true,
  loadingAdminTable: true,
  setLoadingAdminTable: (value) => set({ loadingAdminTable: value }),
  startTrip: () => set({ driverTripActive: true }),
  endTrip: () => set({ driverTripActive: false }),
  setGpsActive: (value) => set({ gpsActive: value }),
  updateSeatAvailability: (busId, seats) =>
    set((state) => ({
      buses: state.buses.map((bus) =>
        bus.id === busId
          ? { ...bus, seatsAvailable: clamp(seats, 0, 40) }
          : bus,
      ),
    })),
  updateBusFromFeed: (busId, payload) =>
    set((state) => ({
      buses: state.buses.map((bus) =>
        bus.id === busId ? { ...bus, ...payload } : bus,
      ),
    })),
  pushNotification: (message, type = "info") =>
    set((state) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? (crypto as { randomUUID: () => string }).randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

      return {
        notifications: [
          { id, message, type, createdAt: Date.now() },
          ...state.notifications,
        ].slice(0, 5),
      };
    }),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((item) => item.id !== id),
    })),
}));
