export type UserRole = 'painter' | 'designer' | 'homeowner' | 'student_renter' | 'other';

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  earlyAccess: boolean;
}

export interface SurveySubmission {
  _id?: string;
  role: UserRole;
  responses: Record<string, string | string[]>;
  contact?: ContactInfo;
  createdAt?: string;
}

export interface AnalyticsSummary {
  totalResponses: number;
  byRole: { name: string; value: number }[];
  mostRequestedFeatures: { name: string; value: number }[];
  biggestProblemsCount: { word: string; count: number }[];
  willingnessToPay: { name: string; value: number }[];
  pricingPreferences: { name: string; value: number }[];
}