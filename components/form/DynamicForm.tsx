"use client";

import { useState } from "react";

import {
  useForm,
  Controller,
} from "react-hook-form";

import API from "@/lib/api";

import {
  FormSchema,
  FormField,
} from "@/types/form";

import TextField from "@/components/fields/TextField";
import NumberField from "@/components/fields/NumberField";
import RadioField from "@/components/fields/RadioField";
import TextareaField from "@/components/fields/TextareaField";
import SelectField from "@/components/fields/SelectField";
import DateField from "@/components/fields/DateField";
import CheckboxField from "@/components/fields/CheckboxField";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

type Props = {
  form: FormSchema;
};

export default function DynamicForm({
  form,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  // EMPTY STATE
  if (!form || !form.fields?.length) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <Card className="w-full max-w-xl border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-700">
              {form?.title || "Form"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-orange-600">
              No fields available for this
              version.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Record<string, any>>();

  // SUBMIT
  const onSubmit = async (
    data: Record<string, any>
  ) => {
    try {
      setLoading(true);

      const payload = {
        version: form.version,
        answers: data,
      };

      const response = await API.post(
        `/responses/${form._id}/submit`,
        payload
      );

      // QUIZ RESULT
      if (
        form.isQuiz &&
        response.data?.data?.score
      ) {
        const score =
          response.data.data.score;

        alert(
          `Quiz Submitted \n\nScore: ${score.obtained}/${score.total}`
        );
      } else {
        alert(
          "Form submitted successfully ✅"
        );
      }

      reset();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        "Submission failed ";

      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <Card className="max-w-2xl mx-auto shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">
            {form.title}
          </CardTitle>

          {form.description && (
            <p className="text-slate-500 mt-2">
              {form.description}
            </p>
          )}
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {form.fields.map(
              (field: FormField) => {
                const inputId =
                  field.fieldId || field.id;

                const fieldError = (
                  errors as any
                )[inputId]?.message;

                // CHECKBOX handled separately
                if (
                  field.type === "checkbox"
                ) {
                  return (
                    <Controller
                      key={inputId}
                      control={control}
                      name={inputId}
                      defaultValue={[]}
                      rules={{
                        required:
                          field.required
                            ? "This field is required"
                            : false,
                      }}
                      render={({
                        field:
                          controllerField,
                      }) => (
                        <CheckboxField
                          label={field.label}
                          required={
                            field.required
                          }
                          error={fieldError}
                          options={
                            field.options ||
                            []
                          }
                          value={
                            controllerField.value
                          }
                          onChange={
                            controllerField.onChange
                          }
                        />
                      )}
                    />
                  );
                }

                // NORMAL INPUTS
                const baseProps = {
                  label: field.label,
                  required:
                    field.required,
                  error: fieldError,

                  ...register(inputId, {
                    required:
                      field.required
                        ? "This field is required"
                        : false,

                    minLength:
                      field.validation
                        ?.minLength
                        ? {
                            value:
                              field
                                .validation
                                .minLength,

                            message: `Minimum ${field.validation.minLength} characters`,
                          }
                        : undefined,

                    maxLength:
                      field.validation
                        ?.maxLength
                        ? {
                            value:
                              field
                                .validation
                                .maxLength,

                            message: `Maximum ${field.validation.maxLength} characters`,
                          }
                        : undefined,

                    pattern:
                      field.validation
                        ?.pattern
                        ? {
                            value:
                              new RegExp(
                                field
                                  .validation
                                  .pattern
                              ),

                            message:
                              "Invalid format",
                          }
                        : undefined,
                  }),
                };

                switch (field.type) {
                  case "text":
                    return (
                      <TextField
                        key={inputId}
                        {...baseProps}
                      />
                    );

                  case "number":
                    return (
                      <NumberField
                        key={inputId}
                        {...baseProps}
                      />
                    );

                  case "textarea":
                    return (
                      <TextareaField
                        key={inputId}
                        {...baseProps}
                      />
                    );

                  case "date":
                    return (
                      <DateField
                        key={inputId}
                        {...baseProps}
                      />
                    );

                  case "radio":
                    return (
                      <RadioField
                        key={inputId}
                        {...baseProps}
                        options={
                          field.options ||
                          []
                        }
                      />
                    );

                  case "select":
                    return (
                      <SelectField
                        key={inputId}
                        {...baseProps}
                        options={
                          field.options ||
                          []
                        }
                      />
                    );

                  default:
                    return null;
                }
              }
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-lg font-semibold"
            >
              {loading
                ? "Submitting..."
                : "Submit Response"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}