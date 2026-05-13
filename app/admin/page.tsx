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
  options?: string[];
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

    setFields([...fields, newField]);
  };

  const updateField = (
    index: number,
    key: keyof FormField,
    value: any
  ) => {
    const updatedFields = [...fields];

    updatedFields[index] = {
      ...updatedFields[index],
      [key]: value,
    };

    setFields(updatedFields);
  };

  const handleSaveForm = () => {
    const formData = {
      title,
      description,
      isQuiz,
      version: 1,
      fields,
    };

    console.log(formData);

    alert("Form Created Successfully");
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-5">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-8 text-slate-800">
          Create Dynamic Form
        </h1>

        <div className="space-y-6">
          <div>
            <label className="font-medium">
              Form Title
            </label>

            <input
              type="text"
              placeholder="Enter form title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="w-full mt-2 border rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="font-medium">
              Description
            </label>

            <textarea
              placeholder="Enter description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="w-full mt-2 border rounded-xl px-4 py-3 h-32"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isQuiz}
              onChange={(e) =>
                setIsQuiz(e.target.checked)
              }
            />

            <label className="font-medium">
              Enable Quiz Mode
            </label>
          </div>

          <button
            onClick={addField}
            className="w-full bg-black text-white py-3 rounded-xl hover:bg-slate-800 transition"
          >
            Add Fields
          </button>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border rounded-2xl p-5 space-y-4"
            >
              <input
                type="text"
                placeholder="Field Label"
                value={field.label}
                onChange={(e) =>
                  updateField(
                    index,
                    "label",
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3"
              />

              <select
                value={field.type}
                onChange={(e) =>
                  updateField(
                    index,
                    "type",
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="text">Text</option>

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

                <option value="date">Date</option>
              </select>

              {(field.type === "radio" ||
                field.type === "select") && (
                <input
                  type="text"
                  placeholder="Enter options separated by comma"
                  value={
                    field.options?.join(",") || ""
                  }
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

              <div className="flex items-center gap-3">
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

                <label>Required</label>
              </div>
            </div>
          ))}

          <button
            onClick={handleSaveForm}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Save Form
          </button>
        </div>
      </div>
    </div>
  );
}