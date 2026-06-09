"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  Trash2,
  ChevronsUpDown,
  Check,
  GripVertical,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

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

export default function AdminEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isQuiz, setIsQuiz] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(1);

  useEffect(() => {
    if (id) {
      loadForm();
      fetchUsers();
    }
  }, [id]);

  const loadForm = async () => {
    try {
      const res = await api.get(`/forms/${id}`);
      const form = res.data.data || res.data;

      setTitle(form.title || "");
      setDescription(form.description || "");
      setIsQuiz(form.isQuiz || false);
      setCurrentVersion(form.version || 1);

      setFields(
        (form.fields || []).map((f: any) => ({
          id: f.fieldId || Date.now().toString(),
          fieldId: f.fieldId,
          label: f.label,
          type: f.type,
          required: f.required,
          options: f.options || [],
          correctAnswer: f.correctAnswer || "",
        }))
      );

      setSelectedUsers(
        (form.allowedUsers || []).map((u: any) =>
          typeof u === "string" ? u : u._id
        )
      );
    } catch {
      toast.error("Failed to load form");
      router.push("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      setAllUsers(
        (res.data.data || res.data || []).filter(
          (u: UserOption) => u._id !== user?._id
        )
      );
    } catch {}
  };

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        fieldId: `field_${Date.now()}`,
        label: "",
        type: "text",
        required: false,
        options: [],
        correctAnswer: "",
      },
    ]);
  };

  const removeField = (index: number) =>
    setFields((prev) => prev.filter((_, i) => i !== index));

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

  const toggleUser = (userId: string) =>
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title required");
    if (!fields.length) return toast.error("Add at least one question");
    if (fields.some((f) => !f.label.trim()))
      return toast.error("All questions need a label");

    setSaving(true);

    try {
      await api.put(`/forms/${id}`, {
        title: title.trim(),
        description: description.trim(),
        isQuiz,
        fields: fields.map((f) => ({
          fieldId: f.fieldId,
          label: f.label,
          type: f.type,
          required: f.required,
          options: f.options,
          correctAnswer: isQuiz ? f.correctAnswer : undefined,
        })),
        allowedUsers: selectedUsers,
      });

      toast.success(`Saved as v${currentVersion + 1}`);
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-28 w-full mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="font-semibold">{title || "Untitled"}</h1>
            <p className="text-xs text-muted-foreground">
              v{currentVersion} → v{currentVersion + 1}
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? "Saving..." : "Publish"}
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex justify-between">
              <span>Quiz Mode</span>
              <Switch checked={isQuiz} onCheckedChange={setIsQuiz} />
            </div>
          </CardContent>
        </Card>

        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardContent className="pt-5 space-y-3">
              <Input
                value={field.label}
                onChange={(e) =>
                  updateField(index, "label", e.target.value)
                }
              />
              <Select
  value={field.type}
  onValueChange={(v) => {
    if (!v) return;
    updateField(index, "type", v as FieldType);
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



              {HAS_OPTIONS.includes(field.type) && (
                <Input
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

              <div className="flex justify-between">
                <Checkbox
                  checked={field.required}
                  onCheckedChange={(v: boolean | "indeterminate") =>
                    updateField(index, "required", v === true)
                  }
                />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeField(index)}
                >
                  <Trash2 className="h-4 w-4" />
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
    </div>
  );
}