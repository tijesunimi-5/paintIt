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

// export interface InboundLead {
//   _id: string;
//   client_name: string;
//   client_email: string;
//   client_phone: string;
//   project_description: string;
//   roomColors?: Record<string, string>;
//   conversion_source:
//     | "DESIGN_FEEDBACK"
//     | "CLIENT_POPUP"
//     | "POPUP_CAPTURE"
//     | "OTHER";
//   created_at: string;
//   isLocked: boolean;
// }
export interface InboundLead {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  project_description: string;
  conversion_source: string;
  created_at: string;
  isLocked?: boolean;
  roomColors?: Record<string, string> | null;
}
