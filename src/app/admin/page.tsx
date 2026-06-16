
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ScrollArea } from "@/components/ui/scroll-area";
import { asArray } from "@/lib/utils";

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
  label: string;
  type: FieldType;
  required: boolean;
  options: string[];
  correctAnswer?: string;
};

type UserType = {
  _id: string;
  name: string;
  email: string;
};

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isQuiz, setIsQuiz] = useState(false);

  const [fields, setFields] = useState<FormField[]>([]);

  const [users, setUsers] = useState<UserType[]>([]);
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  // FETCH USERS
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");

      setUsers(asArray<UserType>(res.data));
    } catch (error) {
      console.log(error);
    }
  };

  // ADD FIELD
  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      label: "",
      type: "text",
      required: false,
      options: [],
      correctAnswer: "",
    };

    setFields((prev) => [...prev, newField]);
  };

  // REMOVE FIELD
  const removeField = (id: string) => {
    setFields((prev) =>
      prev.filter((field) => field.id !== id)
    );
  };

  // UPDATE FIELD
  const updateField = <K extends keyof FormField>(
    index: number,
    key: K,
    value: FormField[K]
  ) => {
    setFields((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [key]: value,
      };

      return updated;
    });
  };

  // TOGGLE USER
  const toggleUser = (userId: string) => {
    setAllowedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // SAVE FORM
  const handleSaveForm = async () => {
    try {
      // VALIDATION
      if (!title.trim()) {
        alert("Title is required");
        return;
      }

      if (fields.length === 0) {
        alert("Add at least one field");
        return;
      }

      for (const field of fields) {
        if (!field.label.trim()) {
          alert("Every field needs a label");
          return;
        }

        if (
          (field.type === "select" ||
            field.type === "radio" ||
            field.type === "checkbox") &&
          field.options.length === 0
        ) {
          alert(`Options required for ${field.label}`);
          return;
        }

        if (
          isQuiz &&
          (field.type === "select" ||
            field.type === "radio") &&
          !field.correctAnswer
        ) {
          alert(`Correct answer required for ${field.label}`);
          return;
        }
      }

      setLoading(true);

      const formData = {
        title,
        description,
        isQuiz,
        version: 1,
        allowedUsers,
        fields,
      };

      const res = await api.post("/forms", formData);

      console.log(res.data);

      alert("Form Created Successfully");

      // RESET FORM
      setTitle("");
      setDescription("");
      setIsQuiz(false);
      setFields([]);
      setAllowedUsers([]);
    } catch (error: any) {
      console.log(error);

      alert(
        error?.response?.data?.message ||
          "Failed to create form"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-5">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl rounded-3xl">
          <CardContent className="p-8 space-y-8">
            <h1 className="text-4xl font-bold">
              Create Dynamic Form
            </h1>

            {/* TITLE */}
            <div className="space-y-2">
              <label className="font-medium">
                Form Title
              </label>

              <Input
                placeholder="Enter form title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <label className="font-medium">
                Description
              </label>

              <Textarea
                placeholder="Enter form description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />
            </div>

            {/* QUIZ MODE */}
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isQuiz}
                onCheckedChange={(checked: boolean) =>
                  setIsQuiz(checked === true)
                }
              />

              <span className="font-medium">
                Enable Quiz Mode
              </span>
            </div>

            {/* ALLOWED USERS */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">
                Allowed Users
              </h2>

              <ScrollArea className="h-48 border rounded-xl p-4">
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3"
                    >
                      <Checkbox
                        checked={allowedUsers.includes(
                          user._id
                        )}
                        onCheckedChange={() =>
                          toggleUser(user._id)
                        }
                      />

                      <div>
                        <p className="font-medium">
                          {user.name}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* ADD FIELD BUTTON */}
            <Button
              type="button"
              onClick={addField}
              className="w-full"
            >
              Add Field
            </Button>

            {/* FIELD LIST */}
            <div className="space-y-6">
              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className="border-2"
                >
                  <CardContent className="p-5 space-y-4">
                    {/* LABEL */}
                    <Input
                      placeholder="Field Label"
                      value={field.label}
                      onChange={(e) =>
                        updateField(
                          index,
                          "label",
                          e.target.value
                        )
                      }
                    />

                    {/* FIELD TYPE */}
                    <Select
  value={field.type}
  onValueChange={(value) => {
    if (!value) return;
    updateField(index, "type", value as FieldType);
  }}
>
                    
                      <SelectTrigger>
                        <SelectValue placeholder="Select field type" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="text">
                          Text
                        </SelectItem>

                        <SelectItem value="number">
                          Number
                        </SelectItem>

                        <SelectItem value="textarea">
                          Textarea
                        </SelectItem>

                        <SelectItem value="select">
                          Select
                        </SelectItem>

                        <SelectItem value="radio">
                          Radio
                        </SelectItem>

                        <SelectItem value="checkbox">
                          Checkbox
                        </SelectItem>

                        <SelectItem value="date">
                          Date
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* OPTIONS */}
                    {(field.type === "select" ||
                      field.type === "radio" ||
                      field.type === "checkbox") && (
                      <Input
                        placeholder="Options (comma separated)"
                        value={field.options.join(",")}
                        onChange={(e) =>
                          updateField(
                            index,
                            "options",
                            e.target.value
                              .split(",")
                              .map((item) =>
                                item.trim()
                              )
                          )
                        }
                      />
                    )}

                    {/* CORRECT ANSWER */}
                    {isQuiz &&
                      (field.type === "radio" ||
                        field.type === "select") && (
                        <Input
                          placeholder="Correct Answer"
                          value={
                            field.correctAnswer || ""
                          }
                          onChange={(e) =>
                            updateField(
                              index,
                              "correctAnswer",
                              e.target.value
                            )
                          }
                        />
                      )}

                    {/* REQUIRED */}
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={field.required}
                        onCheckedChange={(checked: boolean) =>
                          updateField(
                            index,
                            "required",
                            checked === true
                          )
                        }
                      />

                      <span>Required Field</span>
                    </div>

                    {/* DELETE FIELD */}
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() =>
                        removeField(field.id)
                      }
                    >
                      Delete Field
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* SAVE FORM */}
            <Button
              onClick={handleSaveForm}
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "Creating Form..."
                : "Save Form"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

