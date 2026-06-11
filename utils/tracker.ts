// src/utils/tracker.ts

const generateToken = (): string => {
  return (
    "pt_" +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const startTrackingLifecycle = (onTriggerNudge: () => void) => {
  if (typeof window === "undefined") return;

  // 1. Initialize or pull the permanent anonymous visitor identifier token string
  let visitorToken = localStorage.getItem("paintit_visitor_token");
  if (!visitorToken) {
    visitorToken = generateToken();
    localStorage.setItem("paintit_visitor_token", visitorToken);
  }

  const sessionStartTime = Date.now();
  let nudgeFired = false;

  // 2. Compute timeline update values and post statistics payload profiles to backend
  const sendHeartbeatUpdate = () => {
    const activeDurationSeconds = Math.floor(
      (Date.now() - sessionStartTime) / 1000,
    );

    // Nudge the user with a popup if they spend more than 45 seconds actively on-page
    if (
      activeDurationSeconds >= 45 &&
      !nudgeFired &&
      !localStorage.getItem("paintit_user_identified")
    ) {
      nudgeFired = true;
      onTriggerNudge();
    }

    const payload = JSON.stringify({
      visitorToken,
      duration: activeDurationSeconds,
      currentSection: window.location.hash || "HERO",
      deviceType: window.innerWidth < 768 ? "MOBILE" : "DESKTOP",
    });

    // Use a native fetch call with keepalive: true so the ping completes even if the tab closes
    fetch("http://localhost:5000/api/analytics/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Quietly consume offline exceptions to prevent UI thread execution lockups
    });
  };

  // Run the data reporting pulse loop every 10 seconds
  const heartbeatTimer = setInterval(sendHeartbeatUpdate, 10000);

  // Instantly execute an analytics update pulse when visibility states alter (e.g. tab closed)
  const handleVisibilityAlteration = () => {
    if (document.visibilityState === "hidden") {
      sendHeartbeatUpdate();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityAlteration);

  // Return a clean unmount function to prevent memory leaks across layout render cycles
  return () => {
    clearInterval(heartbeatTimer);
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityAlteration,
    );
  };
};

/**
 * Call this function immediately when a visitor fills out any registration or waitlist form
 */
export const identifyUserSession = async (email: string) => {
  if (typeof window === "undefined") return;
  const visitorToken = localStorage.getItem("paintit_visitor_token");

  if (!visitorToken) return;

  try {
    await fetch("http://localhost:5000/api/analytics/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorToken, email }),
    });
    localStorage.setItem("paintit_user_identified", "true");
  } catch (err) {
    console.error("Unable to submit session integration records:", err);
  }
};
