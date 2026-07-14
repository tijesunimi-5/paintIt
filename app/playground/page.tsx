'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/context/AlertContext';
import { useAuth } from '@/context/AuthContext';

interface DesignTemplate {
  id: string;
  title: string;
  model_url: string;
  thumbnail_icon?: string;
  category?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function StudioDashboard() {
  const [catalog, setCatalog] = useState<DesignTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { showToast } = useAlert();
  const { accessToken } = useAuth();

  // Load all current 3D template rows from backend pg table
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/visualizations/catalog`);
        if (!res.ok) throw new Error('Failed to parse database records');
        const data = await res.json();
        setCatalog(data.catalog || []);
      } catch (err) {
        console.error(err);
        showToast({ message: '⚠️ Could not sync template directory list.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [showToast]);

  // Create a brand new design environment setup record entry dynamically
  const handleAddNewTemplate = async () => {
    const token = accessToken || localStorage.getItem('paintit_access_token') || '';
    if (!token) {
      showToast({ message: '⚠️ Access Denied: Authenticate session first.', severity: 'error' });
      return;
    }

    const newId = crypto.randomUUID();
    const payload = {
      id: newId,
      title: 'New Custom Workspace Variant',
      model_url: '/models/selfcon.glb', // Baseline asset signature matching default project configurations
      camera_settings: { position: [0, 1.4, 2.2], target: [0, 1.5, 0], maxZoomDistance: 0.55, ceilingLimitAngle: 0, floorLimitAngle: 1.85 },
      lighting_settings: [],
      default_room_data: { floor: '#f2f0ea', ceiling: '#ffffff', wallFront: '#F2EFE9', wallBack: '#F2EFE9' },
      global_environment: { isNightMode: false }
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/visualizations/catalog/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast({ message: '✨ Fresh 3D studio frame initialized!', severity: 'success' });
        router.push(`/playground/${newId}`); // Boot straight into editor view
      } else {
        showToast({ message: '❌ Server refused layout initialization setup.', severity: 'error' });
      }
    } catch (err) {
      console.error(err);
      showToast({ message: '💾 Database creation transaction fault network level.', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-neutral-950 flex items-center justify-center text-sm font-bold text-neutral-400 uppercase tracking-widest">
        ⚡ Loading PaintIt Canvas Catalog...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Header Header Control Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">🎨 3D Studio Workspace Catalog</h1>
            <p className="text-xs text-neutral-400 mt-1 font-medium">Select an architectural mesh blueprint configuration layer to begin live modifications.</p>
          </div>
          <button
            onClick={handleAddNewTemplate}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
          >
            ➕ Create New Model Frame
          </button>
        </div>

        {/* Directory Matrix Grid */}
        {catalog.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20">
            <span className="block text-2xl mb-2">📭</span>
            <p className="text-xs font-black uppercase text-neutral-500 tracking-wider">No design entries saved. Initialize your first layout template structure above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {catalog.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/playground/${item.id}`)}
                className="group relative cursor-pointer border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 rounded-xl p-5 shadow-xl hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div className="absolute top-4 right-4 text-lg bg-neutral-950 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  {item.thumbnail_icon || '🛋️'}
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-cyan-400 tracking-widest bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded-md">
                    {item.category || 'INTERIOR'}
                  </span>
                  <h3 className="text-sm font-black text-neutral-200 mt-3 tracking-wide group-hover:text-white truncate pr-10">
                    {item.title}
                  </h3>
                  <p className="text-[10px] font-mono text-neutral-500 mt-1 truncate">{item.model_url}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-neutral-800/60 pt-3">
                  <span className="text-[9px] font-mono text-neutral-600 tracking-tight truncate max-w-[150px]">ID: {item.id}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                    Edit Layer 🛠️
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}