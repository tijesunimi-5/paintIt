"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

interface PublicProfile {
  id: string;
  full_name: string;
  role: string;
  bio: string | null;
  location: string | null;
  experience_years: number;
  skills: string[];
}

interface PortfolioProject {
  id: number;
  title: string;
  description: string | null;
  location: string;
  images: string[];
  colors_used: string[];
  created_at: string;
}

interface Painter3DConcept {
  id: string;
  name: string;
  parent_template_name: string;
  room_data: Record<string, string>;
  thumbnail_url?: string | null;
  created_at: string;
}

export default function PublicPainterShowcasePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params?.id as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [concepts3D, setConcepts3D] = useState<Painter3DConcept[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Tab Routing Manager State ('REAL_WORK' or 'THREE_D_STUDIO')
  const [activeTab, setActiveTab] = useState<'REAL_WORK' | 'THREE_D_STUDIO'>('REAL_WORK');

  // Direct Lead Generation Form State
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Deep-View Lightbox Modal Parameter Elements
  const [activeLightboxProject, setActiveLightboxProject] = useState<PortfolioProject | null>(null);
  const [currentLightboxImageIdx, setCurrentLightboxImageIdx] = useState<number>(0);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 🔄 Hydrate Public Data Records
  useEffect(() => {
    if (!id) return;

    const fetchShowcaseData = async () => {
      try {
        // 1. Fetch Profile Credentials
        const profileRes = await fetch(`${BACKEND_URL}/api/profile/${id}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.profile) {
            setProfile(profileData.profile);
          }
        }

        // 2. Fetch Projects mapped back to this explicit UUID token corridor
        const portfolioRes = await fetch(`${BACKEND_URL}/api/portfolio/projects?userId=${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          const loadedProjects = portfolioData.projects || (Array.isArray(portfolioData) ? portfolioData : []);
          setProjects(loadedProjects);

          // 🔗 AUTO-LIGHTBOX DEEP LINK CHECKER
          const targetProjectParam = searchParams.get("project");
          if (targetProjectParam) {
            const matchedProject = loadedProjects.find((p: PortfolioProject) => p.id.toString() === targetProjectParam);
            if (matchedProject) {
              setActiveLightboxProject(matchedProject);
              setCurrentLightboxImageIdx(0);
            }
          }
        }

        // 3. Fetch 3D Concepts created by this painter
        const conceptsRes = await fetch(`${BACKEND_URL}/api/visualizations/painter/${id}`);
        if (conceptsRes.ok) {
          const conceptsData = await conceptsRes.json();
          setConcepts3D(conceptsData.visualizations || []);
        }

      } catch (err) {
        console.error("Showcase data query exception:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShowcaseData();
  }, [id, BACKEND_URL, searchParams]);

  const handleCreateInboundLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail) return;

    setSubmittingLead(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/analytics/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          painterId: id,
          clientName: leadName,
          clientEmail: leadEmail,
          clientPhone: leadPhone,
          projectDescription: leadMessage,
          source: "PROFILE_DIRECT"
        })
      });

      if (res.ok) {
        setSuccessMessage("Your consultation request has been submitted successfully o!");
        setLeadName("");
        setLeadEmail("");
        setLeadPhone("");
        setLeadMessage("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingLead(false);
    }
  };

  const copyIndividualProjectLink = (projectId: number) => {
    const link = `${window.location.origin}/painter/${id}?project=${projectId}`;
    navigator.clipboard.writeText(link);
    showToastNotification("Individual project deep link saved to clipboard!");
  };

  const copyEntireCatalogProfileLink = () => {
    const link = `${window.location.origin}/painter/${id}`;
    navigator.clipboard.writeText(link);
    showToastNotification("Complete business catalog profile link saved!");
  };

  const showToastNotification = (msg: string) => {
    alert(msg); // Easy lightweight fallback indicator
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-3">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] tracking-widest uppercase font-black text-neutral-600">Loading Catalog Parameters...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-sm font-black uppercase tracking-wider text-red-500">Workspace Profile Not Found</h1>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs">The requested contractor resource index link is invalid or has been revoked.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans antialiased relative selection:bg-emerald-500 selection:text-black">

      {/* Navigation Layer */}
      <nav className="border-b border-neutral-900 bg-neutral-950/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xs font-black tracking-widest text-emerald-400 uppercase select-none">PAINTIT // PRO</span>
          <div className="flex items-center gap-2">
            <button
              onClick={copyEntireCatalogProfileLink}
              className="text-[10px] bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 rounded-xl text-neutral-300 font-bold uppercase transition-all"
            >
              🔗 Copy Share Profile Link
            </button>
            <span className="text-[10px] bg-emerald-950/20 border border-emerald-900/40 px-2.5 py-1.5 rounded-xl text-emerald-400 uppercase font-bold tracking-wider select-none">
              📍 {profile.location || "Ibadan, Nigeria"}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Profile Content Column */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <span className="text-[9px] bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded text-emerald-400 font-black uppercase tracking-widest select-none">Verified Finish Contractor</span>
            <h1 className="text-3xl font-black text-neutral-100 tracking-tight mt-2">{profile.full_name}</h1>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">Experience Rating: <span className="text-neutral-300 font-bold">{profile.experience_years} Years Active</span></p>
          </div>

          <div className="space-y-2 border-t border-neutral-900 pt-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Contractor Biography</h3>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xl whitespace-pre-wrap">
              {profile.bio || "This expert has not customized their public bio description parameters yet."}
            </p>
          </div>

          <div className="space-y-3 border-t border-neutral-900 pt-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Specialist Finish Swatches</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-neutral-950 border border-neutral-850 rounded-lg text-xs font-bold text-neutral-300 uppercase tracking-wide">
                    ⚡ {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-neutral-600 italic">General Surface Preparation & Coatings</span>
              )}
            </div>
          </div>


          <div className="border-t border-neutral-900 pt-6 space-y-5">
            <div className="flex items-center gap-1.5 border-b border-neutral-900 pb-2">
              <button
                onClick={() => setActiveTab('REAL_WORK')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'REAL_WORK'
                    ? "bg-neutral-950 border border-neutral-800 text-emerald-400"
                    : "text-neutral-500 hover:text-neutral-300"
                  }`}
              >
                📁 Real Works ({projects.length})
              </button>
              <button
                onClick={() => setActiveTab('THREE_D_STUDIO')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'THREE_D_STUDIO'
                    ? "bg-neutral-950 border border-neutral-800 text-emerald-400"
                    : "text-neutral-500 hover:text-neutral-300"
                  }`}
              >
                🎨 3D Design Swatches ({concepts3D.length})
              </button>
            </div>

            {activeTab === 'REAL_WORK' ? (
              projects.length === 0 ? (
                <div className="p-12 bg-neutral-950 border border-neutral-900 rounded-2xl text-center">
                  <p className="text-xs font-bold text-neutral-500">No project works cataloged on server o!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden flex flex-col justify-between group">
                      <div>
                        <div
                          onClick={() => { setActiveLightboxProject(project); setCurrentLightboxImageIdx(0); }}
                          className="w-full h-40 bg-neutral-900 border-b border-neutral-900 relative overflow-hidden cursor-pointer"
                        >
                          {project.images && project.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={project.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-600 font-bold uppercase tracking-wider">Empty Slate</div>
                          )}
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[9px] font-bold text-neutral-400 border border-neutral-850">
                            📍 {project.location}
                          </div>
                          {project.images?.length > 1 && (
                            <span className="absolute bottom-2 right-2 bg-black/80 text-[9px] font-bold text-neutral-400 px-2 py-0.5 rounded border border-neutral-800">
                              + {project.images.length - 1} Images
                            </span>
                          )}
                        </div>

                        <div className="p-4 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-black text-neutral-200 tracking-wide">{project.title}</h4>
                            <button
                              onClick={() => copyIndividualProjectLink(project.id)}
                              className="text-[9px] text-neutral-500 hover:text-emerald-400 font-black uppercase tracking-wider shrink-0 transition-colors"
                            >
                              🔗 Copy Link
                            </button>
                          </div>
                          <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">{project.description}</p>
                        </div>
                      </div>

                      <div className="px-4 pb-4">
                        <button
                          onClick={() => { setActiveLightboxProject(project); setCurrentLightboxImageIdx(0); }}
                          className="w-full py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 text-[10px] text-neutral-300 font-black uppercase tracking-wider rounded-xl transition-all"
                        >
                          Expand Project Assets
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* 🎨 3D CANVAS RENDERS ROW SLIDE-IN ACTIVE GRID */
              concepts3D.length === 0 ? (
                <div className="p-12 bg-neutral-950 border border-neutral-900 rounded-2xl text-center space-y-1">
                  <p className="text-xs font-bold text-neutral-400">3D Studio Preset Grid Empty</p>
                  <p className="text-[11px] text-neutral-600">Active design presets compiled inside your painter visualizer terminal space load up here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {concepts3D.map((concept) => (
                    <div
                      key={concept.id}
                      onClick={() => router.push(`/view/${concept.id}`)}
                      className="group bg-neutral-950 border border-neutral-900 hover:border-emerald-500/40 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer shadow-xl transition-all duration-200"
                    >
                      {/* 🖼️ THUMBNAIL CONTAINER WITH AUTO-POPULATE */}
                      <div className="w-full h-40 bg-neutral-900 border-b border-neutral-900 relative flex items-center justify-center overflow-hidden">
                        {concept.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={concept.thumbnail_url}
                            alt={concept.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1.5 text-neutral-600">
                            <span className="text-3xl">🏠</span>
                            <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-600">3D Interactive Model</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-neutral-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono text-emerald-400 border border-neutral-800 uppercase font-bold">
                          3D Canvas
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className="text-xs font-black uppercase text-neutral-200 truncate group-hover:text-emerald-400 transition-colors">
                          {concept.name}
                        </h4>
                        <div className="flex items-center justify-between text-[9px] font-bold text-neutral-500 uppercase pt-2 border-t border-neutral-900">
                          <span>Base: {concept.parent_template_name || "Architecture"}</span>
                          <span className="text-emerald-400 group-hover:underline">Launch Visualizer &rarr;</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

        </div>

        {/* Lead Capture Sidebar */}
        <div className="space-y-6">
          <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-2xl sticky top-24">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-100">Request Service Quote</h3>
            <p className="text-[11px] text-neutral-500 mt-1 mb-4">Submit your site parameters directly to this painter&apos;s dashboard feed.</p>

            {successMessage ? (
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 text-xs font-medium rounded-xl text-center">
                🎉 {successMessage}
              </div>
            ) : (
              <form onSubmit={handleCreateInboundLead} className="space-y-3">
                <input
                  type="text" required placeholder="Your Full Name" value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-850 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/40"
                />
                <input
                  type="email" required placeholder="Your Email Address" value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-850 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/40"
                />
                <input
                  type="tel" placeholder="Phone Line (WhatsApp preferred)" value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-850 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/40"
                />
                <textarea
                  required rows={4} placeholder="Describe your project..." value={leadMessage}
                  onChange={(e) => setLeadMessage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-850 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/40 resize-none"
                />
                <button
                  type="submit" disabled={submittingLead}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                >
                  {submittingLead ? "Transmitting Fields..." : "Submit Inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>

      </main>

      {/* 🖼️ HIGH-FIDELITY VIEWER LIGHTBOX MODAL */}
      {activeLightboxProject && (
        <div className="fixed inset-0 bg-black/95 z-50 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in">
          <button
            onClick={() => setActiveLightboxProject(null)}
            className="absolute top-6 right-6 text-xs text-neutral-500 hover:text-white font-black uppercase tracking-widest border border-neutral-900 px-3 py-1.5 rounded-xl bg-neutral-950"
          >
            ✕ Close View
          </button>

          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-4">
              <div className="w-full h-[60vh] bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeLightboxProject.images[currentLightboxImageIdx]} alt="" className="max-w-full max-h-full object-contain" />
                {activeLightboxProject.images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentLightboxImageIdx(p => p === 0 ? activeLightboxProject.images.length - 1 : p - 1)} className="absolute left-4 w-8 h-8 rounded-full bg-black/70 border border-neutral-800 text-white flex items-center justify-center text-xs font-bold hover:bg-emerald-500 hover:text-black">←</button>
                    <button onClick={() => setCurrentLightboxImageIdx(p => p === activeLightboxProject.images.length - 1 ? 0 : p + 1)} className="absolute right-4 w-8 h-8 rounded-full bg-black/70 border border-neutral-800 text-white flex items-center justify-center text-xs font-bold hover:bg-emerald-500 hover:text-black">→</button>
                  </>
                )}
              </div>

              {activeLightboxProject.images.length > 1 && (
                <div className="flex flex-wrap gap-2 items-center justify-center">
                  {activeLightboxProject.images.map((img, index) => (
                    <div key={index} onClick={() => setCurrentLightboxImageIdx(index)} className={`w-12 h-12 bg-neutral-900 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${currentLightboxImageIdx === index ? "border-emerald-500 scale-105" : "border-neutral-900 opacity-60"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 text-left">
              <div>
                <span className="text-[9px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-neutral-400 font-bold uppercase">Case Study Specs</span>
                <h2 className="text-xl font-black text-white mt-1">{activeLightboxProject.title}</h2>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed max-h-[30vh] overflow-y-auto">{activeLightboxProject.description}</p>

              {activeLightboxProject.colors_used && activeLightboxProject.colors_used.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black text-neutral-600 block">Swatches Verified</span>
                  <div className="flex flex-wrap gap-1">
                    {activeLightboxProject.colors_used.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-neutral-900 border border-neutral-850 rounded text-[10px] text-neutral-400 uppercase font-semibold">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-neutral-900 pt-4">
                <button
                  onClick={() => { setActiveLightboxProject(null); document.querySelector("form")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="w-full py-3 bg-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg"
                >
                  Hire for Similar Finish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}