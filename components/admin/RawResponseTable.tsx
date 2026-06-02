'use client';

import React, { useState } from 'react';
import { SurveySubmission } from '@/types/feedback';

interface RawResponseTableProps {
  submissions: SurveySubmission[];
}

// Global dictionary map to translate structural schema question IDs into human sentences instantly
const questionDictionary: Record<string, string> = {
  // Homeowner Array
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

  // Painter Array
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

  // Interior Designer Array
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
  // Keep track of which response row is currently expanded for deep-dive reading
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleRowExpansion = (id: string) => {
    setExpandedRowId(prev => (prev === id ? null : id));
  };

  return (
    <div className="bg-neutral-950 border border-neutral-900 rounded-xl overflow-hidden font-sans text-xs text-neutral-300 select-none">
      <div className="p-5 bg-neutral-900/40 border-b border-neutral-800 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-white tracking-tight">Active User Feedback Ledger</h3>
          <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mt-0.5">Click any row to view full questions & responses</p>
        </div>
        <span className="text-[10px] bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800 font-mono text-neutral-400">
          COUNT: {submissions.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-900 text-neutral-500 bg-black/40 font-mono text-[10px] uppercase tracking-wider">
              <th className="p-4 font-medium w-32">Timestamp</th>
              <th className="p-4 font-medium w-40">Target Role</th>
              <th className="p-4 font-medium w-48">Contact Profile</th>
              <th className="p-4 font-medium">Quick Preview Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900/30">
            {submissions.map((row, index) => {
              const uniqueId = row._id || `fallback-row-id-${index}`;
              const isExpanded = expandedRowId === uniqueId;
              const formattedDate = row.createdAt 
                ? new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                : 'N/A';

              // Flatten responses object keys for the quick text preview block
              const responsesKeys = row.responses ? Object.keys(row.responses) : [];
              const responsesPreviewText = responsesKeys.length > 0 
                ? `${responsesKeys.length} Questions Answered` 
                : 'Empty submission context';

              return (
                <React.Fragment key={uniqueId}>
                  {/* MAIN SUMMARY ROW CLICK TRACER */}
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
                      <span className="text-xs uppercase font-semibold tracking-tight text-neutral-200 bg-neutral-900 px-2.5 py-1 border border-neutral-800/80 rounded-md">
                        {row.role ? row.role.replace('_', ' ') : 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {row.contact?.email ? (
                        <div>
                          <div className="text-white font-medium text-xs">{row.contact.name || 'Anonymous'}</div>
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{row.contact.email}</div>
                        </div>
                  ) : (
                        <span className="text-neutral-600 italic font-mono text-[11px]">No Profile Provided</span>
                  )}
                </td>
                    <td className="p-4 text-neutral-400 font-light truncate max-w-xs sm:max-w-none">
                      <span className="flex items-center gap-2">
                        <span>{responsesPreviewText}</span>
                        <span className="text-neutral-600 text-[10px]">{isExpanded ? '▲ Collapse' : '▼ Expand to Read'}</span>
                      </span>
                </td>
              </tr>

                  {/* DEEP INSPECTION DRAWER INTERFACE PANEL */}
                  {isExpanded && (
                    <tr className="bg-neutral-950/80 border-t border-neutral-900">
                      <td colSpan={4} className="p-6 bg-neutral-950/40">
                        <div className="space-y-4 max-w-3xl ml-4 border-l border-neutral-800 pl-6 py-2">
                          <h4 className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-4">Complete Answers Log Matrix</h4>
                          
                          {row.responses && Object.entries(row.responses).map(([questionId, answer]) => {
                            const humanQuestionText = questionDictionary[questionId] || `Question Reference [${questionId}]`;
                            const formattedAnswer = Array.isArray(answer) ? answer.join(', ') : answer;

                            return (
                              <div key={questionId} className="space-y-1.5 pb-2 border-b border-neutral-900/40 last:border-0">
                                <p className="text-xs font-medium text-neutral-400">
                                  ❓ {humanQuestionText}
                                </p>
                                <p className="text-xs text-white font-light pl-5 leading-relaxed">
                                  👉 <span className="bg-neutral-900/80 text-neutral-200 border border-neutral-800 px-2 py-0.5 rounded italic">{formattedAnswer || 'Left blank'}</span>
                                </p>
                              </div>
                            );
                          })}

                          {(!row.responses || Object.keys(row.responses).length === 0) && (
                            <p className="text-neutral-600 italic">No structured response keys parsed for this entry packet.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-neutral-600 italic font-mono">
                  No telemetry feedback records found in DB ledger.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}