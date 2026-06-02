'use client';

import React from 'react';
import { SurveySubmission } from '@/types/feedback';

interface RawResponseTableProps {
  submissions: SurveySubmission[];
}

export default function RawResponseTable({ submissions }: RawResponseTableProps) {
  return (
    <div className="bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden font-mono text-xs text-neutral-300">
      <div className="p-4 bg-neutral-900/60 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider text-[10px]">
        Raw Submissions Matrix Ledger (Latest 100 Logs)
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-900 text-neutral-500 bg-black/40">
              <th className="p-4 font-medium">Timestamp</th>
              <th className="p-4 font-medium">Role Target</th>
              <th className="p-4 font-medium">Ident Profile (Contact)</th>
              <th className="p-4 font-medium">Captured Key Value Reponse Objects</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900/40">
            {submissions.map((row, index) => {
              // Ensure we have a bulletproof fallback key for key matching constraints
              const uniqueKey = row._id || `submission-fallback-key-${index}`;
              const formattedDate = row.createdAt
                ? new Date(row.createdAt).toISOString().split('T')[0]
                : 'N/A';

              return (
                <tr key={uniqueKey} className="hover:bg-neutral-900/20 transition-colors">
                  <td className="p-4 whitespace-nowrap text-neutral-500">
                    {formattedDate}
                  </td>
                  <td className="p-4 whitespace-nowrap uppercase tracking-tight text-neutral-200">
                    {row.role ? row.role.replace('_', ' ') : 'UNKNOWN'}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {row.contact?.email ? (
                      <div>
                        <div className="text-white font-sans">{row.contact.name || 'Anonymous'}</div>
                        <div className="text-[10px] text-neutral-500">{row.contact.email}</div>
                      </div>
                    ) : (
                      <span className="text-neutral-600 italic">No Ident Attached</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div
                      className="max-w-md overflow-hidden text-ellipsis whitespace-nowrap text-neutral-400 text-[11px]"
                      title={JSON.stringify(row.responses || {})}
                    >
                      {JSON.stringify(row.responses || {})}
                    </div>
                  </td>
                </tr>
              );
            })}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-neutral-600 italic">
                  No telemetry feedback records found in DB.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}