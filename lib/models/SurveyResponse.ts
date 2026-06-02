import mongoose, { Schema, Document } from "mongoose";

export interface ISurveyResponse extends Document {
  role: string;
  responses: Map<string, Schema.Types.Mixed>;
  contact?: {
    name: string;
    email: string;
    phone: string;
    earlyAccess: boolean;
  };
  createdAt: Date;
}

const SurveyResponseSchema = new Schema<ISurveyResponse>({
  role: { type: String, required: true, index: true },
  responses: { type: Map, of: Schema.Types.Mixed, required: true },
  contact: {
    name: { type: String, default: "" },
    email: { type: String, default: "", index: true },
    phone: { type: String, default: "" },
    earlyAccess: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now, index: true },
});

export default mongoose.models.SurveyResponse ||
  mongoose.model<ISurveyResponse>("SurveyResponse", SurveyResponseSchema);
