export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date";

export interface FormField {
  id: string; // frontend standard
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  correctAnswer?: string | string[];
}

export interface Form {
  _id: string;
  title: string;
  description?: string;
  isQuiz: boolean;
  version: number;
  fields: FormField[];
  createdBy: string;
  allowedUsers: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}