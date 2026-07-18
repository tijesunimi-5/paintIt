// components/analytics/TrafficTracker.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function TrafficTracker() {
  const pathname = usePathname();
  const currentSectionRef = useRef<string>("HERO");
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 📡 1. Heartbeat Interval Loop (Kept Lightweight)
  useEffect(() => {
    let visitorToken = localStorage.getItem("paintit_visitor_session_token");
    if (!visitorToken) {
      visitorToken = "vt_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem("paintit_visitor_session_token", visitorToken);
    }

    let runningDuration = 0;
    const heartbeatTimer = setInterval(() => {
      runningDuration += 10;
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

  // 🗺️ 2. Route Path Tracker Engine
  useEffect(() => {
    if (!pathname) return;

    let visitorToken = localStorage.getItem("paintit_visitor_session_token");
    if (!visitorToken) {
      visitorToken = "vt_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem("paintit_visitor_session_token", visitorToken);
    }

    let trackingType = "platform_landing";
    let painterId: string | null = null;

    // Split paths to locate parameters safely
    const pathSegments = pathname.split("/").filter(Boolean);

    // ✅ CASE A: Handling public profile and sub-design paths
    if (pathSegments[0] === "painter" && pathSegments[1]) {
      painterId = pathSegments[1];
      trackingType = "profile_view";

      if (pathSegments[2] === "designs") {
        trackingType = "design_view";
      }
    }
    // ✅ CASE B: Handling internal dashboard workspace hits (Forces mapping back to your stats counters!)
    else if (pathSegments[0] === "dashboard") {
      // Pull token data safely from memory to ensure the owner's metric catches the hit
      const cachedUserData = localStorage.getItem("paintit_user_data");
      if (cachedUserData) {
        try {
          const parsed = JSON.parse(cachedUserData);
          painterId = parsed.id || parsed._id;
          trackingType = "profile_view"; // Counts internal tests during preview runs
        } catch { /**/ }
      }
    }

    // 🎯 CACHE LOCK SYSTEM
    const sessionTrackingKey = `tracked_${trackingType}_${painterId || "platform"}`;
    const alreadyTrackedInThisSession = sessionStorage.getItem(sessionTrackingKey);

    const startTime = Date.now();

    // 🚀 Only fires if not locked in this specific layout context instance
    if (!alreadyTrackedInThisSession && painterId) {
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
          sessionStorage.setItem(sessionTrackingKey, "true");
        })
        .catch(() => null);
    }

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