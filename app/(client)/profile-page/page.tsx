"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import ConfirmModal from "@/components/modals/ConfirmModal";

interface ClientProfileData {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export default function ClientProfilePage() {
  const { accessToken, logout } = useAuth();
  const { showToast } = useAlert();

  // Profile data states
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  // Security passphrase states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmation modal triggers
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successState, setSuccessState] = useState(false);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch basic account information on mount
  useEffect(() => {
    if (!accessToken) return;

    const fetchClientIdentity = async () => {
      try {
        const res = await fetch(`${BACKEND_API_URL}/api/profile/me`, {
          headers: { "Authorization": `Bearer ${accessToken}` }
        });

        if (res.ok) {
          const body = await res.json();
          if (body.profile) {
            setEmail(body.profile.email || "");
            setFullName(body.profile.full_name || "");
          }
        }
      } catch (err) {
        console.error("Failed loading client profile matrix:", err);
      } {
        setIsLoading(false);
      }
    };

    fetchClientIdentity();
  }, [accessToken, BACKEND_API_URL]);

  const handleValidationCheck = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast({ message: "Name field cannot be empty.", severity: "error" });
      return;
    }

    // Passphrase criteria checks
    if (newPassword || confirmPassword || currentPassword) {
      if (newPassword !== confirmPassword) {
        showToast({ message: "Your replacement passwords do not match.", severity: "error" });
        return;
      }
      if (newPassword.length < 6) {
        showToast({ message: "New password must be at least 6 characters long.", severity: "error" });
        return;
      }
      if (!currentPassword) {
        showToast({ message: "Current password is required to verify changes.", severity: "error" });
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
        showToast({ message: data.error || "Failed updating profile settings.", severity: "error" });
        setConfirmOpen(false);
      }
    } catch (err) {
      console.error("Client identity mutation exception dropped:", err);
      showToast({ message: "Network transaction aborted.", severity: "error" });
      setConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3 text-white">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] uppercase font-black tracking-widest text-neutral-600">Opening Personal Portal...</span>
      </div>
    );
  }

  return (
    <div className="w-full text-white space-y-6 max-w-2xl mx-auto md:mx-0 pb-20 select-none animate-fade-in">

      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-5">
        <div>
          <h1 className="text-xl font-black tracking-tight text-neutral-100">My Account Profile</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage your personal verification coordinates and security credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-3.5 py-2 bg-red-950/20 active:bg-red-950/40 border border-red-900/30 text-red-400 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md"
        >
          Logout 👋
        </button>
      </div>

      {/* CORE PROFILE CONFIGURATION CARDS FORMS */}
      <form onSubmit={handleValidationCheck} className="space-y-6">

        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 space-y-4 shadow-2xl">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-900/60 pb-2">
            Identity Profile Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[9px] uppercase font-black tracking-widest text-neutral-600 block pl-0.5">Email Anchor Address</label>
              <div className="w-full px-4 py-3 bg-neutral-900/40 border border-neutral-900 rounded-xl text-xs text-neutral-500 select-all cursor-not-allowed font-medium">
                {email}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-black tracking-widest text-neutral-600 block text-center">Account Tier</label>
              <div className="w-full px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-black uppercase tracking-wider text-center select-none cursor-not-allowed">
                🏡 Homeowner
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block pl-0.5">
              Your Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Adebayo Ibrahim"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors font-medium"
            />
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 space-y-4 shadow-2xl">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-900/60 pb-2">
            Security Passphrase Rotation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block pl-0.5">
                New Passphrase
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors placeholder:text-neutral-700 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block pl-0.5">
                Confirm New Passphrase
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors placeholder:text-neutral-700 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-neutral-900/40">
            <label className="text-[10px] uppercase font-black tracking-wider text-amber-500 font-bold block pl-0.5">
              Verify Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Input your current password to authorize edits..."
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-850 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors placeholder:text-neutral-700 font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg font-black active:scale-[0.99]"
          >
            Update Profile Setup ➔
          </button>
        </div>

      </form>

      {/* CONFIRMATION OVERLAY MODALS SWITCH */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeUpdatePipeline}
        title={successState ? "Changes Saved Successfully" : "Apply Modifications?"}
        message={
          successState
            ? "Your client account metrics and credential parameters have been synchronized with the live server records map."
            : "Are you sure you want to save these modifications to your personal profile configuration?"
        }
        confirmText={isSubmitting ? "Syncing..." : "Apply Updates"}
        cancelText="Cancel Changes"
        isSuccessState={successState}
      />

    </div>
  );
}