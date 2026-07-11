// app/(public)/view/[id]/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

interface SharedDataPayload {
  share_id: string;
  design_id?: string; // Track original design ID for workspace canvas routing
  design_name: string;
  room_data: Record<string, string>;
  parent_template_name: string;
  painter_id: string;
  full_name: string;
  bio: string | null;
  location: string | null;
  experience_years: number;
  skills: string[];
  avatar_url: string | null;
  phone_number: string | null;
  model_url?: string | null;
  master_design_id?: string;
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

interface Painter3DConcept {
  id: string;
  name: string;
  parent_template_name: string;
  room_data: Record<string, string>;
  created_at: string;
}

function ReadOnlyRoomPlanes({ roomColors }: { roomColors: Record<string, string> }) {
  const width = 14;
  const height = 8;
  const depth = 14;

  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={roomColors.floor || "#161618"} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={roomColors.ceiling || "#1a1a1c"} roughness={0.9} />
      </mesh>
      <mesh position={[0, height / 2, -depth / 2]} rotation={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={roomColors.wallBack || "#F2EFE9"} roughness={0.85} />
      </mesh>
      <group position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[depth, height]} />
          <meshStandardMaterial color={roomColors.wallLeft || "#9BA498"} roughness={0.85} />
        </mesh>
      </group>
      <group position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[depth, height]} />
          <meshStandardMaterial color={roomColors.wallRight || "#C4B199"} roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

function PublicCustomBlenderModelMesh({ modelUrl, surfaceStates }: { modelUrl: string; surfaceStates: Record<string, string> }) {
  const { scene } = useGLTF(modelUrl);

  useEffect(() => {
    scene.traverse((node: THREE.Object3D) => {
      if (node instanceof THREE.Mesh && node.material instanceof THREE.MeshStandardMaterial) {
        const meshName = node.name || node.uuid;
        if (surfaceStates[meshName]) {
          node.material.color.set(surfaceStates[meshName]);
        }
      }
    });
  }, [scene, surfaceStates]);

  return <primitive object={scene} />;
}

export default function PublicProfileAndConceptPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken, user } = useAuth();
  const { showToast } = useAlert();

  const targetId = (params?.id || params?.sharedId) as string;

  const [is3DConceptShare, setIs3DConceptShare] = useState<boolean>(false);
  const [sharedConcept, setSharedConcept] = useState<SharedDataPayload | null>(null);

  const [profile, setProfile] = useState<SharedDataPayload | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  // ✅ NEW: State array storing the painter's interactive 3D concept list
  const [concepts3D, setConcepts3D] = useState<Painter3DConcept[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [importing, setImporting] = useState<boolean>(false);

  // Expansion Gallery Lightbox States
  const [activeLightboxProject, setActiveLightboxProject] = useState<PortfolioProject | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!targetId) return;

    const resolvePublicDataStream = async () => {
      try {
        const conceptRes = await fetch(`${BACKEND_API_URL}/api/visualizations/share/${targetId}`);

        if (conceptRes.ok) {
          const conceptBody = await conceptRes.json();
          setSharedConcept(conceptBody.data);
          setIs3DConceptShare(true);
          setLoading(false);
          return;
        }

        // Fetch profile, project images portfolio, and interactive 3D concepts for the specific painter ID[cite: 4]
        const [profileRes, portfolioRes, conceptsRes] = await Promise.all([
          fetch(`${BACKEND_API_URL}/api/profile/${targetId}`),
          fetch(`${BACKEND_API_URL}/api/portfolio/projects?userId=${targetId}`),
          fetch(`${BACKEND_API_URL}/api/visualizations/painter/${targetId}`) // Backend route helper mapping
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile || null);
        }

        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          setPortfolio(portfolioData.projects || []);
        }

        if (conceptsRes.ok) {
          const conceptsData = await conceptsRes.json();
          setConcepts3D(conceptsData.visualizations || []);
        }
      } catch (err) {
        console.error("Aggregation error on public stream:", err);
      } finally {
        setLoading(false);
      }
    };

    resolvePublicDataStream();
  }, [targetId, BACKEND_API_URL]);

  const handleSaveToClientHub = async () => {
    if (!accessToken || !user) {
      showToast({ message: "Please create an account or log in to clone this design scheme.", severity: "error" });
      router.push("/login");
      return;
    }

    if ((user as { role?: string })?.role !== "client") {
      showToast({ message: "Only client accounts can import designs into their Design Hub.", severity: "error" });
      return;
    }

    if (!sharedConcept) return;

    setImporting(true);
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/visualizations`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: `${sharedConcept.design_name} (Remixed)`,
          roomData: sharedConcept.room_data,
          masterDesignId: sharedConcept.master_design_id || "tmpl_living_lux"
        })
      });

      if (response.ok) {
        showToast({ message: "Design cloned perfectly! Redirecting to your Hub layout...", severity: "success" });
        setTimeout(() => {
          router.push("/hub");
        }, 1500);
      } else {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to clone setup.");
      }
    } catch (err) {
      console.error("Cloning pipeline exception caught:", err);
      showToast({ message: "Could not import design asset parameters.", severity: "error" });
    } finally {
      setImporting(false);
    }
  };

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

  // 📺 1. RENDER INTERACTIVE FULLSCREEN 3D SCHEME VIEW FOR SINGLE SHARE LINKS[cite: 4]
  if (is3DConceptShare && sharedConcept) {
    const whatsappLinkText = encodeURIComponent(
      `Hello ${sharedConcept.full_name}, I just reviewed the 3D room color setup titled "${sharedConcept.design_name}" you shared with me. I love it! Let's lock down the contract details.`
    );

    return (
      <div className="fixed inset-0 bg-neutral-950 flex flex-col overflow-hidden select-none z-40 text-white">
        <div className="w-full bg-neutral-950 border-b border-neutral-900 px-4 py-3 z-20 flex items-center justify-between">
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-neutral-100">{sharedConcept.design_name}</h1>
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">
              Designed by: <span className="text-emerald-400 font-bold">{sharedConcept.full_name}</span>
            </p>
          </div>
          <span className="text-[9px] bg-neutral-900 border border-neutral-850 px-2.5 py-1 rounded-md text-neutral-400 font-bold uppercase select-none">
            Client Interactive Preview
          </span>
        </div>

        <div className="flex-1 w-full h-full relative z-10">
          <Canvas camera={{ position: [12, 12, 12], fov: 45 }}>
            <color attach="background" args={["#0a0a0a"]} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 15, 5]} intensity={0.8} />
            <Suspense fallback={null}>
              {sharedConcept.model_url && sharedConcept.model_url.trim() !== "" ? (
                <PublicCustomBlenderModelMesh
                  modelUrl={sharedConcept.model_url}
                  surfaceStates={sharedConcept.room_data}
                />
              ) : (
                <ReadOnlyRoomPlanes roomColors={sharedConcept.room_data} />
              )}
            </Suspense>
            <OrbitControls maxDistance={22} minDistance={4} enablePan={false} />
          </Canvas>
        </div>

        <div className="absolute bottom-4 left-0 right-0 z-20 px-4 flex justify-center pointer-events-none">
          <div className="w-full max-w-xl bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pointer-events-auto backdrop-blur-md">
            <div>
              <h4 className="text-xs font-black uppercase text-neutral-200">Approve This Look?</h4>
              <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">Save it to your Design Hub to start custom remix variants, or chat directly.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={importing}
                onClick={handleSaveToClientHub}
                className="px-4 py-2.5 bg-neutral-950 border border-neutral-800 text-neutral-200 hover:text-emerald-400 text-center text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                {importing ? "Importing Design..." : "📥 Save to My Hub"}
              </button>

              {sharedConcept.phone_number ? (
                <a
                  href={`https://wa.me/${sharedConcept.phone_number.replace(/\s+/g, "")}?text=${whatsappLinkText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-center text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md block"
                >
                  💬 Chat with Painter
                </a>
              ) : (
                <span className="text-[9px] text-neutral-600 italic flex items-center justify-center">No phone contact details linked</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 📱 2. STANDARD PORTFOLIO CATALOG BACKUP FALLBACK VIEW[cite: 4]
  const activeProfile = profile || sharedConcept;
  if (!activeProfile) {
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

      {/* IDENTITY PROFILE HERO HEADER[cite: 4] */}
      <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-black text-2xl text-emerald-400 select-none shadow-inner overflow-hidden shrink-0">
              {activeProfile.avatar_url ? (
                <img
                  src={activeProfile.avatar_url}
                  alt={activeProfile.full_name}
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : (
                <span>{activeProfile.full_name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div>
              <h1 className="text-xl font-black uppercase tracking-wide text-neutral-100">{activeProfile.full_name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-neutral-500">
                <span>📍 {activeProfile.location || "Location unconfigured"}</span>
                {activeProfile.experience_years > 0 && (
                  <>
                    <span className="text-neutral-700">•</span>
                    <span className="text-neutral-400 font-semibold">💼 {activeProfile.experience_years} Years Active Experience</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <span className="text-[10px] bg-neutral-900 border border-neutral-850 px-3 py-1.5 rounded-xl text-emerald-400 font-black uppercase tracking-wider select-none h-fit">
            Pro Contractor
          </span>
        </div>

        {activeProfile.bio && (
          <div className="pt-4 border-t border-neutral-900/60">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-600 mb-1">Studio Biography</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">{activeProfile.bio}</p>
          </div>
        )}
      </div>

      {/* ✅ NEW: INTERACTIVE 3D CONCEPTS SHOWCASE DECK GRID */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 pl-1">Interactive 3D Color Presets</h3>

        {concepts3D.length === 0 ? (
          <div className="p-10 bg-neutral-950 border border-neutral-900 rounded-3xl text-center border-dashed flex flex-col items-center justify-center min-h-[140px] space-y-2">
            <span className="text-xl opacity-40">🎨</span>
            <h4 className="text-[11px] font-black uppercase tracking-wide text-neutral-400">No Interactive 3D Concepts</h4>
            <p className="text-[10px] text-neutral-600 max-w-xs leading-relaxed">This painter hasn&apos;t published any custom 3D design models to load yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {concepts3D.map((concept) => (
              <div
                key={concept.id}
                onClick={() => router.push(`/designs?templateId=${concept.id}&preview=true`)}
                className="group bg-neutral-950 border border-neutral-900 hover:border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all shadow-xl"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-850 flex items-center justify-center font-black text-emerald-400 text-lg shadow-inner group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                    📦
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-neutral-200 tracking-wide group-hover:text-emerald-400 transition-colors truncate">
                      {concept.name}
                    </h4>
                    <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider mt-0.5">
                      Layout: {concept.parent_template_name || "Custom Room"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-900/40 flex items-center justify-between text-[9px] font-black text-neutral-500 group-hover:text-emerald-400 transition-colors uppercase tracking-wider">
                  <span>Launch 3D Visualizer</span>
                  <span>Interactive &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SPECIALTIES & APPLICATION BADGES[cite: 4] */}
      {activeProfile.skills && activeProfile.skills.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 pl-1">Finishes Specializations</h3>
          <div className="flex flex-wrap gap-2">
            {activeProfile.skills.map((skill, idx) => (
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

      {/* HIGH-RESOLUTION PORTFOLIO GALLERY LAYER[cite: 4] */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 pl-1">Real Finishes Showcase</h3>

        {portfolio.length === 0 ? (
          <div className="p-10 bg-neutral-950 border border-neutral-900 rounded-3xl text-center space-y-2 border-dashed flex flex-col items-center justify-center min-h-[160px]">
            <span className="text-xl opacity-40">📸</span>
            <h4 className="text-[11px] font-black uppercase tracking-wide text-neutral-400">No Showcase Projects Available</h4>
            <p className="text-[10px] text-neutral-600 max-w-xs leading-relaxed">This contractor has not uploaded live finishes work imagery onto their gallery dashboard yet.</p>
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
                      <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-[101%] transition-transform duration-300" />
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

      {/* LIGHTBOX MODAL[cite: 4] */}
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
                <img src={activeLightboxProject.images[currentImageIndex]} alt="" className="max-w-full max-h-full object-contain" />
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
            </div>
          </div>
        </div>
      )}

    </div>
  );
}