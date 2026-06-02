'use client';

import React, { useEffect, useState } from 'react';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import RawResponseTable from '@/components/admin/RawResponseTable';
import NoiseOverlay from '@/components/ui/NoiseOverlay';
import { AnalyticsSummary, SurveySubmission } from '@/types/feedback';

// Explicitly blueprint the API return data structure to eliminate any typing leaks
interface AnalyticsPayload {
  summary: AnalyticsSummary;
  rawResponses: SurveySubmission[];
}

export default function AdminSurveyResultsPage() {
  // Swapped <any> for strict contract structure interface declarations
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadMetrics() {
      try {
        const res = await fetch('/api/survey/analytics');
        if (res.ok) {
          const payload: AnalyticsPayload = await res.json();
          if (isMounted) {
            setData(payload);
          }
        }
      } catch (err) {
        console.error('Metrics extraction connection failure:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMetrics();

    // Cleanup hook safely sets reference flags on unmount to suppress race alerts
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="w-full min-h-screen bg-black text-white p-6 sm:p-12 relative antialiased">
      <NoiseOverlay />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Editorial Heading Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-8">
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em] text-neutral-500 uppercase">Core Data Telemetry Panel</span>
            <h1 className="text-3xl font-serif text-white tracking-tight mt-1">PaintIt // Market Validation Control</h1>
          </div>
          <div className="text-xs font-mono text-neutral-500 bg-neutral-950 px-4 py-2 border border-neutral-900 rounded-lg">
            SYSTEM ENGINE SECURE STATUS: OK
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center font-mono text-xs text-neutral-500 tracking-widest animate-pulse">
            COMPILING RUNTIME MATRIX AGGREGATIONS...
          </div>
        ) : data ? (
          <>
            <AnalyticsDashboard data={data.summary} />
            <RawResponseTable submissions={data.rawResponses} />
          </>
        ) : (
          <div className="text-center font-mono text-xs text-red-500 py-12">
            CRITICAL EXCEPTION: Data delivery stream unestablished. Verify DB connection.
          </div>
        )}
      </div>
    </main>
  );
}