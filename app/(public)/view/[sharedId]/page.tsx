// app/(public)/view/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface PublicProfileData {
  id: string;
  full_name: string;
  role: string;
  bio: string | null;
  location: string | null;
  experience_years: number;
  skills: string[];
  avatar_url: string | null;
}

interface PortfolioProject {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  location: string;
  colors_used: string[];
  created_at: string;
}

export default function PublicProfilePage() {
  const params = useParams();

  // ✅ FIX 1: Defensively fall back between id and sharedId to guarantee path matching
  const targetId = (params?.id || params?.sharedId) as string;

  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 🖼️ Live Expansion Gallery Lightbox States
  const [activeLightboxProject, setActiveLightboxProject] = useState<PortfolioProject | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!targetId) return;

    const aggregateStudioData = async () => {
      try {
        const [profileRes, portfolioRes] = await Promise.all([
          fetch(`${BACKEND_API_URL}/api/profile/${targetId}`),
          fetch(`${BACKEND_API_URL}/api/portfolio/projects?userId=${targetId}`)
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile || null);
        }

        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          setPortfolio(portfolioData.projects || []);
        }
      } catch (err) {
        console.error("Aggregation error on public profiles stream:", err);
      } finally {
        setLoading(false);
      }
    };

    aggregateStudioData();
  }, [targetId, BACKEND_API_URL]);

  const handleOpenLightbox = (project: PortfolioProject) => {
    if (project.images && project.images.length > 0) {
      setActiveLightboxProject(project);
      setCurrentImageIndex(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] text-neutral-600 font-bold tracking-widest uppercase">
          Compiling Studio Architecture...
        </span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-24 border border-dashed border-neutral-900 rounded-3xl max-w-md mx-auto">
        <span className="text-xl">⚠️</span>
        <h3 className="text-xs font-black uppercase text-neutral-400 mt-2">Profile Absent</h3>
        <p className="text-[11px] text-neutral-600 mt-1">This contractor account profile record does not exist on the network cluster.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in text-white pb-12 selection:bg-emerald-500 selection:text-black">

      {/* 💳 IDENTITY PROFILE HERO HEADER */}
      <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">

            {/* ✅ FIX 2: Safely switches between real Cloudinary images and text fallback initials instantly */}
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-black text-2xl text-emerald-400 select-none shadow-inner overflow-hidden shrink-0">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : (
                <span>{profile.full_name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div>
              <h1 className="text-xl font-black uppercase tracking-wide text-neutral-100">{profile.full_name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-neutral-500">
                <span>📍 {profile.location || "Location unconfigured"}</span>
                {profile.experience_years > 0 && (
                  <>
                    <span className="text-neutral-700">•</span>
                    <span className="text-neutral-400 font-semibold">💼 {profile.experience_years} Years Professional Experience</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <span className="text-[10px] bg-neutral-900 border border-neutral-850 px-3 py-1.5 rounded-xl text-emerald-400 font-black uppercase tracking-wider select-none h-fit">
            Pro Contractor
          </span>
        </div>

        {profile.bio && (
          <div className="pt-4 border-t border-neutral-900/60">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">Studio Biography</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* 🏷️ SPECIALTIES & APPLICATION BADGES */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 pl-1">Finishes Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-neutral-950 border border-neutral-900 text-neutral-300 font-bold text-[11px] rounded-xl cursor-default hover:border-emerald-500/20 transition-colors shadow-md"
              >
                ✨ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 🖼️ HIGH-RESOLUTION PORTFOLIO GALLERY LAYER */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 pl-1">Real Finishes Showcase</h3>

        {portfolio.length === 0 ? (
          <div className="p-10 bg-neutral-950 border border-neutral-900 rounded-3xl text-center space-y-2 border-dashed flex flex-col items-center justify-center min-h-[160px]">
            <span className="text-xl opacity-40">📸</span>
            <h4 className="text-[11px] font-black uppercase tracking-wide text-neutral-400">No Showcase Projects Available</h4>
            <p className="text-[10px] text-neutral-600 max-w-xs leading-relaxed">This contractor has not uploaded live finishes work imagery onto their gallery dashboard yet o!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolio.map((project) => (
              <div
                key={project.id}
                className="group bg-neutral-950 border border-neutral-900 hover:border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all duration-200"
              >
                <div>
                  <div
                    onClick={() => handleOpenLightbox(project)}
                    className="relative w-full h-48 bg-neutral-900 border-b border-neutral-900 overflow-hidden cursor-pointer"
                  >
                    {project.images && project.images.length > 0 ? (
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-[101%] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-700 bg-neutral-950">
                        <span className="text-xl mb-1">🖼️</span>
                        <span className="text-[9px] uppercase font-bold tracking-wider">No Media Logs</span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-md border border-neutral-800/60 rounded-full text-[10px] font-bold tracking-wide text-neutral-300 select-none">
                      📍 {project.location}
                    </div>

                    {project.images && project.images.length > 1 && (
                      <span className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-[9px] font-black text-emerald-400 px-2 py-1 rounded-md border border-neutral-800/60 select-none tracking-wide uppercase">
                        + {project.images.length - 1} Images
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-sm font-black uppercase text-neutral-200 tracking-wide group-hover:text-emerald-400 transition-colors">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed italic">
                          &apos;{project.description}&apos;
                        </p>
                      )}
                    </div>

                    {project.colors_used && project.colors_used.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-neutral-900/60">
                        <span className="text-[9px] uppercase font-black tracking-widest text-neutral-600 block">Swatches Applied</span>
                        <div className="flex flex-wrap gap-1.5">
                          {project.colors_used.map((color, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md text-[10px] text-neutral-400 font-semibold uppercase tracking-wider"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => handleOpenLightbox(project)}
                  className="px-5 py-3 bg-neutral-950 border-t border-neutral-900/40 flex items-center justify-between text-[10px] font-black tracking-wider text-neutral-500 hover:text-emerald-400 cursor-pointer transition-colors uppercase"
                >
                  <span>Inspect Real Finish Assets</span>
                  <span>View Project →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🖼️ LIGHTBOX MODAL */}
      {activeLightboxProject && (
        <div className="fixed inset-0 bg-black/95 z-50 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">

          <button
            onClick={() => setActiveLightboxProject(null)}
            className="absolute top-6 right-6 text-xs text-neutral-500 hover:text-white font-black uppercase tracking-widest border border-neutral-900 px-3 py-1.5 rounded-xl bg-neutral-950"
          >
            ✕ Close View
          </button>

          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

            <div className="md:col-span-2 space-y-4">
              <div className="w-full h-[55vh] bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-2xl select-none">
                <img
                  src={activeLightboxProject.images[currentImageIndex]}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                />

                {activeLightboxProject.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(p => p === 0 ? activeLightboxProject.images.length - 1 : p - 1)}
                      className="absolute left-4 w-9 h-9 rounded-full bg-black/80 border border-neutral-800 text-white flex items-center justify-center text-sm font-black hover:bg-emerald-500 hover:text-black transition-all"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(p => p === activeLightboxProject.images.length - 1 ? 0 : p + 1)}
                      className="absolute right-4 w-9 h-9 rounded-full bg-black/80 border border-neutral-800 text-white flex items-center justify-center text-sm font-black hover:bg-emerald-500 hover:text-black transition-all"
                    >
                      →
                    </button>
                  </>
                )}
              </div>

              {activeLightboxProject.images.length > 1 && (
                <div className="flex flex-wrap gap-2 items-center justify-center">
                  {activeLightboxProject.images.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-12 h-12 bg-neutral-900 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${currentImageIndex === index ? "border-emerald-500 scale-105" : "border-neutral-900 opacity-50"
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 text-left">
              <div>
                <span className="text-[9px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-neutral-400 font-bold uppercase tracking-wider">Showcase Deep View</span>
                <h2 className="text-xl font-black text-white mt-1">{activeLightboxProject.title}</h2>
                <p className="text-[11px] text-neutral-500 mt-0.5">📍 Location Area: {activeLightboxProject.location}</p>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed max-h-[25vh] overflow-y-auto pr-1">
                {activeLightboxProject.description || "No project overview notes compiled."}
              </p>

              {activeLightboxProject.colors_used && activeLightboxProject.colors_used.length > 0 && (
                <div className="space-y-1.5 border-t border-neutral-900 pt-3">
                  <span className="text-[9px] uppercase font-black text-neutral-600 block">Swatches Registered</span>
                  <div className="flex flex-wrap gap-1">
                    {activeLightboxProject.colors_used.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-neutral-900 border border-neutral-850 rounded text-[10px] text-neutral-400 uppercase font-semibold">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}