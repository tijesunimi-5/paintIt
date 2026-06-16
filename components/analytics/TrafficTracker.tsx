// components/analytics/TrafficTracker.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function TrafficTracker() {
  const pathname = usePathname();
  const currentSectionRef = useRef<string>("HERO");
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 📡 Heartbeat Interval Tracker Loop
  useEffect(() => {
    let visitorToken = localStorage.getItem("paintit_visitor_session_token");
    if (!visitorToken) {
      visitorToken = "vt_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem("paintit_visitor_session_token", visitorToken);
    }

    let runningDuration = 0;

    const heartbeatTimer = setInterval(() => {
      runningDuration += 10; // Runs update events every 10 seconds

      fetch(`${BACKEND_URL}/api/analytics/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorToken,
          duration: runningDuration,
          currentSection: currentSectionRef.current,
          deviceType: window.innerWidth < 768 ? "MOBILE" : "DESKTOP"
        })
      }).catch(() => null);
    }, 10000);

    return () => clearInterval(heartbeatTimer);
  }, [BACKEND_URL]);

  // 🗺️ Absolute Route Path Tracker Loop
  // Inside components/analytics/TrafficTracker.tsx
// Replace your second useEffect loop with this session-guarded engine:

useEffect(() => {
  if (!pathname) return;

  let visitorToken = localStorage.getItem("paintit_visitor_session_token");
  if (!visitorToken) {
    visitorToken = "vt_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem("paintit_visitor_session_token", visitorToken);
  }

  let trackingType = "platform_landing";
  let painterId: string | null = null;

  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments[0] === "painter" && pathSegments[1]) {
    painterId = pathSegments[1];
    trackingType = "profile_view";

    if (pathSegments[2] === "designs") {
      trackingType = "design_view";
    }
  }

  // ✅ CACHE BLOCKER: Formulate a unique storage tracking key identifier string
  const sessionTrackingKey = `tracked_${trackingType}_${painterId || "platform"}`;
  const alreadyTrackedInThisSession = sessionStorage.getItem(sessionTrackingKey);

  const startTime = Date.now();

  // 🚀 ONLY SEND PIN IF NOT TRACKED IN THIS SESSION BLOCK
  if (!alreadyTrackedInThisSession) {
    fetch(`${BACKEND_URL}/api/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pagePath: pathname,
        type: trackingType,
        painterId,
        visitorToken,
        isExitEvent: false
      })
    })
    .then(() => {
      // Set the session lock so refreshing doesn't duplicate pings o!
      sessionStorage.setItem(sessionTrackingKey, "true");
    })
    .catch(() => null);
  }

  // Log Page Exit Lifespans (Keep duration calculator tracking active for your admin logs!)
  return () => {
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const exitPayload = JSON.stringify({
      pagePath: pathname,
      type: trackingType,
      painterId,
      visitorToken,
      durationSeconds,
      isExitEvent: true
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${BACKEND_URL}/api/analytics/track`, new Blob([exitPayload], { type: "application/json" }));
    } else {
      fetch(`${BACKEND_URL}/api/analytics/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: exitPayload,
        keepalive: true
      }).catch(() => null);
    }
  };
}, [pathname, BACKEND_URL]);

  return null;
}