'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import ProgressBar from '../ui/ProgressBar';
import SurveyStepWrapper from './SurveyStepWrapper';
import RoleSelector from './RoleSelector';
import FormControls from './FormControls';
import { UserRole } from '@/types/feedback';

const LOCAL_STORAGE_KEY = 'paintit_survey_draft';

type SurveyResponsesState = Record<string, string | string[]>;

interface ContactState {
  name: string;
  email: string;
  phone: string;
  earlyAccess: boolean;
}

function getLocalStorageDraft() {
  if (typeof window === 'undefined') return null;
  const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!savedDraft) return null;
  try {
    return JSON.parse(savedDraft);
  } catch (e) {
    console.error('Error parsing draft data state matrices', e);
    return null;
  }
}

export default function SurveyContainer() {
  const [role, setRole] = useState<UserRole | null>(() => {
    const draft = getLocalStorageDraft();
    return draft?.role || null;
  });

  const [step, setStep] = useState<number>(() => {
    const draft = getLocalStorageDraft();
    return typeof draft?.step === 'number' ? draft.step : 0;
  });

  const [responses, setResponses] = useState<SurveyResponsesState>(() => {
    const draft = getLocalStorageDraft();
    return draft?.responses || {};
  });

  const [contact, setContact] = useState<ContactState>(() => {
    const draft = getLocalStorageDraft();
    return draft?.contact || { name: '', email: '', phone: '', earlyAccess: false };
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (role || Object.keys(responses).length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ role, step, responses, contact }));
    }
  }, [role, step, responses, contact]);

  const handleToggleFeatureSelection = (questionId: string, feature: string) => {
    const currentSelections = (responses[questionId] as string[]) || [];
    if (currentSelections.includes(feature)) {
      setResponses((prev: SurveyResponsesState) => ({
        ...prev,
        [questionId]: currentSelections.filter(f => f !== feature)
      }));
    } else {
      setResponses((prev: SurveyResponsesState) => ({
        ...prev,
        [questionId]: [...currentSelections, feature]
      }));
    }
  };

  const handleClearDraftAndReset = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setRole(null);
    setStep(0);
    setResponses({});
    setContact({ name: '', email: '', phone: '', earlyAccess: false });
    setIsSubmitted(false);
  };

  const executeFinalSubmission = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, responses, contact }),
      });
      if (res.ok) {
        setIsSubmitted(true);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Submission metrics failure pipeline drop', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const homeownerQuestions = useMemo(() => [
    { id: 'ho_q1', type: 'radio', question: 'Have you ever painted or redesigned a room before?', options: ['Yes', 'No'] },
    { id: 'ho_q2', type: 'radio', question: 'How difficult was choosing the right colors?', options: ['Very Difficult', 'Difficult', 'Neutral', 'Easy'] },
    { id: 'ho_q3', type: 'radio', question: 'Have you ever worried that a color might look different on the wall than you imagined?', options: ['Yes', 'No'] },
    { id: 'ho_q4', type: 'radio', question: 'Would seeing the room before painting help you feel more confident?', options: ['Yes', 'No', 'Maybe'] },
    { id: 'ho_q5', type: 'textarea', question: 'After trying the PaintIt demo, what was your first impression?' },
    { id: 'ho_q6', type: 'textarea', question: 'What did you like most?' },
    { id: 'ho_q7', type: 'textarea', question: 'What felt missing or confusing?' },
    { id: 'ho_q8', type: 'multiselect', question: 'Which features would you love to have?', options: ['Furniture', 'Beds', 'Curtains', 'Mirrors', 'Wardrobes', 'TV', 'Lighting', 'Wallpapers', 'Paint Patterns', 'Upload My Room Photo', 'AI Suggestions', 'Other'] },
    { id: 'ho_q9', type: 'radio', question: 'If a painter offered this before painting began, would it increase your confidence in them?', options: ['Yes', 'No', 'Maybe'] },
    { id: 'ho_q10', type: 'radio', question: 'Would this help you make decisions faster?', options: ['Yes', 'No', 'Maybe'] },
    { id: 'ho_q11', type: 'textarea', question: "Anything else you'd love PaintIt to do?" }
  ], []);

  const painterQuestions = useMemo(() => [
    { id: 'pa_q1', type: 'radio', question: 'How long have you been working as a painter?', options: ['Less than 1 year', '1–3 years', '3–5 years', '5+ years'] },
    { id: 'pa_q2', type: 'radio', question: 'Do clients struggle to choose colors?', options: ['Often', 'Sometimes', 'Rarely', 'Never'] },
    { id: 'pa_q3', type: 'radio', question: 'Do clients ever change their minds after work begins?', options: ['Often', 'Sometimes', 'Rarely', 'Never'] },
    { id: 'pa_q4', type: 'textarea', question: 'What is your biggest challenge when dealing with clients?' },
    { id: 'pa_q5', type: 'radio', question: 'After trying PaintIt, do you think it could help your business?', options: ['Yes', 'No', 'Maybe'] },
    { id: 'pa_q6', type: 'textarea', question: 'How do you think it would help?' },
    { id: 'pa_q7', type: 'radio', question: 'Would you use this during discussions with clients?', options: ['Yes', 'No', 'Maybe'] },
    { id: 'pa_q8', type: 'radio', question: 'Would it make your service appear more professional?', options: ['Yes', 'No', 'Maybe'] },
    { id: 'pa_q9', type: 'textarea', question: 'What features would make this genuinely useful for your business?' },
    { id: 'pa_q10', type: 'radio', question: 'How important would a tool like PaintIt be to your business?', options: ['Not important', 'Slightly important', 'Moderately important', 'Very important', 'Essential'] },
    { id: 'pa_q11', type: 'textarea', question: 'What would make PaintIt valuable enough for you to pay for?' },
    { 
      id: 'pa_q12', 
      type: 'radio', 
      question: 'If PaintIt helped you close more jobs, reduce client confusion, and make your service appear more professional, how would you prefer to pay?', 
      options: ['Per client/project', 'Monthly subscription', 'Annual subscription', 'One-time payment', 'Not sure yet'] 
    },
    { 
      id: 'pa_q13', 
      type: 'radio', 
      question: 'If PaintIt saved you time and helped you win more clients, would you be interested in becoming an early user?', 
      options: ['Yes', 'Maybe', 'No'] 
    },
    { 
      id: 'pa_q14', 
      type: 'radio', 
      question: 'Would you like to join the early access list and receive founder pricing when PaintIt launches?', 
      options: ['Yes', 'No'] 
    }
  ], []);

  const designerQuestions = useMemo(() => [
    { id: 'de_q1', type: 'textarea', question: 'How long have you worked as an interior designer?' },
    { id: 'de_q2', type: 'radio', question: 'Do clients struggle to visualize your ideas?', options: ['Often', 'Sometimes', 'Rarely', 'Never'] },
    { id: 'de_q3', type: 'radio', question: 'Would room visualization help you present concepts more effectively?', options: ['Yes', 'No', 'Maybe'] },
    { id: 'de_q4', type: 'radio', question: 'Would furniture placement tools be useful?', options: ['Yes', 'No', 'Maybe'] },
    { id: 'de_q5', type: 'radio', question: 'Would material previews help your workflow?', options: ['Yes', 'No', 'Maybe'] },
    { id: 'de_q6', type: 'radio', question: 'Would client-uploaded room photos be useful?', options: ['Yes', 'No', 'Maybe'] },
    { id: 'de_q7', type: 'radio', question: 'Would AI-generated design suggestions be valuable?', options: ['Yes', 'No', 'Maybe'] },
    { id: 'de_q8', type: 'textarea', question: 'What is your biggest challenge when working with clients?' },
    { id: 'de_q9', type: 'textarea', question: 'What features would make PaintIt indispensable for your work?' },
    { id: 'de_q10', type: 'radio', question: 'How important would a tool like PaintIt be to your business?', options: ['Not important', 'Slightly important', 'Moderately important', 'Very important', 'Essential'] },
    { id: 'de_q11', type: 'textarea', question: 'What would make PaintIt valuable enough for you to pay for?' },
    { 
      id: 'de_q12', 
      type: 'radio', 
      question: 'If PaintIt helped you close more jobs, reduce client confusion, and make your service appear more professional, how would you prefer to pay?', 
      options: ['Per client/project', 'Monthly subscription', 'Annual subscription', 'One-time payment', 'Not sure yet'] 
    },
    { 
      id: 'de_q13', 
      type: 'radio', 
      question: 'If PaintIt saved you time and helped you win more clients, would you be interested in becoming an early user?', 
      options: ['Yes', 'Maybe', 'No'] 
    },
    { 
      id: 'de_q14', 
      type: 'radio', 
      question: 'Would you like to join the early access list and receive founder pricing when PaintIt launches?', 
      options: ['Yes', 'No'] 
    }
  ], []);

  const targetedQuestions = useMemo(() => {
    if (role === 'painter') return painterQuestions;
    if (role === 'designer') return designerQuestions;
    return homeownerQuestions;
  }, [role, painterQuestions, designerQuestions, homeownerQuestions]);

  const totalStepsCount = targetedQuestions.length + 2;
  const activeQuestion = step > 0 && step <= targetedQuestions.length ? targetedQuestions[step - 1] : null;

  const isNextDisabled = () => {
    if (step === 0 && !role) return true;
    if (activeQuestion) {
      const response = responses[activeQuestion.id];
      if (activeQuestion.type === 'textarea') {
        return !response || (response as string).trim() === '';
      }
      if (activeQuestion.type === 'multiselect') {
        return !response || (response as string[]).length === 0;
      }
      return !response;
    }
    return false;
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-neutral-950/40 border border-neutral-900 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
      <ProgressBar currentStep={step} totalSteps={totalStepsCount} />

      <div className="p-8 sm:p-12 min-h-105 flex flex-col justify-between">
        <form onSubmit={(e) => e.preventDefault()}>
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-200">✓</div>
                <h3 className="text-xl font-serif text-white tracking-tight">Thank you for your feedback</h3>
                <p className="text-sm text-neutral-400 font-light max-w-sm mx-auto leading-relaxed">Your data directly shapes the core development vector for the PaintIt platform matrix.</p>
                <button type="button" onClick={handleClearDraftAndReset} className="text-xs text-neutral-500 font-mono hover:text-white pt-6 transition-colors focus:outline-none">
                  SUBMIT ANOTHER RESPONSE
                </button>
              </div>
            ) : step === 0 ? (
              <SurveyStepWrapper stepKey="step0">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Step 01 // Demographics</span>
                  <h3 className="text-xl font-medium text-white tracking-tight mt-1">Who are you?</h3>
                </div>
                <RoleSelector activeRole={role} onSelectRole={(r) => { setRole(r); setStep(1); }} />
              </SurveyStepWrapper>
            ) : activeQuestion ? (
              <SurveyStepWrapper stepKey={activeQuestion.id}>
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Question {step} of {targetedQuestions.length}</span>
                  <h3 className="text-base sm:text-lg font-light text-neutral-100 leading-snug mt-1">{activeQuestion.question}</h3>
                </div>

                {activeQuestion.type === 'radio' && (
                  <div className="space-y-2">
                    {activeQuestion.options?.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => setResponses((prev: SurveyResponsesState) => ({ ...prev, [activeQuestion.id]: opt }))}
                        className={`p-3.5 rounded-xl border text-sm cursor-pointer transition-all ${responses[activeQuestion.id] === opt ? 'bg-white border-white text-black font-medium' : 'bg-neutral-900/30 border-neutral-900 text-neutral-400 hover:border-neutral-800'}`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}

                {activeQuestion.type === 'multiselect' && (
                  <div className="grid grid-cols-2 gap-2">
                    {activeQuestion.options?.map((opt) => {
                      const isSelected = ((responses[activeQuestion.id] as string[]) || []).includes(opt);
                      return (
                        <div
                          key={opt}
                          onClick={() => handleToggleFeatureSelection(activeQuestion.id, opt)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${isSelected ? 'bg-neutral-200 border-neutral-200 text-black font-semibold' : 'bg-neutral-900/30 border-neutral-900 text-neutral-400 hover:border-neutral-800'}`}
                        >
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeQuestion.type === 'textarea' && (
                  <textarea
                    value={(responses[activeQuestion.id] as string) || ''}
                    onChange={(e) => setResponses((prev: SurveyResponsesState) => ({ ...prev, [activeQuestion.id]: e.target.value }))}
                    className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-neutral-700 font-light resize-none placeholder-neutral-600"
                    placeholder="Type your authentic response here..."
                  />
                )}
              </SurveyStepWrapper>
            ) : (
              <SurveyStepWrapper stepKey="contact">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Finalization Matrix</span>
                  <h3 className="text-xl font-medium text-white tracking-tight mt-1">Optional Contact Profile</h3>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={contact.name}
                    onChange={(e) => setContact((prev: ContactState) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-900 focus:border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={contact.email}
                    onChange={(e) => setContact((prev: ContactState) => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-900 focus:border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={contact.phone}
                    onChange={(e) => setContact((prev: ContactState) => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-neutral-900 border border-neutral-900 focus:border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                  />
                  <label className="flex items-start gap-3 pt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={contact.earlyAccess}
                      onChange={(e) => setContact((prev: ContactState) => ({ ...prev, earlyAccess: e.target.checked }))}
                      className="w-4 h-4 rounded mt-0.5 accent-white bg-neutral-900 border-neutral-800"
                    />
                    <span className="text-xs text-neutral-400 font-light leading-snug">I&apos;d like to reserve guaranteed early access priority paths when PaintIt launches updates.</span>
                  </label>
                </div>
              </SurveyStepWrapper>
            )}
          </AnimatePresence>
        </form>

        {!isSubmitted && (
          <FormControls
            currentStep={step}
            totalSteps={totalStepsCount}
            onBack={() => setStep(prev => Math.max(0, prev - 1))}
            onNext={() => setStep(prev => prev + 1)}
            onSubmit={executeFinalSubmission}
            isNextDisabled={isNextDisabled()}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
