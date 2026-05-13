export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date";

export interface FormField {
  id: string; 
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

export interface FormSchema {
  _id: string;
  formGroupId?: string; 
  
  title: string;
  description: string;
  isQuiz: boolean;
  version: number; 
  fields: FormField[];
  isActive?: boolean;
}