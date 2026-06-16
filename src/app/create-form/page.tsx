"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import API from "@/lib/api";
import Select from "react-select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { FormField, FieldType } from "@/types/form";

export default function CreateFormPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isQuiz, setIsQuiz] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);
  const [availableUsers, setAvailableUsers] = useState<{ value: string; label: string }[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/auth/users");
        const list = (res.data?.data || []).map((u: any) => ({
          value: u._id,
          label: `${u.name} (${u.email})`,
        }));
        setAvailableUsers(list);
      } catch (err) {
        console.log("Failed to load users for whitelist", err);
      }
    };
    fetchUsers();
  }, []);

  // ─── Field Actions ────────────────────────────────────

  const addField = (type: FieldType) => {
    const newField: FormField = {
      fieldId: crypto.randomUUID(),
      label: "",
      type,
      required: false,
      options:
        type === "select" || type === "radio" || type === "checkbox"
          ? [""]
          : undefined,
      correctAnswer: type === "checkbox" ? [] : "",
      validation: {},
    };
    setFields((prev) => [...prev, newField]);
  };

  const updateField = <K extends keyof FormField>(
    fieldId: string,
    key: K,
    value: FormField[K]
  ) => {
    setFields((prev) =>
      prev.map((f) => (f.fieldId === fieldId ? { ...f, [key]: value } : f))
    );
  };

  const removeField = (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.fieldId !== fieldId));
  };

  const updateOption = (fieldId: string, index: number, value: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.fieldId !== fieldId) return f;
        const updated = [...(f.options || [])];
        updated[index] = value;
        return { ...f, options: updated };
      })
    );
  };

  const addOption = (fieldId: string) => {
    setFields((prev) =>
      prev.map((f) =>
        f.fieldId === fieldId ? { ...f, options: [...(f.options || []), ""] } : f
      )
    );
  };

  const removeOption = (fieldId: string, index: number) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.fieldId !== fieldId) return f;
        const updated = [...(f.options || [])];
        updated.splice(index, 1);
        return { ...f, options: updated };
      })
    );
  };

  // ─── Validation ───────────────────────────────────────

  const validate = (): boolean => {
    if (!title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (fields.length === 0) {
      toast.error("Add at least one field");
      return false;
    }
    for (const field of fields) {
      if (!field.label.trim()) {
        toast.error("All fields need a label");
        return false;
      }
      if (
        (field.type === "select" ||
          field.type === "radio" ||
          field.type === "checkbox") &&
        field.options?.some((opt: string) => !opt.trim())
      ) {
        toast.error(`Empty options found in "${field.label}"`);
        return false;
      }
    }
    return true;
  };

  // ─── Submit ───────────────────────────────────────────

  const saveForm = async () => {
    if (!validate()) return;

    // normalize checkbox correctAnswer: "a, b" → ["a", "b"]
    const normalizedFields = fields.map((f) => ({
      ...f,
      correctAnswer:
        f.type === "checkbox" && typeof f.correctAnswer === "string"
          ? f.correctAnswer.split(",").map((s: string) => s.trim()).filter(Boolean)
          : f.correctAnswer,
    }));

    try {
      setLoading(true);
      await API.post("/forms", {
        title,
        description,
        isQuiz,
        fields: normalizedFields,
        allowedUsers: selectedUsers.map((u) => u.value),
      });
      toast.success("Form created successfully!");
      router.push("/admin/dashboard");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to create form";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────

  const hasValidation = (type: FieldType) =>
    type === "text" || type === "textarea" || type === "number";

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Card className="rounded-3xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-4xl">Create Form</CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <Input
                placeholder="Form Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Form Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isQuiz}
                  onChange={(e) => setIsQuiz(e.target.checked)}
                />
                <span className="font-medium text-slate-700">Quiz Mode</span>
              </label>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Allow Access To (Users whitelist)
                </label>
                <Select
                  isMulti
                  options={availableUsers}
                  value={selectedUsers}
                  onChange={(selected) => setSelectedUsers((selected as any) || [])}
                  placeholder="Select users who can access this form..."
                  className="basic-multi-select"
                  classNamePrefix="select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "12px",
                      padding: "2px 6px",
                      borderColor: "#cbd5e1",
                      "&:hover": { borderColor: "#cbd5e1" }
                    }),
                  }}
                />
              </div>
            </div>

            {/* Add Field Buttons */}
            <div className="flex flex-wrap gap-3">
              {(
                [
                  "text",
                  "number",
                  "textarea",
                  "select",
                  "radio",
                  "checkbox",
                  "date",
                ] as FieldType[]
              ).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant="outline"
                  onClick={() => addField(type)}
                >
                  + {type}
                </Button>
              ))}
            </div>

            {/* Fields */}
            <div className="space-y-6">
              {fields.map((field) => (
                <Card key={field.fieldId} className="border">
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="bg-black text-white px-4 py-1 rounded-full text-sm">
                        {field.type}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeField(field.fieldId)}
                      >
                        Remove
                      </Button>
                    </div>

                    {/* Label */}
                    <Input
                      placeholder="Field Label *"
                      value={field.label}
                      onChange={(e) =>
                        updateField(field.fieldId, "label", e.target.value)
                      }
                    />

                    {/* Required */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(field.fieldId, "required", e.target.checked)
                        }
                      />
                      <span className="text-sm">Required</span>
                    </label>

                    {/* Options (select / radio / checkbox) */}
                    {(field.type === "select" ||
                      field.type === "radio" ||
                      field.type === "checkbox") && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Options</p>
                        {field.options?.map((option: string, index: number) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={`Option ${index + 1}`}
                              value={option}
                              onChange={(e) =>
                                updateOption(field.fieldId, index, e.target.value)
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(field.fieldId, index)}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(field.fieldId)}
                        >
                          Add Option
                        </Button>
                      </div>
                    )}

                    {/* Validation (text / textarea / number) */}
                    {hasValidation(field.type) && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Validation</p>
                        <div className="flex gap-3">
                          {field.type !== "number" && (
                            <>
                              <Input
                                placeholder="Min length"
                                type="number"
                                min={0}
                                value={field.validation?.minLength ?? ""}
                                onChange={(e) =>
                                  updateField(field.fieldId, "validation", {
                                    ...field.validation,
                                    minLength: e.target.value
                                      ? Number(e.target.value)
                                      : undefined,
                                  })
                                }
                              />
                              <Input
                                placeholder="Max length"
                                type="number"
                                min={0}
                                value={field.validation?.maxLength ?? ""}
                                onChange={(e) =>
                                  updateField(field.fieldId, "validation", {
                                    ...field.validation,
                                    maxLength: e.target.value
                                      ? Number(e.target.value)
                                      : undefined,
                                  })
                                }
                              />
                            </>
                          )}
                          <Input
                            placeholder="Regex pattern"
                            value={field.validation?.pattern ?? ""}
                            onChange={(e) =>
                              updateField(field.fieldId, "validation", {
                                ...field.validation,
                                pattern: e.target.value || undefined,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {/* Correct Answer (quiz mode) */}
                    {isQuiz && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Correct Answer</p>
                        <Input
                          placeholder={
                            field.type === "checkbox"
                              ? "Comma separated: a, b"
                              : "Correct answer"
                          }
                          value={
                            Array.isArray(field.correctAnswer)
                              ? field.correctAnswer.join(", ")
                              : field.correctAnswer ?? ""
                          }
                          onChange={(e) =>
                            updateField(
                              field.fieldId,
                              "correctAnswer",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit */}
            <Button
              onClick={saveForm}
              disabled={loading}
              className="w-full py-6 text-lg"
            >
              {loading ? "Creating..." : "Create Form"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}