import mongoose, { Document, Schema } from "mongoose";

export interface IResponse extends Document {
  formId: mongoose.Types.ObjectId; 
  formGroupId: string;             
  version: number;
  answers: Record<string, any>;
  score?: {
    obtained: number;
    total: number;
    breakdown: {                  
      fieldId: string;
      isCorrect: boolean;
    }[];
  };
  submittedBy?: mongoose.Types.ObjectId; 
  submittedAt: Date;
}

const responseSchema = new Schema<IResponse>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
      index: true,
    },

    formGroupId: {
      type: String,
      required: true,
      index: true,
    },

    version: {
      type: Number,
      required: true,
    },

    answers: {
      type: Schema.Types.Mixed,
      required: true,
    },

    score: {
      obtained: { type: Number },
      total: { type: Number },
      breakdown: [
        {
          fieldId: { type: String },
          isCorrect: { type: Boolean },
          _id: false,
        },
      ],
    },

    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


responseSchema.index({ formId: 1, submittedAt: -1 });
responseSchema.index({ formGroupId: 1, version: 1 });

export const Response =
  mongoose.models.Response ||
  mongoose.model<IResponse>("Response", responseSchema);