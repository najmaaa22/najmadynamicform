"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/lib/api";
import Select from "react-select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FieldType = {
  fieldId: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  correctAnswer?: any;
};

export default function EditFormPage() {
  const params = useParams();

  const router = useRouter();

  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isQuiz, setIsQuiz] = useState(false);
  const [fields, setFields] = useState<FieldType[]>([]);

  const [availableUsers, setAvailableUsers] =
    useState<{ value: string; label: string }[]>([]);

  const [selectedUsers, setSelectedUsers] =
    useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setFetching(true);

        // 1. Fetch available users
        const usersRes = await API.get("/auth/users");
        const list = (usersRes.data?.data || []).map((u: any) => ({
          value: u._id,
          label: `${u.name} (${u.email})`,
        }));
        setAvailableUsers(list);

        // 2. Fetch form schema
        if (id) {
          const res = await API.get(`/forms/${id}`);
          const form = res.data?.data;

          setTitle(form.title || "");
          setDescription(form.description || "");
          setIsQuiz(form.isQuiz || false);
          setFields(form.fields || []);

          // Pre-populate whitelisted users
          const selected = (form.allowedUsers || [])
            .map((uid: string) => list.find((u: any) => u.value === uid))
            .filter(Boolean);
          setSelectedUsers(selected);
        }
      } catch (err: any) {
        console.log(err);
        alert(err?.response?.data?.message || "Failed to load form");
      } finally {
        setFetching(false);
      }
    };

    loadData();
  }, [id]);

  const addField = () => {
    setFields([
      ...fields,
      {
        fieldId:
          Date.now().toString(),

        label: "",

        type: "text",

        required: false,

        options: [],
      },
    ]);
  };

  const updateField = (
    index: number,
    key: string,
    value: any
  ) => {
    const updated = [...fields];

    updated[index] = {
      ...updated[index],
      [key]: value,
    };

    setFields(updated);
  };

  const removeField = (
    index: number
  ) => {
    const updated = [...fields];

    updated.splice(index, 1);

    setFields(updated);
  };

  const updateForm = async () => {
    try {
      if (!title) {
        alert("Title required");
        return;
      }

      setLoading(true);

      await API.put(
        `/forms/${id}`,
        {
          title,
          description,
          isQuiz,
          fields,
          allowedUsers: selectedUsers.map((u) => u.value),
        }
      );

      alert(
        "New form version created"
      );

      router.push(
        "/admin/forms"
      );
    } catch (err: any) {
      console.log(err);

      alert(
        err?.response?.data
          ?.message ||
          "Update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading form...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        <Card className="rounded-3xl shadow-xl">

          <CardHeader>
            <CardTitle className="text-3xl">
              Edit Form
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">

            <div className="space-y-4">

              <Input
                placeholder="Form Title"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="Description"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />

              <div className="flex items-center gap-3">

                <input
                  type="checkbox"
                  checked={isQuiz}
                  onChange={(e) =>
                    setIsQuiz(
                      e.target.checked
                    )
                  }
                />

                <label className="font-semibold text-slate-700">
                  Quiz Mode
                </label>
              </div>

              <div className="space-y-1.5 mt-2">
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

            <div className="space-y-6">

              {fields.map(
                (field, index) => (
                  <Card
                    key={field.fieldId}
                    className="border"
                  >
                    <CardContent className="space-y-4 pt-6">

                      <Input
                        placeholder="Field Label"
                        value={
                          field.label
                        }
                        onChange={(e) =>
                          updateField(
                            index,
                            "label",
                            e.target.value
                          )
                        }
                      />

                      <select
                        value={
                          field.type
                        }
                        onChange={(e) =>
                          updateField(
                            index,
                            "type",
                            e.target.value
                          )
                        }
                        className="w-full border rounded-md h-10 px-3"
                      >
                        <option value="text">
                          Text
                        </option>

                        <option value="number">
                          Number
                        </option>

                        <option value="textarea">
                          Textarea
                        </option>

                        <option value="select">
                          Select
                        </option>

                        <option value="radio">
                          Radio
                        </option>

                        <option value="checkbox">
                          Checkbox
                        </option>

                        <option value="date">
                          Date
                        </option>
                      </select>

                      {(field.type ===
                        "select" ||
                        field.type ===
                          "radio" ||
                        field.type ===
                          "checkbox") && (
                        <Input
                          placeholder="Options separated by comma"
                          value={(
                            field.options ||
                            []
                          ).join(",")}
                          onChange={(e) =>
                            updateField(
                              index,
                              "options",
                              e.target.value
                                .split(",")
                                .map((o) =>
                                  o.trim()
                                )
                            )
                          }
                        />
                      )}

                      {isQuiz && (
                        <Input
                          placeholder="Correct Answer"
                          value={
                            field.correctAnswer ||
                            ""
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

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2">

                          <input
                            type="checkbox"
                            checked={
                              field.required
                            }
                            onChange={(e) =>
                              updateField(
                                index,
                                "required",
                                e.target
                                  .checked
                              )
                            }
                          />

                          <label>
                            Required
                          </label>
                        </div>

                        <Button
                          variant="destructive"
                          onClick={() =>
                            removeField(
                              index
                            )
                          }
                        >
                          Remove
                        </Button>

                      </div>

                    </CardContent>
                  </Card>
                )
              )}

              <Button
                variant="outline"
                onClick={addField}
              >
                Add Field
              </Button>

            </div>

            <Button
              className="w-full"
              onClick={updateForm}
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : "Create New Version"}
            </Button>

          </CardContent>

        </Card>

      </div>
    </div>
  );
}