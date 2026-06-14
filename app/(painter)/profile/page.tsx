// app/(painter)/dashboard/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { InfoTooltip } from "@/components/ui/InfoToolTip";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "painter" | "client";
  is_verified: boolean;
  created_at: string;
  bio: string | null;
  phone_number: string | null;
  location: string | null;
  experience_years: number;
  skills: string[];
}

export default function AccountProfileWorkspacePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [skillsInput, setSkillsInput] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  // ==========================================================
  // 🔄 HYDRATE PROFILE DATA VIA SQL JOIN ENDPOINT
  // ==========================================================
  useEffect(() => {
    const fetchActiveProfileSettings = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/profile/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("paintit_access_token")}`,
          },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load account settings.");

        if (data.profile) {
          const p = data.profile as UserProfile;
          setProfile(p);
          setFullName(p.full_name || "");
          setBio(p.bio || "");
          setPhoneNumber(p.phone_number || "");
          setLocation(p.location || "Ibadan, Nigeria");
          setExperienceYears(p.experience_years || 0);
          setSkillsInput(p.skills?.join(", ") || "");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Profile synchronization dropped.";
        setFeedbackBanner({ type: "error", msg });
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveProfileSettings();
  }, [BACKEND_URL]);

  // ==========================================================
  // 💾 SAVE MUTATED RE-CONFIGURATIONS (UPSERT EXECUTOR)
  // ==========================================================
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackBanner(null);

    const parsedSkills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const response = await fetch(`${BACKEND_URL}/api/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("paintit_access_token")}`,
        },
        body: JSON.stringify({
          bio: bio, // Passes raw string state natively (empty fields go as "")
          phoneNumber: phoneNumber || null,
          location: location || null,
          experienceYears: Number(experienceYears) || 0,
          skills: parsedSkills,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // ✅ UI CLARITY FIX: If the backend returns explicit Zod details, display them directly to the user!
        if (data.details && Array.isArray(data.details)) {
          throw new Error(`Validation Error: ${data.details.join(" | ")}`);
        }
        throw new Error(data.error || "Failed to update profile matrix.");
      }

      setFeedbackBanner({ type: "success", msg: "Profile credentials synchronized successfully o!" });

      if (data.profile) {
        setProfile((prev) => prev ? { ...prev, ...data.profile } : null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected execution error occurred.";
      setFeedbackBanner({ type: "error", msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3 text-white">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] uppercase font-black tracking-widest text-neutral-600">Hydrating Profile Fields...</span>
      </div>
    );
  }

  return (
    <div className="w-full text-white space-y-6 max-w-2xl mx-auto md:mx-0">

      {/* Page Title Context Node */}
      <div className="border-b border-neutral-900 pb-5">
        <h1 className="text-xl font-black tracking-tight text-neutral-100">Account Master Settings</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Configure public biography descriptions, experience fields, and core communication channels.
        </p>
      </div>

      {feedbackBanner && (
        <div className={`p-3.5 text-xs rounded-xl border font-medium ${feedbackBanner.type === "success"
            ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
            : "bg-red-950/20 border-red-900/40 text-red-400"
          }`}>
          {feedbackBanner.type === "success" ? "✅" : "⚠️"} {feedbackBanner.msg}
        </div>
      )}

      <form onSubmit={handleProfileSave} className="space-y-5 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-2xl">

        {/* Read-Only Grid Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-[9px] uppercase font-black tracking-widest text-neutral-600 block mb-1.5">Email Route Anchor</label>
            <div className="w-full px-4 py-3 bg-neutral-900/40 border border-neutral-900 rounded-xl text-xs text-neutral-500 select-all cursor-not-allowed">
              {profile?.email}
            </div>
          </div>
          <div>
            <label className="text-[9px] uppercase font-black tracking-widest text-neutral-600 block mb-1.5">Workspace Role</label>
            <div className="w-full px-4 py-3 bg-neutral-900/40 border border-neutral-900 rounded-xl text-xs text-emerald-500/70 font-bold uppercase tracking-wider text-center select-none cursor-not-allowed">
              🛡️ {profile?.role === "painter" ? "Contractor" : "Homeowner"}
            </div>
          </div>
        </div>

        {/* Account Identity Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">Full Identity Name</label>
            <input
              type="text"
              disabled
              value={fullName}
              className="w-full px-4 py-3 bg-neutral-900/40 border border-neutral-900 rounded-xl text-xs text-neutral-400 cursor-not-allowed focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">Contact Line (WhatsApp / Tel)</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g., +234 812 345 6789"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">Operational Base Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Bodija, Ibadan"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">Years of Experience</label>
            <input
              type="number"
              min={0}
              max={50}
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors"
            />
          </div>
        </div>

        {/* Conditional Specialties Section built explicitly for Painter roles */}
        {profile?.role === "painter" && (
          <div className="space-y-1.5 animate-fade-in">
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 flex items-center gap-1">
              Active Finish Specializations (Comma Separated)
              <InfoTooltip
                title="Specialist Swatches"
                what="A list of specific finishes or texturing styles you offer."
                why="Clients look for these skills to verify you can execute advanced remodeling work."
              />
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g., Satin Finishes, Matte Coatings, POP Screeding, Stucco Texturing"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors"
            />

            {/* Visual Skill Badge Swatches Row */}
            {skillsInput.trim().length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {skillsInput.split(",").map((skill, index) => {
                  const cleanSkill = skill.trim();
                  if (!cleanSkill) return null;
                  return (
                    <span key={index} className="px-2.5 py-0.5 bg-neutral-900 border border-neutral-850 text-[10px] text-neutral-400 font-bold rounded-md uppercase tracking-wide">
                      ⚡ {cleanSkill}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 block mb-1.5">Professional Bio Description</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell prospective clients about your finish techniques, quality standards, and workspace cleanup guarantees..."
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-900 text-black disabled:text-neutral-500 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-[0.99]"
          >
            {isSaving ? "Syncing Workspace Parameters..." : "Save Profile Configuration"}
          </button>
        </div>

      </form>
    </div>
  );
}