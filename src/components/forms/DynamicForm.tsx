'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';
  required: boolean;
  options?: string[];
}

interface DynamicFormProps {
  fields: FormField[];
  onSubmit: (data: any) => Promise<void>;
  initialData?: Record<string, any>;
  isQuiz?: boolean;
  readOnly?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  initialData,
  isQuiz = false,
  readOnly = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {}
  });

  const renderField = (field: FormField) => {
    const commonProps = {
      ...register(field.id),
      disabled: readOnly || (isQuiz && !!initialData),
      className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} rows={4} />;
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select...</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(opt => (
              <label key={opt} className="flex items-center space-x-2">
                <input type="radio" value={opt} {...register(field.id)} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map(opt => (
              <label key={opt} className="flex items-center space-x-2">
                <input type="checkbox" value={opt} {...register(field.id)} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );
      default:
        return <input type={field.type} {...commonProps} />;
    }
  };

  return (
    <form onSubmit={handleSubmit(async (data) => {
      setIsSubmitting(true);
      await onSubmit(data);
      setIsSubmitting(false);
    })} className="space-y-6">
      {fields.map(field => (
        <div key={field.id}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.id] && (
            <p className="mt-1 text-sm text-red-600">
              {errors[field.id]?.message as string}
            </p>
          )}
        </div>
      ))}
      {!readOnly && (
        <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
          Submit
        </Button>
      )}
    </form>
  );
};

// ✅ Add this line at the bottom
export default DynamicForm;