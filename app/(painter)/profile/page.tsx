"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext"; // ✅ Destructured authentication context utilities[cite: 2]
import { useRouter } from "next/navigation";
import { InfoTooltip } from "@/components/ui/InfoToolTip"; // ✅ Included explicit context components[cite: 2]

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
  const { logout } = useAuth(); // ✅ Destructured authentication context utilities[cite: 2]
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [skillsInput, setSkillsInput] = useState("");

  // 🖼️ Avatar Management Upload States[cite: 2]
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; // ✅ Configured environment variables mapping context[cite: 2]

  // ==========================================================
  // 🔄 HYDRATE PROFILE DATA VIA SQL JOIN ENDPOINT[cite: 2]
  // ==========================================================
  useEffect(() => {
    const fetchActiveProfileSettings = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/profile/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("paintit_access_token")}`, // ✅ Handles authorization payload mappings securely[cite: 2]
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
          setLocation(p.location || "Ibadan, Nigeria"); // ✅ Defaults to operating base[cite: 2]
          setExperienceYears(p.experience_years || 0);
          setSkillsInput(p.skills?.join(", ") || "");

          // Hydrate avatar url from global context mapping fallback if missing on standard profile model[cite: 2]
          setAvatarUrl(data.profile.avatar_url || localStorage.getItem("paintit_avatar_cache") || null);
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
  // ☁️ CLOUDINARY MEDIA STREAM BINARY UPLOADER[cite: 2]
  // ==========================================================
  const handleAvatarFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Structure validation defenses prior to chunk stream serialization[cite: 2]
    if (file.size > 3 * 1024 * 1024) {
      setFeedbackBanner({ type: "error", msg: "Image size threshold exceeded. Keep images below 3MB." });
      return;
    }

    setIsUploadingAvatar(true);
    setFeedbackBanner(null);

    const mediaPayload = new FormData();
    mediaPayload.append("file", file);
    mediaPayload.append("upload_preset", "paintIt-portfolio"); // ✅ Binds active upload profiles configuration[cite: 2]

    try {
      // 1. Direct Cloudinary Node ingestion endpoint fetch request[cite: 2]
      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: mediaPayload,
      });

      if (!cloudinaryRes.ok) throw new Error("Asset transformation pipeline dropped via Cloudinary.");
      const uploadResult = await cloudinaryRes.json();
      const safeSecureUrl = uploadResult.secure_url;

      // 2. Synchronize Cloudinary url string references directly back into Express profile schema[cite: 2]
      const backendSyncRes = await fetch(`${BACKEND_URL}/api/profile/avatar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("paintit_access_token")}`,
        },
        body: JSON.stringify({ avatarUrl: safeSecureUrl }),
      });

      if (!backendSyncRes.ok) throw new Error("Failed to register image address location coordinates with backend server.");

      setAvatarUrl(safeSecureUrl);
      localStorage.setItem("paintit_avatar_cache", safeSecureUrl);
      setFeedbackBanner({ type: "success", msg: "Studio branding asset updated successfully o!" }); // ✅ Native notification banner updates[cite: 2]
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Media stream interface error.";
      setFeedbackBanner({ type: "error", msg });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ==========================================================
  // 💾 SAVE MUTATED RE-CONFIGURATIONS (UPSERT EXECUTOR)[cite: 2]
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
          bio: bio,
          phoneNumber: phoneNumber || null,
          location: location || null,
          experienceYears: Number(experienceYears) || 0,
          skills: parsedSkills,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          throw new Error(`Validation Error: ${data.details.join(" | ")}`);
        }
        throw new Error(data.error || "Failed to update profile matrix.");
      }

      setFeedbackBanner({ type: "success", msg: "Profile credentials synchronized successfully o!" }); // ✅ Displays confirmation status[cite: 2]

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
    <div className="w-full text-white space-y-6 max-w-2xl mx-auto md:mx-0 pb-20">

      {/* Page Title Context Node Header[cite: 2] */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-5">
        <div>
          <h1 className="text-xl font-black tracking-tight text-neutral-100">Account Master Settings</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure public biography descriptions, experience fields, and core communication channels.[cite: 2]
          </p>
        </div>

        {/* ✅ DUAL-LAYER SECURITY PORTAL BUTTON: Visible and easy to locate on both mobile and desktop viewports */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 text-emerald-400 hover:text-black font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md"
          >
            ⚙️ Security Settings
          </button>

          {/* ✅ MOBILE VIEW LOGOUT COMPONENT BUTTON: Displays strictly below sm break limits[cite: 2] */}
          <button
            type="button"
            onClick={logout} // ✅ Invokes unified account log out execution handles[cite: 2]
            className="block sm:hidden px-3.5 py-2 bg-red-950/20 active:bg-red-950/40 border border-red-900/30 text-red-400 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md"
          >
            Logout 👋
          </button>
        </div>
      </div>

      {feedbackBanner && (
        <div className={`p-3.5 text-xs rounded-xl border font-medium ${feedbackBanner.type === "success"
          ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
          : "bg-red-950/20 border-red-900/40 text-red-400"
          }`}>
          {feedbackBanner.type === "success" ? "✅" : "⚠️"} {feedbackBanner.msg}
        </div>
      )}

      {/* ✅ HIGH-FIDELITY AVATAR MANAGEMENT COMPONENT BLOCK CARD[cite: 2] */}
      <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-2xl flex flex-col sm:flex-row items-center gap-5 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-black text-xl text-emerald-400 tracking-widest relative overflow-hidden shrink-0 group select-none shadow-inner">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Avatar profile view" className="w-full h-full object-cover" />
          ) : (
            <span>{fullName.charAt(0).toUpperCase() || "P"}</span>
          )}
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="space-y-2 text-center sm:text-left w-full sm:w-auto">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-200">Studio Branding Imagery</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Upload a clean high-resolution face portrait photo or company logo vector.[cite: 2]</p>
          </div>
          <label className="inline-block cursor-pointer px-4 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors select-none">
            {isUploadingAvatar ? "Processing File Stream..." : "Choose Photo Image"}
            <input
              type="file"
              accept="image/*"
              disabled={isUploadingAvatar}
              onChange={handleAvatarFileSelection}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <form onSubmit={handleProfileSave} className="space-y-5 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-2xl">

        {/* Read-Only Grid Rows[cite: 2] */}
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

        {/* Account Identity Inputs[cite: 2] */}
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
              type="text"
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

        {/* Conditional Specialties Section built explicitly for Painter roles[cite: 2] */}
        {profile?.role === "painter" && (
          <div className="space-y-1.5 animate-fade-in">
            <label className="text-[10px] uppercase font-black tracking-wider text-neutral-400 flex items-center gap-1">
              Active Finish Specializations (Comma Separated)
              <InfoTooltip
                title="Specialist Swatches"
                what="A list of specific finishes or texturing styles you offer.[cite: 2]"
                why="Clients look for these skills to verify you can execute advanced remodeling work.[cite: 2]"
              />
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g., Satin Finishes, Matte Coatings, POP Screeding, Stucco Texturing"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-colors"
            />

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