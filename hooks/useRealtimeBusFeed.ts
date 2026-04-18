"use client";

import { useEffect } from "react";
import { useBusMateStore } from "@/store/useBusMateStore";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const useRealtimeBusFeed = () => {
  const buses = useBusMateStore((state) => state.buses);
  const updateBusFromFeed = useBusMateStore((state) => state.updateBusFromFeed);
  const setLoadingAdminTable = useBusMateStore((state) => state.setLoadingAdminTable);
  const pushNotification = useBusMateStore((state) => state.pushNotification);
  const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

  useEffect(() => {
    const tableTimer = setTimeout(() => setLoadingAdminTable(false), 1300);
    return () => clearTimeout(tableTimer);
  }, [setLoadingAdminTable]);

  useEffect(() => {
    if (!websocketUrl) {
      const interval = setInterval(() => {
        buses.forEach((bus) => {
          const nextX = clamp(bus.position.x + (Math.random() * 8 - 4), 5, 95);
          const nextY = clamp(bus.position.y + (Math.random() * 8 - 4), 8, 92);
          const nextEta = Math.max(2, bus.eta + Math.floor(Math.random() * 3) - 1);
          updateBusFromFeed(bus.id, {
            eta: nextEta,
            isLive: Math.random() > 0.08,
            position: {
              x: nextX,
              y: nextY,
              lat: bus.position.lat + (Math.random() * 0.0016 - 0.0008),
              lng: bus.position.lng + (Math.random() * 0.0016 - 0.0008),
            },
          });
        });
      }, 2400);
      return () => clearInterval(interval);
    }

    const socket = new WebSocket(websocketUrl);
    socket.addEventListener("open", () =>
      pushNotification("WebSocket connected. Live bus tracking started.", "success"),
    );
    socket.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data);
        const incomingItems = Array.isArray(payload) ? payload : [payload];
        incomingItems.forEach((item) => {
          const busId = item.id ?? item.busId;
          if (!busId) return;
          updateBusFromFeed(busId, item);
        });
      } catch {
        pushNotification("Received malformed live tracking payload.", "error");
      }
    });
    socket.addEventListener("close", () =>
      pushNotification("WebSocket disconnected. Reverting to local simulation.", "warning"),
    );
    socket.addEventListener("error", () => pushNotification("WebSocket connection error.", "error"));
    return () => socket.close();
  }, [buses, pushNotification, updateBusFromFeed, websocketUrl]);
};
