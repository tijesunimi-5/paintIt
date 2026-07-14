// app/ServiceWorkerRegisterEngine.tsx
"use client";

import { useEffect } from "react";

export function ServiceWorkerRegisterEngine() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (
      "serviceWorker" in navigator &&
      (window.location.protocol === "https:" ||
        window.location.hostname === "localhost")
    ) {
      const registerWorker = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) =>
            console.log("🛡️ PaintIt Service Worker Online:", reg.scope),
          )
          .catch((err) =>
            console.warn("❌ Service Worker Registration Aborted:", err),
          );
      };

      // If document is already complete, fire immediately; otherwise wait for load event
      if (document.readyState === "complete") {
        registerWorker();
      } else {
        window.addEventListener("load", registerWorker);
        return () => window.removeEventListener("load", registerWorker);
      }
    }
  }, []);

  return null;
}
