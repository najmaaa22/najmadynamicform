export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';

export interface FormField {
  id: string;
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
  description: string;
  isQuiz: boolean;
  version: number;
  fields: FormField[];
  createdBy: string | User;
  allowedUsers: string[] | User[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  _id: string;
  formId: string;
  formVersion: number;
  userId: User;
  answers: Record<string, any>;
  score?: number;
  totalScore?: number;
  correctAnswers?: Array<{
    questionId: string;
    isCorrect: boolean;
    userAnswer: any;
    correctAnswer: any;
  }>;
  submittedAt: string;
  updatedAt?: string;
}