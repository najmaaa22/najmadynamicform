'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Copy, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';

/* ---------------- TYPES ---------------- */

export type FormFieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date';

export interface FormField {
  fieldId: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  correctAnswer?: string | string[];
}

interface UserOption {
  value: string;
  label: string;
}

interface FormBuilderProps {
  initialData?: {
    title?: string;
    description?: string;
    isQuiz?: boolean;
    fields?: FormField[];
    allowedUsers?: string[];
  };
  onSubmit: (data: {
    title: string;
    description: string;
    isQuiz: boolean;
    fields: FormField[];
    allowedUsers: string[];
  }) => Promise<void>;
  users?: UserOption[];
}

/* ---------------- FIELD TYPE OPTIONS ---------------- */

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: 'text', label: 'Short Answer' },
  { value: 'textarea', label: 'Paragraph' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkboxes' },
];

const HAS_OPTIONS: FormFieldType[] = ['select', 'radio', 'checkbox'];

/* ---------------- MAIN COMPONENT ---------------- */

const FormBuilder: React.FC<FormBuilderProps> = ({
  initialData,
  onSubmit,
  users = [],
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isQuiz, setIsQuiz] = useState(initialData?.isQuiz || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fields, setFields] = useState<FormField[]>(
    initialData?.fields || []
  );

  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    initialData?.allowedUsers || []
  );

  const [userPopoverOpen, setUserPopoverOpen] = useState(false);

  /* ---- FIELD OPERATIONS ---- */

  const addField = () => {
    const newField: FormField = {
      fieldId: `field_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      options: [],
    };
    setFields((prev) => [...prev, newField]);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    setFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  const removeField = (index: number) => {
    if (confirm('Delete this question?')) {
      setFields((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const duplicateField = (index: number) => {
    const copy: FormField = {
      ...fields[index],
      fieldId: `field_${Date.now()}`,
    };
    setFields((prev) => {
      const updated = [...prev];
      updated.splice(index + 1, 0, copy);
      return updated;
    });
  };

  /* ---- OPTION OPERATIONS ---- */

  const addOption = (fieldIndex: number) => {
    const current = fields[fieldIndex].options || [];
    updateField(fieldIndex, { options: [...current, `Option ${current.length + 1}`] });
  };

  const updateOption = (fieldIndex: number, optIndex: number, value: string) => {
    const current = [...(fields[fieldIndex].options || [])];
    current[optIndex] = value;
    updateField(fieldIndex, { options: current });
  };

  const removeOption = (fieldIndex: number, optIndex: number) => {
    const current = fields[fieldIndex].options || [];
    updateField(fieldIndex, {
      options: current.filter((_, i) => i !== optIndex),
    });
  };

  /* ---- USER SELECTION ---- */

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  /* ---- SUBMIT ---- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Form title is required');
      return;
    }

    if (fields.length === 0) {
      alert('Add at least one question');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        isQuiz,
        fields,
        allowedUsers: selectedUsers,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">

      {/* ── FORM INFO ── */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="space-y-1">
          <Label htmlFor="form-title">
            Form Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="form-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Form"
            className="text-lg font-semibold"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="form-desc">Description</Label>
          <Textarea
            id="form-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Add a description..."
          />
        </div>

        {/* Quiz toggle */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Quiz Mode</p>
            <p className="text-xs text-muted-foreground">
              Enable to set correct answers and auto-score
            </p>
          </div>
          <Switch
            checked={isQuiz}
            onCheckedChange={(val) => {
              setIsQuiz(val);
              // Clear correctAnswers if turning off quiz mode
              if (!val) {
                setFields((prev) =>
                  prev.map((f) => ({ ...f, correctAnswer: undefined }))
                );
              }
            }}
          />
        </div>

        {/* Allowed users */}
        {users.length > 0 && (
          <div className="space-y-2">
            <Label>Who can access this form?</Label>

            <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
              <PopoverTrigger
                type="button"
                role="combobox"
                className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {selectedUsers.length > 0
                  ? `${selectedUsers.length} user(s) selected`
                  : 'Select users...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search users..." />
                  <CommandEmpty>No users found.</CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-auto">
                    {users.map((user) => (
                      <CommandItem
                        key={user.value}
                        onSelect={() => toggleUser(user.value)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedUsers.includes(user.value)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {user.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected user badges */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((uid) => {
                  const user = users.find((u) => u.value === uid);
                  return (
                    <Badge key={uid} variant="secondary" className="gap-1">
                      {user?.label || uid}
                      <button
                        type="button"
                        onClick={() => removeUser(uid)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── QUESTIONS ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Questions</h3>
          <Button type="button" onClick={addField} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </Button>
        </div>

        {fields.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground text-sm">
            No questions yet. Click &quot;Add Question&quot; to get started.
          </div>
        )}

        {fields.map((field, index) => (
          <div
            key={field.fieldId}
            className="rounded-xl border bg-card p-5 space-y-4"
          >
            {/* Question header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Q{index + 1}
              </span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => duplicateField(index)}
                  title="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                  onClick={() => removeField(index)}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Question label */}
            <div className="space-y-1">
              <Label>Question</Label>
              <Input
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                placeholder="Enter your question..."
              />
            </div>

            {/* Field type */}
            <div className="space-y-1">
              <Label>Answer Type</Label>
              <Select
                value={field.type}
                onValueChange={(val) =>
                  updateField(index, {
                    type: val as FormFieldType,
                    options: HAS_OPTIONS.includes(val as FormFieldType)
                      ? field.options?.length
                        ? field.options
                        : ['Option 1', 'Option 2']
                      : [],
                    correctAnswer: undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options (for select/radio/checkbox) */}
            {HAS_OPTIONS.includes(field.type) && (
              <div className="space-y-2">
                <Label>Options</Label>
                {(field.options || []).map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <Input
                      value={opt}
                      onChange={(e) =>
                        updateOption(index, optIndex, e.target.value)
                      }
                      placeholder={`Option ${optIndex + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => removeOption(index, optIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(index)}
                  className="mt-1"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Option
                </Button>
              </div>
            )}

            {/* Correct answer (quiz mode only) */}
            {isQuiz && (
              <div className="space-y-1 rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-3">
                <Label className="text-yellow-700 dark:text-yellow-400 text-xs font-semibold uppercase">
                  Correct Answer
                </Label>

                {field.type === 'checkbox' ? (
                  // Multi-select correct answer for checkbox
                  <div className="space-y-1 mt-1">
                    {(field.options || []).map((opt) => {
                      const current = Array.isArray(field.correctAnswer)
                        ? field.correctAnswer
                        : [];
                      const checked = current.includes(opt);
                      return (
                        <label
                          key={opt}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const updated = checked
                                ? current.filter((v) => v !== opt)
                                : [...current, opt];
                              updateField(index, { correctAnswer: updated });
                            }}
                            className="rounded"
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                ) : field.type === 'radio' || field.type === 'select' ? (
                  // Single option correct answer
                  <Select
                    value={(field.correctAnswer as string) || ''}
                    onValueChange={(val) =>
                      updateField(index, { correctAnswer: val ?? undefined })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options || []).map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  // Free text correct answer
                  <Input
                    value={(field.correctAnswer as string) || ''}
                    onChange={(e) =>
                      updateField(index, { correctAnswer: e.target.value })
                    }
                    placeholder="Enter the correct answer..."
                    className="mt-1"
                  />
                )}
              </div>
            )}

            {/* Required toggle */}
            <div className="flex items-center justify-between pt-1">
              <Label className="text-sm font-normal text-muted-foreground">
                Required
              </Label>
              <Switch
                checked={field.required}
                onCheckedChange={(val) =>
                  updateField(index, { required: val })
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── SUBMIT ── */}
      <div className="flex justify-end gap-2 pb-8">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? 'Saving...' : 'Save Form'}
        </Button>
      </div>
    </form>
  );
};

export default FormBuilder;