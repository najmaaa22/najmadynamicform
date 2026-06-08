'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import { FormField } from "@/types/form";
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

const FormBuilder: React.FC<FormBuilderProps> = ({
  initialData,
  onSubmit,
  users = [],
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isQuiz, setIsQuiz] = useState(initialData?.isQuiz || false);

  const [fields, setFields] = useState<FormField[]>(
    initialData?.fields || []
  );

  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>(
    initialData?.allowedUsers
      ?.map((id: string) => users.find((u) => u.value === id))
      .filter(Boolean) || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ➜ ADD FIELD
  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: "New Question",
      type: "text",
      required: false,
      options: [],
    };

    setFields([...fields, newField]);
  };

  // ➜ UPDATE FIELD
  const updateField = (index: number, updates: Partial<FormField>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  // ➜ REMOVE FIELD
  const removeField = (index: number) => {
    if (confirm('Delete this question?')) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  // ➜ DUPLICATE FIELD
  const duplicateField = (index: number) => {
    const copy: FormField = {
      ...fields[index],
      id: `field_${Date.now()}`,
    };

    const updated = [...fields];
    updated.splice(index + 1, 0, copy);
    setFields(updated);
  };

  // ➜ SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        title,
        description,
        isQuiz,
        fields,
        allowedUsers: selectedUsers.map((u) => u.value),
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

      {/* FORM INFO */}
      <div className="space-y-4">

        <Input
          label="Form Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Description"
          className="w-full px-3 py-2 border rounded-lg"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isQuiz}
            onChange={(e) => setIsQuiz(e.target.checked)}
          />
          Enable Quiz Mode
        </label>

        <Select
          isMulti
          options={users}
          value={selectedUsers}
          onChange={(selected) =>
            setSelectedUsers((selected as UserOption[]) || [])
          }
        />
      </div>

      {/* QUESTIONS */}
      <div>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Questions</h3>

          <Button type="button" onClick={addField}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {fields.length === 0 && (
          <p className="text-gray-500 mt-4">No questions added</p>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 rounded-lg mt-4">

            <div className="flex justify-between">
              <span>Q{index + 1}</span>

              <div className="flex gap-2">
                <button type="button" onClick={() => duplicateField(index)}>
                  <Copy size={16} />
                </button>

                <button type="button" onClick={() => removeField(index)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <Input
              value={field.label}
              onChange={(e) =>
                updateField(index, { label: e.target.value })
              }
            />

            <select
              value={field.type}
              onChange={(e) =>
                updateField(index, { type: e.target.value as any })
              }
              className="border p-2 mt-2 w-full"
            >
              {fieldTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) =>
                  updateField(index, { required: e.target.checked })
                }
              />
              Required
            </label>

            {(field.type === 'select' ||
              field.type === 'radio' ||
              field.type === 'checkbox') && (
              <Input
                value={field.options?.join(', ') || ''}
                onChange={(e) =>
                  updateField(index, {
                    options: e.target.value.split(',').map((s) => s.trim()),
                  })
                }
                placeholder="Option1, Option2"
              />
            )}
          </div>
        ))}
      </div>

      {/* SUBMIT */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Form'}
        </Button>
      </div>
    </form>
  );
};

export default FormBuilder;