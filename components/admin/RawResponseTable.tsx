'use client';

import React, { useState } from 'react';
import { SurveySubmission } from '@/types/feedback';

interface RawResponseTableProps {
  submissions: SurveySubmission[];
}

type FilterCategory = 'all' | 'painter' | 'designer' | 'homeowner' | 'student_renter' | 'other';

const questionDictionary: Record<string, string> = {
  ho_q1: 'Have you ever painted or redesigned a room before?',
  ho_q2: 'How difficult was choosing the right colors?',
  ho_q3: 'Have you ever worried that a color might look different on the wall?',
  ho_q4: 'Would seeing the room before painting help you feel more confident?',
  ho_q5: 'After trying the PaintIt demo, what was your first impression?',
  ho_q6: 'What did you like most?',
  ho_q7: 'What felt missing or confusing?',
  ho_q8: 'Which features would you love to have?',
  ho_q9: 'If a painter offered this, would it increase your confidence in them?',
  ho_q10: 'Would this help you make decisions faster?',
  ho_q11: "Anything else you'd love PaintIt to do?",

  pa_q1: 'How long have you been working as a painter?',
  pa_q2: 'Do clients struggle to choose colors?',
  pa_q3: 'Do clients ever change their minds after work begins?',
  pa_q4: 'What is your biggest challenge when dealing with clients?',
  pa_q5: 'After trying PaintIt, do you think it could help your business?',
  pa_q6: 'How do you think it would help?',
  pa_q7: 'Would you use this during discussions with clients?',
  pa_q8: 'Would it make your service appear more professional?',
  pa_q9: 'What features would make this genuinely useful for your business?',
  pa_q10: 'If PaintIt helped you win more jobs, would you consider paying for it?',
  pa_q11: 'What would make PaintIt valuable enough for you to pay for?',
  pa_q12: 'Which investment plan makes the most sense for your business workflow?',
  pa_q13: 'Anything else you\'d like us to build?',

  de_q1: 'How long have you worked as an interior designer?',
  de_q2: 'Do clients struggle to visualize your ideas?',
  de_q3: 'Would room visualization help you present concepts more effectively?',
  de_q4: 'Would furniture placement tools be useful?',
  de_q5: 'Would material previews help your workflow?',
  de_q6: 'Would client-uploaded room photos be useful?',
  de_q7: 'Would AI-generated design suggestions be valuable?',
  de_q8: 'What is your biggest challenge when working with clients?',
  de_q9: 'What features would make PaintIt indispensable for your work?',
  de_q10: 'If PaintIt helped you communicate ideas faster, would you pay for it?',
  de_q11: 'What would make it worth paying for?',
  de_q12: 'Which investment plan makes the most sense for your design workflow?',
  de_q13: 'Anything else you\'d love to see?'
};

export default function RawResponseTable({ submissions }: RawResponseTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter logic based on the user's active demographic category tab
  const filteredSubmissions = submissions.filter(sub => {
    if (activeFilter === 'all') return true;
    return sub.role === activeFilter;
  });

  const toggleRowExpansion = (id: string) => {
    setExpandedRowId(prev => (prev === id ? null : id));
  };

  // Helper utility to safely manage clipboard actions across mobile/desktop browsers
  const handleSystemClipboardCopy = async (textToCopy: string, trackingId: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers or standard HTTP test spaces
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(trackingId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to capture string reference to clipboard', err);
    }
  };

  // Aggregates an entire submission row into a single beautifully structured text summary block
  const copyAllAnswersFromSubmission = (row: SurveySubmission, rowId: string) => {
    let outputText = `PAINTIT SURVEY REPORT\n`;
    outputText += `=====================\n`;
    outputText += `Role: ${(row.role || 'Unknown').toUpperCase().replace('_', ' ')}\n`;
    outputText += `Profile: ${row.contact?.name || 'Anonymous'} (${row.contact?.email || 'No email'})\n`;
    outputText += `Phone: ${row.contact?.phone || 'No phone'}\n`;
    outputText += `---------------------\n\n`;

    if (row.responses) {
      Object.entries(row.responses).forEach(([qId, ans]) => {
        const questionText = questionDictionary[qId] || `Question [${qId}]`;
        const ansText = Array.isArray(ans) ? ans.join(', ') : ans;
        outputText += `Q: ${questionText}\nA: ${ansText || 'Left blank'}\n\n`;
      });
    }

    handleSystemClipboardCopy(outputText, `all-${rowId}`);
  };

  return (
    <div className="bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden font-sans text-xs text-neutral-300 select-none">
      
      {/* 1. HEADER & CATEGORY TABS CONTAINER */}
      <div className="p-5 bg-neutral-900/40 border-b border-neutral-800 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-white tracking-tight">Active User Feedback Ledger</h3>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mt-0.5">Filter categories and tap rows to expand or copy results</p>
          </div>
          <span className="text-[10px] bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800 font-mono text-neutral-400">
            SHOWING: {filteredSubmissions.length} / {submissions.length}
          </span>
        </div>

        {/* Horizontal Category Filtering Tabs Tray - perfectly scrollable on small mobile layouts */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x mask-image">
          {(['all', 'painter', 'designer', 'homeowner', 'student_renter'] as FilterCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => { setActiveFilter(cat); setExpandedRowId(null); }}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono whitespace-nowrap uppercase tracking-tight transition-all duration-200 ${
                activeFilter === cat
                  ? 'bg-white border-white text-black font-semibold'
                  : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-white'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 2. RESPONSIVE TABLE MATRIX */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-900 text-neutral-500 bg-black/40 font-mono text-[10px] uppercase tracking-wider">
              <th className="p-4 font-medium w-28">Timestamp</th>
              <th className="p-4 font-medium w-36">Target Role</th>
              <th className="p-4 font-medium w-44">Contact Profile</th>
              <th className="p-4 font-medium">Responses Metrics & State Cues</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900/30">
            {filteredSubmissions.map((row, index) => {
              const uniqueId = row._id || `ledger-fallback-row-key-${index}`;
              const isExpanded = expandedRowId === uniqueId;
              const formattedDate = row.createdAt 
                ? new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                : 'N/A';

              const answeredCount = row.responses ? Object.keys(row.responses).length : 0;

              return (
                <React.Fragment key={uniqueId}>
                  {/* DATA OVERVIEW ROW PANEL */}
                  <tr 
                    onClick={() => toggleRowExpansion(uniqueId)}
                    className={`cursor-pointer transition-colors ${
                      isExpanded ? 'bg-neutral-900/40' : 'hover:bg-neutral-900/20'
                    }`}
                  >
                    <td className="p-4 whitespace-nowrap text-neutral-500 font-mono text-[11px]">
                      {formattedDate}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-[10px] uppercase font-mono font-semibold tracking-tight text-neutral-300 bg-neutral-900 px-2 py-0.5 border border-neutral-800 rounded">
                        {row.role ? row.role.replace('_', ' ') : 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {row.contact?.email ? (
                        <div className="max-w-[150px] truncate">
                          <div className="text-white font-medium text-xs truncate">{row.contact.name || 'Anonymous'}</div>
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">{row.contact.email}</div>
                        </div>
                      ) : (
                        <span className="text-neutral-600 italic font-mono text-[10px]">No Profile Attached</span>
                      )}
                    </td>
                    <td className="p-4 text-neutral-400 font-light truncate">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[11px] text-neutral-400 font-mono">{answeredCount} Ans Metrics</span>
                        <span className="text-neutral-600 text-[10px] font-mono mr-2">{isExpanded ? '▲ CLOSE' : '▼ EXPAND'}</span>
                      </div>
                    </td>
                  </tr>

                  {/* DEEP INTERFACE DRAWER PANEL */}
                  {isExpanded && (
                    <tr className="bg-neutral-950/80 border-t border-neutral-900">
                      <td colSpan={4} className="p-5 sm:p-6 bg-neutral-950/50">
                        <div className="max-w-3xl ml-2 sm:ml-4 border-l border-neutral-800 pl-4 sm:pl-6 py-1 space-y-5">
                          
                          {/* PANEL CONTROLS ELEMENT LAYER */}
                          <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
                            <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">Telemetry Expansion Core</span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); copyAllAnswersFromSubmission(row, uniqueId); }}
                              className="text-[10px] font-mono bg-neutral-900 px-3 py-1.5 border border-neutral-800 rounded-lg hover:border-neutral-600 text-neutral-200 transition-colors focus:outline-none"
                            >
                              {copiedId === `all-${uniqueId}` ? '📋 COMPLETE REPORT COPIED!' : '⚡ COPY ALL QUESTIONS & ANSWERS'}
                            </button>
                          </div>

                          {/* INTERACTIVE QUESTION LIST ENGINES */}
                          <div className="space-y-4">
                            {row.responses && Object.entries(row.responses).map(([questionId, answer]) => {
                              const humanQuestionText = questionDictionary[questionId] || `Question ID Matrix [${questionId}]`;
                              const formattedAnswer = Array.isArray(answer) ? answer.join(', ') : answer;
                              const individualCopyBlock = `Question: ${humanQuestionText}\nAnswer: ${formattedAnswer}`;
                              const trackingItemKey = `${uniqueId}-${questionId}`;

                              return (
                                <div key={questionId} className="group/item space-y-1.5 relative pb-1">
                                  <div className="flex justify-between items-start gap-4">
                                    <p className="text-xs font-medium text-neutral-400">
                                      ❓ {humanQuestionText}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleSystemClipboardCopy(individualCopyBlock, trackingItemKey); }}
                                      className="opacity-40 group-hover/item:opacity-100 text-[9px] font-mono text-neutral-500 hover:text-white px-1.5 py-0.5 bg-neutral-900 border border-neutral-800/80 rounded transition-all focus:outline-none"
                                    >
                                      {copiedId === trackingItemKey ? 'COPIED ✓' : 'COPY'}
                                    </button>
                                  </div>
                                  <p className="text-xs text-white font-light pl-4 leading-relaxed">
                                    👉 <span className="bg-neutral-900/60 text-neutral-200 border border-neutral-900/60 px-2 py-0.5 rounded italic font-sans">{formattedAnswer || 'Left blank'}</span>
                                  </p>
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {filteredSubmissions.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-neutral-600 italic font-mono">
                  No telemetry entries found for the selected filter category tab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}