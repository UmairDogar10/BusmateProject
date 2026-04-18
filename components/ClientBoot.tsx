"use client";

import { useFcmNotifications } from "@/hooks/useFcmNotifications";
import { useRealtimeBusFeed } from "@/hooks/useRealtimeBusFeed";

export function ClientBoot() {
  useRealtimeBusFeed();
  useFcmNotifications();
  return null;
}
