export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date";

export interface FormField {
  fieldId: string;

  label: string;

  type: FieldType;

  required: boolean;

  options?: string[];

  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };

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