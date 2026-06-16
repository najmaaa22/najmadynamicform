"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";

import { useAuth } from "@/contexts/AuthContext";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  allowedUsers?: string[];
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

  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<FormType | null>(null);
  const [previousResponse, setPreviousResponse] =
    useState<PreviousResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* ---------------- FETCH ---------------- */

  const fetchFormAndResponse = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setUnauthorized(false);
      setErrorMessage("");

      const formRes = await api.get(`/forms/${id}`);
      const formData = formRes.data?.data ?? formRes.data;

      if (!formData) throw new Error("Form not found");

      if (!formData.isActive) {
        setErrorMessage("This form is no longer active.");
        setForm(null);
        return;
      }

      const allowedUsers = Array.isArray(formData.allowedUsers)
        ? formData.allowedUsers.map((u: any) =>
            typeof u === "string" ? u : u?._id || u?.id
          )
        : [];

      if (allowedUsers.length > 0 && user?.role !== "admin") {
        if (!user) {
          setUnauthorized(true);
          setErrorMessage("You must be logged in to access this form.");
          setForm(null);
          return;
        }

        if (!allowedUsers.includes(user._id)) {
          setUnauthorized(true);
          setErrorMessage(
            "You are not authorized to access this form."
          );
          setForm(null);
          return;
        }
      }

      setForm(formData);

      // Fetch previous response silently
      try {
        const responseRes = await api.get(`/forms/${id}/my-response`);
        const responseData = responseRes.data?.data ?? responseRes.data;
        if (responseData?._id) {
          setPreviousResponse(responseData);
        }
      } catch {
        // No previous response — fine
      }
    } catch (err) {
      const error = err as AxiosError<any>;

      if (error.response?.status === 403) {
        setUnauthorized(true);
        setErrorMessage(
          error.response?.data?.message ||
            "You are not authorized to access this form."
        );
      } else if (error.response?.status === 404) {
        setErrorMessage("This form does not exist.");
      } else {
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Failed to load form."
        );
      }

      setForm(null);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (authLoading) return;
    fetchFormAndResponse();
  }, [fetchFormAndResponse, authLoading]);

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
          ? "Quiz submitted! Fetching your score..."
          : "Response submitted successfully!"
      );

      // Refetch to get score / updated response
      await fetchFormAndResponse();
    } catch (err) {
      const error = err as AxiosError<any>;
      const msg = error.response?.data?.message || "Submission failed";
      toast.error(msg);
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
          <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mx-auto">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground text-sm">{errorMessage}</p>
          <Button variant="outline" onClick={() => router.push("/forms")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
        </div>
      </>
    );
  }

  /* ---------------- NOT FOUND / INACTIVE ---------------- */

  if (!form) {
    return (
      <>
        <Navbar />
        <div className="max-w-md mx-auto mt-24 text-center space-y-4 px-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold">Form Unavailable</h2>
          <p className="text-muted-foreground text-sm">
            {errorMessage || "This form could not be loaded."}
          </p>
          <Button variant="outline" onClick={() => router.push("/forms")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
        </div>
      </>
    );
  }

  /* ---------------- SAFE FIELD MAPPING ---------------- */

  const safeFields: SafeFormField[] = (form.fields ?? []).map((f) => ({
    fieldId: f.fieldId,
    label: f.label,
    type: f.type as FormFieldType,
    required: f.required ?? false,
    options: f.options ?? [],
    correctAnswer: f.correctAnswer,
  }));

  const isQuiz = form.isQuiz;
  const hasSubmitted = !!previousResponse;
  const score = previousResponse?.score;

  // Fix: avoid division by zero
  const percentage =
    score && score.total > 0
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

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{form.title}</h1>
            <Badge variant={isQuiz ? "default" : "secondary"}>
              {isQuiz ? "Quiz" : "Form"}
            </Badge>
            <Badge variant="outline">v{form.version}</Badge>
          </div>
          {form.description && (
            <p className="text-muted-foreground text-sm">{form.description}</p>
          )}
        </div>

        <Separator />

        {/* QUIZ SCORE — show after submit */}
        {isQuiz && hasSubmitted && score && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Your Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-bold">
                {score.obtained}{" "}
                <span className="text-muted-foreground text-2xl">
                  / {score.total}
                </span>
                <span className="text-lg font-normal text-muted-foreground ml-2">
                  ({percentage}%)
                </span>
              </div>

              {/* Per-question breakdown */}
              {score.breakdown?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {score.breakdown.map((item, i) => (
                    <div
                      key={item.fieldId}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                        item.isCorrect
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      Q{i + 1}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* FORM — quiz: hide after submit | form: show read-only with edit option */}
        {isQuiz && hasSubmitted ? (
          // Quiz already submitted — show read-only answers
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center py-4">
                You have already submitted this quiz. Multiple attempts are not allowed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <DynamicForm
            fields={safeFields}
            onSubmit={handleSubmit}
            initialData={previousResponse?.answers}
            isQuiz={isQuiz}
            readOnly={false}
            submitting={submitting}
          />
        )}

        {/* Form already submitted — show update note */}
        {!isQuiz && hasSubmitted && (
          <p className="text-xs text-muted-foreground text-center">
            ✏️ You have already submitted this form. You can update your response.
          </p>
        )}
      </div>
    </>
  );
}