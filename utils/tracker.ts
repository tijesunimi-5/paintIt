// src/utils/tracker.ts

// Generates a lightweight unique identification token string natively
const generateUUID = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const initializeTracker = (onTriggerNudge: () => void) => {
  if (typeof window === "undefined") return;

  // 1. Fetch or initialize the visitor identifier string
  let visitorToken = localStorage.getItem("paintit_visitor");
  if (!visitorToken) {
    visitorToken = "anon_" + generateUUID();
    localStorage.setItem("paintit_visitor", visitorToken);
  }

  const startTime = Date.now();
  // let maxTimeObserved = 0;
  let nudgeTriggered = false;

  // 2. Continuous time counter loop logic
  const trackHeartbeat = async () => {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

    // Nudge the user to drop their email if they stay active for over 60 seconds
    if (
      elapsedSeconds >= 60 &&
      !nudgeTriggered &&
      !localStorage.getItem("paintit_identified")
    ) {
      nudgeTriggered = true;
      onTriggerNudge();
    }

    try {
      // Send tracking update payload silently using standard fetch API layers
      await fetch("http://localhost:5000/api/analytics/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorToken,
          duration: elapsedSeconds,
          currentSection: window.location.hash || "HERO",
          deviceType: window.innerWidth < 768 ? "MOBILE" : "DESKTOP",
        }),
        keepalive: true, // Crucial: Allows the request to succeed even if the tab closes!
      });
    } catch (err) {
      // Quietly swallow network failures to prevent UI disruption
    }
  };

  // Run heartbeat ping every 10 seconds while the page remains active
  const intervalId = setInterval(trackHeartbeat, 10000);

  // Send a final update when the user closes the window or navigates away
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      trackHeartbeat();
    }
  });

  return () => clearInterval(intervalId);
};
