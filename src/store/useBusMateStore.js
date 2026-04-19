import { create } from "zustand";
import { initialBuses } from "../data/mockData";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const useBusMateStore = create((set) => ({
  buses: initialBuses,
  notifications: [],
  driverTripActive: false,
  loadingAdminTable: true,
  setLoadingAdminTable: (value) => set({ loadingAdminTable: value }),
  startTrip: () => set({ driverTripActive: true }),
  endTrip: () => set({ driverTripActive: false }),
  updateSeatAvailability: (busId, seats) =>
    set((state) => ({
      buses: state.buses.map((bus) =>
        bus.id === busId ? { ...bus, seatsAvailable: clamp(seats, 0, 40) } : bus,
      ),
    })),
  updateBusFromFeed: (busId, payload) =>
    set((state) => ({
      buses: state.buses.map((bus) =>
        bus.id === busId
          ? {
              ...bus,
              eta: payload.eta ?? bus.eta,
              isLive: payload.isLive ?? bus.isLive,
              isGpsActive:
                typeof payload.isGpsActive === "boolean" ? payload.isGpsActive : bus.isGpsActive,
              position: payload.position ?? bus.position,
            }
          : bus,
      ),
    })),
  pushNotification: (message, type = "info") =>
    set((state) => ({
      notifications: [
        { id: crypto.randomUUID(), message, type, createdAt: Date.now() },
        ...state.notifications,
      ].slice(0, 15),
    })),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((item) => item.id !== id),
    })),
  clearAllNotifications: () => set({ notifications: [] }),
}));
