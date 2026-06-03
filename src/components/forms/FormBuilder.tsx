'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Copy, GripVertical } from 'lucide-react';
import { FormField } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Select from 'react-select';

interface UserOption {
  value: string;
  label: string;
}

interface FormBuilderProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  users?: UserOption[];
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialData,
  onSubmit,
  users = [],
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [isQuiz, setIsQuiz] = useState(initialData?.isQuiz || false);

  const [fields, setFields] = useState<FormField[]>(
    initialData?.fields || []
  );

  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>(
    initialData?.allowedUsers
      ?.map((id: string) => users.find((u: UserOption) => u.value === id))
      .filter(Boolean) || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: 'New Question',
      type: 'text',
      required: false,
      options: [],
    };

    setFields([...fields, newField]);
  };

  const updateField = (
    index: number,
    updates: Partial<FormField>
  ) => {
    const updatedFields = [...fields];

    updatedFields[index] = {
      ...updatedFields[index],
      ...updates,
    };

    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const duplicateField = (index: number) => {
    const fieldToDuplicate = fields[index];

    const duplicatedField: FormField = {
      ...fieldToDuplicate,
      id: `field_${Date.now()}_${Math.random()}`,
    };

    const newFields = [...fields];

    newFields.splice(index + 1, 0, duplicatedField);

    setFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      await onSubmit({
        title,
        description,
        isQuiz,
        fields,
        allowedUsers: selectedUsers.map(
          (u: UserOption) => u.value
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldTypes = [
    { value: 'text', label: 'Short Answer' },
    { value: 'textarea', label: 'Paragraph' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Checkboxes' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Details */}
      <div className="space-y-4">
        <Input
          label="Form Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter form title"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Enter form description"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isQuiz"
            checked={isQuiz}
            onChange={(e) => setIsQuiz(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />

          <label
            htmlFor="isQuiz"
            className="text-sm font-medium text-gray-700"
          >
            Enable Quiz Mode
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Allow Access To (Users)
          </label>

          <Select
            isMulti
            options={users}
            value={selectedUsers}
            onChange={(selected) =>
              setSelectedUsers((selected as UserOption[]) || [])
            }
            placeholder="Select users..."
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Questions
          </h3>

          <Button type="button" onClick={addField}>
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </Button>
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">
              No questions added yet.
            </p>
          </div>
        )}

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border border-gray-200 rounded-lg p-4 bg-white space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-gray-400" />

                <span className="text-sm text-gray-500">
                  Question {index + 1}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => duplicateField(index)}
                  className="text-gray-500 hover:text-blue-600"
                >
                  <Copy className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <Input
              label="Question Text"
              value={field.label}
              onChange={(e) =>
                updateField(index, {
                  label: e.target.value,
                })
              }
              placeholder="Enter question"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type
                </label>

                <select
                  value={field.type}
                  onChange={(e) =>
                    updateField(index, {
                      type: e.target.value as FormField['type'],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {fieldTypes.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    updateField(index, {
                      required: e.target.checked,
                    })
                  }
                />

                <label className="text-sm text-gray-700">
                  Required
                </label>
              </div>
            </div>

            {(field.type === 'select' ||
              field.type === 'radio' ||
              field.type === 'checkbox') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Options
                </label>

                <Input
                  value={field.options?.join(', ') || ''}
                  onChange={(e) =>
                    updateField(index, {
                      options: e.target.value
                        .split(',')
                        .map((s) => s.trim()),
                    })
                  }
                  placeholder="Option1, Option2"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Separate options with commas
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Form'}
        </Button>
      </div>
    </form>
  );
};