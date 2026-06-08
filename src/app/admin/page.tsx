"use client";

import { useState } from "react";

type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "date";

type FormField = {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: string[];
  correctAnswer?: string;
};

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isQuiz, setIsQuiz] = useState(false);

  const [fields, setFields] = useState<FormField[]>([]);

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

  const handleSaveForm = () => {
    const formData = {
      title,
      description,
      isQuiz,
      version: 1,
      fields,
    };

    console.log("FORM DATA:", formData);

    alert("Form Created Successfully");
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-5">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-8 text-slate-800">
          Create Dynamic Form
        </h1>

        <div className="space-y-6">

          {/* TITLE */}
          <input
            type="text"
            placeholder="Form Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />

          {/* DESCRIPTION */}
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 h-28"
          />

          {/* QUIZ MODE */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isQuiz}
              onChange={(e) => setIsQuiz(e.target.checked)}
            />
            Enable Quiz Mode
          </label>

          {/* ADD FIELD */}
          <button
            onClick={addField}
            className="w-full bg-black text-white py-3 rounded-xl"
          >
            Add Field
          </button>

          {/* FIELDS */}
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border rounded-2xl p-5 space-y-3"
            >
              <input
                type="text"
                placeholder="Field Label"
                value={field.label}
                onChange={(e) =>
                  updateField(index, "label", e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <select
                value={field.type}
                onChange={(e) =>
                  updateField(index, "type", e.target.value as FieldType)
                }
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="textarea">Textarea</option>
                <option value="select">Select</option>
                <option value="radio">Radio</option>
                <option value="date">Date</option>
              </select>

              {/* OPTIONS */}
              {(field.type === "radio" || field.type === "select") && (
                <input
                  type="text"
                  placeholder="Options (comma separated)"
                  value={field.options.join(",")}
                  onChange={(e) =>
                    updateField(
                      index,
                      "options",
                      e.target.value.split(",")
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3"
                />
              )}

              {/* QUIZ ANSWER */}
              {isQuiz &&
                (field.type === "radio" ||
                  field.type === "select") && (
                  <input
                    type="text"
                    placeholder="Correct Answer"
                    value={field.correctAnswer || ""}
                    onChange={(e) =>
                      updateField(
                        index,
                        "correctAnswer",
                        e.target.value
                      )
                    }
                    className="w-full border rounded-xl px-4 py-3"
                  />
                )}

              {/* REQUIRED */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    updateField(
                      index,
                      "required",
                      e.target.checked
                    )
                  }
                />
                Required
              </label>
            </div>
          ))}

          {/* SAVE */}
          <button
            onClick={handleSaveForm}
            className="w-full bg-blue-600 text-white py-3 rounded-xl"
          >
            Save Form
          </button>
        </div>
      </div>
    </div>
  );
}