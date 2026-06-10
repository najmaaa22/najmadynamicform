"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------- TYPES ---------------- */

export type FormFieldType =
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

interface DynamicFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  initialData?: Record<string, any>;
  isQuiz?: boolean;
  scoreResult?: { obtained: number; total: number } | null;
  readOnly?: boolean;
  submitting?: boolean;
}

/* ---------------- COMPONENT ---------------- */

export const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  initialData,
  isQuiz = false,
  scoreResult,
  readOnly = false,
  submitting,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {},
  });

  const handleFormSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- BUILD VALIDATION RULES ---------------- */

  const buildRules = (field: FormField) => {
    const rules: Record<string, any> = {};

    if (field.required) {
      rules.required = `${field.label} is required`;
    }

    if (field.validation?.minLength) {
      rules.minLength = {
        value: field.validation.minLength,
        message: `Minimum ${field.validation.minLength} characters required`,
      };
    }

    if (field.validation?.maxLength) {
      rules.maxLength = {
        value: field.validation.maxLength,
        message: `Maximum ${field.validation.maxLength} characters allowed`,
      };
    }

    if (field.validation?.pattern) {
      rules.pattern = {
        value: new RegExp(field.validation.pattern),
        message: `Invalid format`,
      };
    }

    if (field.type === "number") {
      rules.valueAsNumber = true;
    }

    return rules;
  };

  /* ---------------- RENDER FIELD ---------------- */

  const renderField = (field: FormField) => {
    const disabled = readOnly || isSubmitting;
    const rules = buildRules(field);

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            {...register(field.fieldId, rules)}
            disabled={disabled}
            rows={4}
            placeholder={`Enter ${field.label}`}
          />
        );

      case "select":
        return (
          <Controller
            name={field.fieldId}
            control={control}
            rules={rules}
            render={({ field: f }) => (
              <Select
                value={f.value || ""}
                onValueChange={f.onChange}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );

      case "radio":
        return (
          <Controller
            name={field.fieldId}
            control={control}
            rules={rules}
            render={({ field: f }) => (
              <RadioGroup
                value={f.value || ""}
                onValueChange={f.onChange}
                disabled={disabled}
                className="space-y-2"
              >
                {field.options?.map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={opt}
                      id={`${field.fieldId}-${opt}`}
                    />
                    <Label htmlFor={`${field.fieldId}-${opt}`}>{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        );

      case "checkbox":
        return (
          <Controller
            name={field.fieldId}
            control={control}
            defaultValue={[]}
            rules={{
              validate: (val) => {
                if (!field.required) return true;
                return (Array.isArray(val) && val.length > 0)
                  ? true
                  : `${field.label} is required`;
              },
            }}
            render={({ field: f }) => {
              const current: string[] = Array.isArray(f.value) ? f.value : [];

              return (
                <div className="space-y-2">
                  {field.options?.map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <Checkbox
                        disabled={disabled}
                        checked={current.includes(opt)}
                        onCheckedChange={(checked) => {
                          const updated = checked
                            ? [...current, opt]
                            : current.filter((v) => v !== opt);
                          f.onChange(updated);
                        }}
                      />
                      <Label>{opt}</Label>
                    </div>
                  ))}
                </div>
              );
            }}
          />
        );

      default:
        return (
          <Input
            type={field.type}
            {...register(field.fieldId, rules)}
            disabled={disabled}
            placeholder={`Enter ${field.label}`}
          />
        );
    }
  };

  /* ---------------- SCORE UI ---------------- */

  if (scoreResult) {
    const percent = Math.round(
      (scoreResult.obtained / scoreResult.total) * 100
    );

    return (
      <div className="text-center space-y-4 py-8">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        <div className="text-3xl font-bold">
          {scoreResult.obtained} / {scoreResult.total}
        </div>
        <p className="text-sm text-muted-foreground">Score: {percent}%</p>
        <Badge variant={percent >= 70 ? "default" : "secondary"}>
          {percent >= 70 ? "Good Job! 🎉" : "Keep Practicing 💪"}
        </Badge>
      </div>
    );
  }

  /* ---------------- FORM ---------------- */

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {fields.map((field, index) => (
        <div key={field.fieldId} className="space-y-2">
          <Label
            className={cn(
              "text-sm font-medium",
              errors[field.fieldId] && "text-red-500"
            )}
          >
            {index + 1}. {field.label}
            {field.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </Label>

          {renderField(field)}

          {errors[field.fieldId] && (
            <p className="text-xs text-red-500">
              {String(errors[field.fieldId]?.message)}
            </p>
          )}
        </div>
      ))}

      {!readOnly && (
        <Button
          type="submit"
          disabled={isSubmitting || submitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting || submitting
            ? "Submitting..."
            : isQuiz
            ? "Submit Quiz"
            : "Submit"}
        </Button>
      )}
    </form>
  );
};

export default DynamicForm;