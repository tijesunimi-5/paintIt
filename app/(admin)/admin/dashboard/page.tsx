"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

interface SessionLog {
  id: string;
  visitor_token: string;
  email: string | null;
  duration_seconds: number;
  most_visited_section: string;
  device_type: string;
  created_at: string;
}

interface InteractionLog {
  id: number;
  interaction_type: string;
  visitor_token: string;
  painter_name: string | null;
  created_at: string;
}

interface RoleCount {
  role: string;
  count: string;
}

interface PlatformReview {
  id: number;
  reviewer_name: string;
  rating: number;
  feedback: string;
  created_at: string;
}

interface AnalyticsData {
  summary: {
    totalVisits: number;
    avgDurationSeconds: number;
    identifiedVisitors: number;
    waitlistCount: number;
  };
  rolesBreakdown: RoleCount[];
  sessions: SessionLog[];
  interactions: InteractionLog[];
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminAnalyticsDashboard() {
  const { accessToken } = useAuth();
  const { showToast } = useAlert();
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [reviews, setReviews] = useState<PlatformReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = accessToken || localStorage.getItem("paintit_access_token") || "";
        
        // 1. Fetch dashboard metrics
        const res = await fetch(`${BACKEND_API_URL}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch analytics metrics");
        const json = await res.json();
        setData(json);

        // 2. Fetch platform reviews
        const reviewsRes = await fetch(`${BACKEND_API_URL}/api/platform-reviews`);
        if (reviewsRes.ok) {
          const reviewsJson = await reviewsRes.json();
          setReviews(reviewsJson.reviews || []);
        }
      } catch (err: any) {
        console.error(err);
        showToast({ message: "⚠️ Could not sync admin metrics directory.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [accessToken, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-xs font-mono uppercase tracking-[0.2em] text-neutral-450">
        ⚡ Initializing Analytics Engine...
      </div>
    );
  }

  const summary = data?.summary || { totalVisits: 0, avgDurationSeconds: 0, identifiedVisitors: 0, waitlistCount: 0 };
  const roles = data?.rolesBreakdown || [];
  const sessions = data?.sessions || [];
  const interactions = data?.interactions || [];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-neutral-950 min-h-screen">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-100">📊 Platform Analytics</h1>
        <p className="text-xs text-neutral-500 font-medium mt-1">
          Monitor real-time engagement timelines, user cohorts, and performance feedback logs.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Site Visits</span>
          <span className="text-3xl font-black text-neutral-100 mt-2">{summary.totalVisits}</span>
          <span className="text-[9px] text-emerald-450 mt-1 font-mono">⚡ Running sessions</span>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Avg. Visit Duration</span>
          <span className="text-3xl font-black text-neutral-100 mt-2">
            {Math.round(summary.avgDurationSeconds)}s
          </span>
          <span className="text-[9px] text-neutral-500 mt-1 font-mono">⏱️ Smooth heartbeat avg</span>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Identified Contacts</span>
          <span className="text-3xl font-black text-neutral-100 mt-2">{summary.identifiedVisitors}</span>
          <span className="text-[9px] text-cyan-400 mt-1 font-mono">👥 Accounts linked</span>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Early Access Waitlist</span>
          <span className="text-3xl font-black text-neutral-100 mt-2">{summary.waitlistCount}</span>
          <span className="text-[9px] text-amber-500 mt-1 font-mono">⏳ Private beta signups</span>
        </div>
      </div>

      {/* Breakdown by Roles */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl">
        <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-4">👥 Registered Cohort Roles</h3>
        {roles.length === 0 ? (
          <p className="text-[11px] text-neutral-500 font-mono">No registered users in system database.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {roles.map((r) => (
              <div key={r.role} className="bg-neutral-950 p-4 border border-neutral-850 rounded-xl text-center">
                <span className="text-[9px] font-mono text-neutral-500 uppercase block">{r.role}</span>
                <span className="text-xl font-black text-white mt-1 block">{r.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Visitor Sessions Log */}
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-4">⏱️ Active Session Heartbeats</h3>
          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-[9px] uppercase tracking-wider text-neutral-500">
                  <th className="pb-2">Token / Client</th>
                  <th className="pb-2">Device</th>
                  <th className="pb-2">Section</th>
                  <th className="pb-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40">
                {sessions.map((s) => (
                  <tr key={s.id} className="text-[10px] font-mono text-neutral-350">
                    <td className="py-2.5 max-w-[150px] truncate">
                      {s.email ? (
                        <span className="text-cyan-400 font-bold">{s.email}</span>
                      ) : (
                        <span className="text-neutral-500">{s.visitor_token.slice(0, 12)}...</span>
                      )}
                    </td>
                    <td className="py-2.5 uppercase">{s.device_type}</td>
                    <td className="py-2.5 text-neutral-400">{s.most_visited_section}</td>
                    <td className="py-2.5 text-right font-bold text-neutral-100">{s.duration_seconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Interactions Log */}
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-4">⚡ Client Interaction Stream</h3>
          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-[9px] uppercase tracking-wider text-neutral-500">
                  <th className="pb-2">Interaction Type</th>
                  <th className="pb-2">Target Painter</th>
                  <th className="pb-2">Client Device</th>
                  <th className="pb-2 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40">
                {interactions.map((i) => (
                  <tr key={i.id} className="text-[10px] font-mono text-neutral-350">
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 rounded text-[9px] uppercase font-bold text-emerald-450">
                        {i.interaction_type}
                      </span>
                    </td>
                    <td className="py-2.5 text-neutral-400">{i.painter_name || "Platform-wide"}</td>
                    <td className="py-2.5 text-neutral-500">{i.visitor_token?.slice(0, 10)}...</td>
                    <td className="py-2.5 text-right text-neutral-600">
                      {new Date(i.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Platform Feedback Reviews Section */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl">
        <h3 className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-4">💬 Platform Feedback & Reviews</h3>
        {reviews.length === 0 ? (
          <div className="text-center py-10 text-neutral-500 text-xs">
            No feedback entries registered yet. Use the public feedback API to submit reviews.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 bg-neutral-950 border border-neutral-850 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-200">{r.reviewer_name}</span>
                  <span className="text-[10px] text-amber-500 font-bold">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-450 leading-relaxed font-sans">{r.feedback}</p>
                <div className="text-[9px] text-neutral-600 font-mono text-right">
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
