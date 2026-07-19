"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useRequireAuth() {
  const router = useRouter();
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const BACKEND_API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const runStrictTokenHeartbeat = async () => {
      if (typeof window === "undefined") return;

      const activeToken =
        localStorage.getItem("paintit_access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      if (!activeToken) {
        console.warn(
          "🔒 No valid security payload detected. Evicting to login.",
        );
        router.push("/login");
        return;
      }

      try {
        const check = await fetch(
          `${BACKEND_API_URL}/api/profile/verify-session`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${activeToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (check.ok) {
          setIsValidated(true);
        } else {
          // Token is dead or tampered with
          localStorage.removeItem("paintit_access_token");
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (err) {
        // Handle connectivity drop gracefully, but let user stand if token exists
        console.error(
          "Auth verification heartbeat failed offline fallback context:",
          err,
        );
        setIsValidated(true);
      }
    };

    runStrictTokenHeartbeat();
  }, [router, BACKEND_API_URL]);

  return isValidated;
}
