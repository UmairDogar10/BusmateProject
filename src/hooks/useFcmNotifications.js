import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { useBusMateStore } from "../store/useBusMateStore";
import { env, hasFirebaseMessagingConfig } from "../lib/env";
import { getFirebaseMessaging } from "../lib/firebase";

export const useFcmNotifications = () => {
  const pushNotification = useBusMateStore((state) => state.pushNotification);

  useEffect(() => {
    let unsubscribe = () => {};

    const setupMessaging = async () => {
      if (!hasFirebaseMessagingConfig || !("Notification" in window)) {
        return;
      }

      const permission = await Notification.requestPermission().catch(() => "default");
      if (permission !== "granted") {
        pushNotification("Notification permission not granted.", "warning");
        return;
      }

      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        pushNotification("Firebase messaging is not supported in this browser.", "warning");
        return;
      }

      try {
        await getToken(messaging, {
          vapidKey: env.firebaseVapidKey || undefined,
          serviceWorkerRegistration: await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
          ),
        });
      } catch {
        pushNotification("Unable to register device for push notifications.", "error");
      }

      unsubscribe = onMessage(messaging, (payload) => {
        const message =
          payload.notification?.body ??
          payload.data?.message ??
          "New BusMate notification received.";
        const type = payload.data?.type ?? "info";
        pushNotification(message, type);
      });
    };

    setupMessaging();

    return () => {
      unsubscribe();
    };
  }, [pushNotification]);
};
