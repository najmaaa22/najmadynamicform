"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";

import api from "@/lib/api";
import toast from "react-hot-toast";

import { Navbar } from "@/components/layout/Navbar";
import { DynamicForm } from "@/components/DyanamicForm";

import {
  ShieldAlert,
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/* ---------------- TYPES ---------------- */

type FormFieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date";

interface FormField {
  fieldId: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  correctAnswer?: string | string[];
}

interface SafeFormField {
  fieldId: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options: string[];
  correctAnswer?: string | string[];
}

interface FormType {
  _id: string;
  title: string;
  description?: string;
  isQuiz: boolean;
  version: number;
  isActive: boolean;
  fields: FormField[];
}

interface ScoreBreakdown {
  fieldId: string;
  isCorrect: boolean;
}

interface PreviousResponse {
  _id: string;
  answers: Record<string, any>;
  score?: {
    obtained: number;
    total: number;
    breakdown: ScoreBreakdown[];
  };
  version: number;
  submittedAt: string;
}

/* ---------------- PAGE ---------------- */

export default function FormRendererPage() {
  const params = useParams();
  const router = useRouter();

  const id = typeof params?.id === "string" ? params.id : "";

  const [form, setForm] = useState<FormType | null>(null);
  const [previousResponse, setPreviousResponse] =
    useState<PreviousResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ---------------- FETCH ---------------- */

  const fetchFormAndResponse = async () => {
    try {
      setLoading(true);
      setUnauthorized(false);

      const formRes = await api.get(`/forms/${id}`);
      const formData = formRes.data?.data ?? formRes.data;

      if (!formData?.isActive) {
        throw new Error("Form not found");
      }

      setForm(formData);

      try {
        const responseRes = await api.get(`/forms/${id}/my-response`);
        const responseData =
          responseRes.data?.data ?? responseRes.data;

        if (responseData) {
          setPreviousResponse(responseData);
        }
      } catch {
        // no response
      }
    } catch (err) {
      const error = err as AxiosError<any>;

      if (error.response?.status === 403) {
        setUnauthorized(true);
        setErrorMessage(
          error.response?.data?.message || "Unauthorized access"
        );
      } else {
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Failed to load form"
        );
      }

      setForm(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchFormAndResponse();
  }, [id]);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (answers: Record<string, any>) => {
    try {
      setSubmitting(true);

      await api.post(`/forms/${id}/submit`, {
        answers,
        version: form?.version ?? 1,
      });

      toast.success(
        form?.isQuiz
          ? "Quiz submitted successfully"
          : "Form submitted successfully"
      );

      await fetchFormAndResponse();
    } catch (err) {
      const error = err as AxiosError<any>;
      toast.error(error.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </>
    );
  }

  /* ---------------- UNAUTHORIZED ---------------- */

  if (unauthorized) {
    return (
      <>
        <Navbar />
        <div className="max-w-md mx-auto mt-24 text-center space-y-4 px-4">
          <ShieldAlert className="h-10 w-10 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-gray-500 text-sm">{errorMessage}</p>

          <Button variant="outline" onClick={() => router.push("/forms")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
        </div>
      </>
    );
  }

  /* ---------------- NOT FOUND ---------------- */

  if (!form) {
    return (
      <>
        <Navbar />
        <div className="max-w-md mx-auto mt-24 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto" />
          <p className="text-gray-500">{errorMessage}</p>

          <Button variant="outline" onClick={() => router.push("/forms")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
        </div>
      </>
    );
  }

  /* ---------------- SAFE MAPPING FIX ---------------- */

  const safeFields: SafeFormField[] = (form.fields ?? []).map((f) => ({
    fieldId: f.fieldId,
    label: f.label,
    type: f.type as FormFieldType,
    required: f.required ?? false,
    options: f.options ?? [],
    correctAnswer: f.correctAnswer,
  }));

  /* ---------------- MAIN ---------------- */

  const isQuiz = form.isQuiz;
  const hasSubmitted = !!previousResponse;
  const score = previousResponse?.score;

  const percentage = score
    ? Math.round((score.obtained / score.total) * 100)
    : 0;

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/forms")}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{form.title}</h1>
          <Badge>{isQuiz ? "Quiz" : "Form"}</Badge>
        </div>

        <Separator />

        {/* SCORE */}
        {isQuiz && hasSubmitted && score && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Score
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-4xl font-bold">
                {score.obtained} / {score.total} ({percentage}%)
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(score.breakdown ?? []).map((item, i) => (
                  <div
                    key={item.fieldId}
                    className={`text-xs px-2 py-1 rounded ${
                      item.isCorrect
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.isCorrect ? (
                      <CheckCircle2 className="inline w-3 h-3" />
                    ) : (
                      <XCircle className="inline w-3 h-3" />
                    )}{" "}
                    Q{i + 1}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* FORM */}
        {(!isQuiz || !hasSubmitted) && (
          <DynamicForm
            fields={safeFields}
            onSubmit={handleSubmit}
            initialData={previousResponse?.answers}
            isQuiz={isQuiz}
            readOnly={isQuiz && hasSubmitted}
            submitting={submitting}
          />
        )}
      </div>
    </>
  );
}