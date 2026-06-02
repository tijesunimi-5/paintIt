'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AnalyticsSummary } from '@/types/feedback';

const METRIC_COLORS = ['#E6E6E6', '#CCCCCC', '#999999', '#666666', '#404040', '#1A1A1A'];

export default function AnalyticsDashboard({ data }: { data: AnalyticsSummary }) {
  return (
    <div className="space-y-10 select-none">

      {/* HIGH VISIBILITY SUMMARY MATRIX ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-900">
          <span className="text-[10px] font-mono tracking-wider text-neutral-500 uppercase">Gross Volume</span>
          <div className="text-4xl font-serif text-white mt-2">{data.totalResponses}</div>
          <p className="text-[11px] text-neutral-400 font-light mt-1">Verified unique feedback captures.</p>
        </div>
        <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-900">
          <span className="text-[10px] font-mono tracking-wider text-neutral-500 uppercase">Primary User Market</span>
          <div className="text-xl font-medium text-neutral-200 mt-3 truncate">
            {[...data.byRole].sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
          </div>
          <p className="text-[11px] text-neutral-500 font-light mt-1">Highest responsive user segment.</p>
        </div>
        <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-900">
          <span className="text-[10px] font-mono tracking-wider text-neutral-500 uppercase">Top Feature Vector</span>
          <div className="text-xl font-medium text-neutral-200 mt-3 truncate">
            {data.mostRequestedFeatures[0]?.name || 'N/A'}
          </div>
          <p className="text-[11px] text-neutral-500 font-light mt-1">Maximum multi-select frequency count.</p>
        </div>
      </div>

      {/* GRAPH CHART SPLIT ROW BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* CHART A: DEMOGRAPHICS SPLIT */}
        <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-900 space-y-4">
          <h4 className="text-sm font-mono text-neutral-400 uppercase tracking-widest">Responses By Role Matrix</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.byRole}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.byRole.map((entry, index) => (
                    <Cell key={`cell-${entry.name}-${index}`} fill={METRIC_COLORS[index % METRIC_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: '8px' }}
                  itemStyle={{ color: '#FFF', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-[11px] text-neutral-400">
            {data.byRole.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: METRIC_COLORS[idx % METRIC_COLORS.length] }} />
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART B: FEATURE DEMAND STACK RANKINGS */}
        <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-900 space-y-4">
          <h4 className="text-sm font-mono text-neutral-400 uppercase tracking-widest">Feature Demand Rankings</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.mostRequestedFeatures} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: '8px' }}
                  itemStyle={{ color: '#FFF', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#FFFFFF" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* CHART C: COMMERCIAL PRICING VALUE METRICS MATRICES */}
    {/* CHART C: COMMERCIAL PRICING VALUE METRICS MATRICES */}
<div className="bg-neutral-950 p-6 rounded-xl border border-neutral-900 space-y-4">
  <h4 className="text-sm font-mono text-neutral-400 uppercase tracking-widest">Willingness To Pay & Pricing Metrics</h4>
  <div className="h-48 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        // Inline map safely shortens long survey labels so the Recharts layout stays clean and premium
        data={data.pricingPreferences.map(item => ({
          ...item,
          name: item.name.includes('Pay-As-You-Go') 
            ? 'Pay-As-You-Go (Per Room)' 
            : item.name.split(' (')[0] // Trims off the descriptive text in parentheses
        }))} 
        layout="vertical"
      >
        <CartesianGrid stroke="#1F1F1F" horizontal={false} />
        <XAxis type="number" stroke="#525252" fontSize={10} />
        <YAxis dataKey="name" type="category" stroke="#525252" fontSize={10} width={140} tickLine={false} />
        <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #222' }} />
        <Bar dataKey="value" fill="#8C8C8C" radius={[0, 4, 4, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

    </div>
  );
}