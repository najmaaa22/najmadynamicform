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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { PlusCircle, Trash2, ArrowLeft } from "lucide-react";

type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date";

type FormField = {
  id: string;
  fieldId: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: string[];
  correctAnswer?: string;
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

export default function AdminCreatePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isQuiz, setIsQuiz] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      fieldId: `field_${Date.now()}`,
      label: "",
      type: "text",
      required: false,
      options: [],
      correctAnswer: "",
    };

    setFields((prev) => [...prev, newField]);
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

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title required");
    if (!fields.length) return toast.error("Add fields");

    setSaving(true);

    try {
      const payload = {
        title,
        description,
        isQuiz,
        fields,
        allowedUsers: selectedUsers,
      };

      await api.post("/forms", payload);
      toast.success("Created successfully");
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Publish"}
        </Button>
      </div>

      {/* TITLE */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <span>Quiz Mode</span>
            <Switch checked={isQuiz} onCheckedChange={setIsQuiz} />
          </div>
        </CardContent>
      </Card>

      {/* FIELDS */}
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="pt-5 space-y-3">

            <Input
              placeholder="Question"
              value={field.label}
              onChange={(e) =>
                updateField(index, "label", e.target.value)
              }
            />

            {/* ✅ FIXED SELECT TYPE */}
            <Select
              value={field.type}
              onValueChange={(v) =>
                updateField(
                  index,
                  "type",
                  v as FieldType
                )
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

            {/* OPTIONS */}
            {HAS_OPTIONS.includes(field.type) && (
              <Input
                placeholder="Options (comma separated)"
                value={field.options.join(", ")}
                onChange={(e) =>
                  updateField(
                    index,
                    "options",
                    e.target.value.split(",").map((o) => o.trim())
                  )
                }
              />
            )}

            {/* REQUIRED */}
            <div className="flex justify-between items-center">
              <Checkbox
                checked={field.required}
                onCheckedChange={(v) =>
                  updateField(index, "required", v === true)
                }
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeField(index)}
              >
                <Trash2 />
              </Button>
            </div>

          </CardContent>
        </Card>
      ))}

      <Button onClick={addField} className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Question
      </Button>
    </div>
  );
}