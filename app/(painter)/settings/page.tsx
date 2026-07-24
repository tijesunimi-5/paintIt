// app/(painter)/dashboard/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import ConfirmModal from "@/components/modals/ConfirmModal";

export default function PainterAccountSettingsPage() {
  const { accessToken } = useAuth();
  const { showToast } = useAlert();

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");

  // Security Credentials Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State Triggers
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successState, setSuccessState] = useState(false);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Bootstrap active profile values on component lifecycle initialization
  useEffect(() => {
    if (!accessToken) return;

    const fetchCurrentIdentityContext = async () => {
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/profile/me`, {
          headers: { "Authorization": `Bearer ${accessToken}` }
        });
        if (res.ok) {
          const body = await res.json();
          if (body.profile) {
            setFullName(body.profile.full_name || "");
            setLocation(body.profile.location || "");
          }
        }
      } catch (err) {
        console.error("Failed loading current account variables:", err);
      }
    };

    fetchCurrentIdentityContext();
  }, [accessToken, BACKEND_API_URL]);

  const validateAndPromptConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword || confirmPassword || currentPassword) {
      if (newPassword !== confirmPassword) {
        showToast({ message: "New password fields do not match.", severity: "error" });
        return;
      }
      if (newPassword.length < 6) {
        showToast({ message: "New password must be at least 6 characters long.", severity: "error" });
        return;
      }
      if (!currentPassword) {
        showToast({ message: "Please input your current password to authorize security changes.", severity: "error" });
        return;
      }
    }

    setSuccessState(false);
    setConfirmOpen(true);
  };

  const executeUpdatePipeline = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/update-account`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          location,
          currentPassword: currentPassword || null,
          newPassword: newPassword || null
        })
      });

      if (response.ok) {
        setSuccessState(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          setConfirmOpen(false);
        }, 1500);
      } else {
        const data = await response.json();
        showToast({ message: data.error || "Failed updating account parameters.", severity: "error" });
        setConfirmOpen(false);
      }
    } catch (err) {
      console.error("Update request transaction dropped:", err);
      showToast({ message: "Network connection error.", severity: "error" });
      setConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full text-white space-y-8 animate-fade-in pb-16 selection:bg-emerald-500 selection:text-black">

      {/* HEADER ROW BAR CONTAINER */}
      <div className="border-b border-neutral-900 pb-5">
        <h1 className="text-xl font-black uppercase tracking-tight text-neutral-100">Account Settings</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Modify your studio branding metadata credentials and keep your entry access codes secure.
        </p>
      </div>

      <form onSubmit={validateAndPromptConfirm} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">

        {/* LEFT COLUMN: PUBLIC STUDIO BRANDING METADATA */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-900/60 pb-2">
            Studio Profile Details
          </h3>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-500 block pl-0.5">
              Full Branding Contractor Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Samuel Tijesunimi"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-500 block pl-0.5">
              Operating Location Area
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Ibadan, Nigeria"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors font-medium"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: RE-HASH CREDENTIAL MANAGEMENT DECK */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-900/60 pb-2">
            Update Security Passphrase
          </h3>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-500 block pl-0.5">
              New Password Choice
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-500 block pl-0.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors font-medium"
            />
          </div>

          <div className="space-y-1.5 pt-2 border-t border-neutral-900/40">
            <label className="text-[10px] uppercase font-black tracking-wider text-amber-500 font-bold block pl-0.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Required to commit updates..."
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-850 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors font-medium"
            />
          </div>
        </div>

        {/* BOTTOM GLOBAL ACTION BUTTON CONTAINER */}
        <div className="md:col-span-2 flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center"
          >
            Save Account Settings ➔
          </button>
        </div>

      </form>

      {/* PORTAL MODAL INTEGRATION COMPONENT */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeUpdatePipeline}
        title={successState ? "Settings Saved Successfully" : "Commit Profile Changes?"}
        message={
          successState
            ? "Your identity modifications and password hashes were successfully compiled into our live production indices files."
            : "Are you sure you want to write these modifications into your active account database variables profile?"
        }
        confirmText={isSubmitting ? "Updating..." : "Confirm Save"}
        cancelText="Cancel"
        isSuccessState={successState}
      />

    </div>
  );
}