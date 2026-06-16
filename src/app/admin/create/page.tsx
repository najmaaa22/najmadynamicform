"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PlusCircle, Trash2, ArrowLeft, X, Check } from "lucide-react";
import { asArray } from "@/lib/utils";

/* ---------------- TYPES ---------------- */

type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date";

type FormField = {
  fieldId: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: string[];
  correctAnswer?: string | string[];
};

type UserOption = {
  _id: string;
  name: string;
  email: string;
};

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Short Text" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Long Text" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Multiple Choice" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "date", label: "Date" },
];

const HAS_OPTIONS: FieldType[] = ["select", "radio", "checkbox"];

/* ---------------- PAGE ---------------- */

export default function AdminCreatePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isQuiz, setIsQuiz] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // ── Admin guard ──
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") router.replace("/login");
  }, [user, authLoading, router]);

  // ── Fetch all users for allowed users selector ──
  useEffect(() => {
    if (user?.role === "admin") {
      api
        .get("/auth/users")
        .then((res) => setAllUsers(asArray<UserOption>(res.data)))
        .catch(() => {});
    }
  }, [user]);

  /* ---- FIELD OPERATIONS ---- */

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        fieldId: `field_${Date.now()}`,
        label: "",
        type: "text",
        required: false,
        options: [],
        correctAnswer: undefined,
      },
    ]);
  };

  const updateField = <K extends keyof FormField>(
    index: number,
    key: K,
    value: FormField[K]
  ) => {
    setFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---- OPTION OPERATIONS ---- */

  const addOption = (fieldIndex: number) => {
    const current = fields[fieldIndex].options || [];
    updateField(fieldIndex, "options", [
      ...current,
      `Option ${current.length + 1}`,
    ]);
  };

  const updateOption = (
    fieldIndex: number,
    optIndex: number,
    value: string
  ) => {
    const current = [...(fields[fieldIndex].options || [])];
    current[optIndex] = value;
    updateField(fieldIndex, "options", current);
  };

  const removeOption = (fieldIndex: number, optIndex: number) => {
    const current = fields[fieldIndex].options || [];
    updateField(
      fieldIndex,
      "options",
      current.filter((_, i) => i !== optIndex)
    );
  };

  /* ---- USER SELECTION ---- */

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  /* ---- SAVE ---- */

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!fields.length) return toast.error("Add at least one question");

    const emptyLabel = fields.find((f) => !f.label.trim());
    if (emptyLabel) return toast.error("All questions need a label");

    setSaving(true);
    try {
      await api.post("/forms", {
        title: title.trim(),
        description: description.trim(),
        isQuiz,
        fields,
        allowedUsers: selectedUsers,
      });
      toast.success("Form published successfully!");
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;
  if (!user || user.role !== "admin") return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 pb-20">

      {/* ── HEADER ── */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Publishing..." : "Publish Form"}
        </Button>
      </div>

      {/* ── FORM INFO ── */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1">
            <Label>Title *</Label>
            <Input
              placeholder="Enter form title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Quiz toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Quiz Mode</p>
              <p className="text-xs text-muted-foreground">
                Enable scoring with correct answers
              </p>
            </div>
            <Switch
              checked={isQuiz}
              onCheckedChange={(val) => {
                setIsQuiz(val);
                if (!val) {
                  // Clear correct answers when quiz mode off
                  setFields((prev) =>
                    prev.map((f) => ({ ...f, correctAnswer: undefined }))
                  );
                }
              }}
            />
          </div>

          {/* Allowed users */}
          {allUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Who can access this form?</Label>
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {allUsers.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleUser(u._id)}
                  >
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    {selectedUsers.includes(u._id) && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedUsers.map((uid) => {
                    const u = allUsers.find((x) => x._id === uid);
                    return (
                      <Badge key={uid} variant="secondary" className="gap-1">
                        {u?.name}
                        <button onClick={() => toggleUser(uid)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── FIELDS ── */}
      {fields.map((field, index) => (
        <Card key={field.fieldId}>
          <CardContent className="pt-5 space-y-3">

            {/* Question label */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Q{index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600"
                onClick={() => removeField(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <Input
              placeholder="Enter your question"
              value={field.label}
              onChange={(e) => updateField(index, "label", e.target.value)}
            />

            {/* Field type */}
            <Select
              value={field.type}
              onValueChange={(v) => {
                updateField(index, "type", v as FieldType);
                updateField(index, "correctAnswer", undefined);
                if (!HAS_OPTIONS.includes(v as FieldType)) {
                  updateField(index, "options", []);
                } else if (!fields[index].options.length) {
                  updateField(index, "options", ["Option 1", "Option 2"]);
                }
              }}
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

            {/* Options (select/radio/checkbox) */}
            {HAS_OPTIONS.includes(field.type) && (
              <div className="space-y-2">
                <Label className="text-xs">Options</Label>
                {field.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex gap-2">
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
                      className="h-9 w-9 text-red-400"
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
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Add Option
                </Button>
              </div>
            )}

            {/* Correct answer (quiz mode) */}
            {isQuiz && (
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 p-3 space-y-2">
                <Label className="text-xs font-semibold text-yellow-700 uppercase">
                  Correct Answer
                </Label>

                {field.type === "checkbox" ? (
                  <div className="space-y-1">
                    {field.options.map((opt) => {
                      const current = Array.isArray(field.correctAnswer)
                        ? field.correctAnswer
                        : [];
                      return (
                        <label
                          key={opt}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={current.includes(opt)}
                            onChange={() => {
                              const updated = current.includes(opt)
                                ? current.filter((v) => v !== opt)
                                : [...current, opt];
                              updateField(index, "correctAnswer", updated);
                            }}
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                ) : field.type === "radio" || field.type === "select" ? (
                  <Select
                    value={(field.correctAnswer as string) || ""}
                    onValueChange={(val) =>
                      updateField(index, "correctAnswer", val ?? undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Enter correct answer"
                    value={(field.correctAnswer as string) || ""}
                    onChange={(e) =>
                      updateField(index, "correctAnswer", e.target.value)
                    }
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
                onCheckedChange={(val) => updateField(index, "required", val)}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* ── ADD QUESTION ── */}
      <Button
        variant="outline"
        onClick={addField}
        className="w-full border-dashed"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Question
      </Button>
    </div>
  );
}