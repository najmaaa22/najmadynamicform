"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import DynamicForm from "@/components/DyanamicForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldX, FileText, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

/* ---------------- FIXED TYPES ---------------- */

type FormField = {
  fieldId: string;
  label: string;
  // IMPORTANT: must match DynamicForm strict union type
  type:
    | "text"
    | "number"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "date";
  required: boolean; // FIX: removed optional to match component type
  options?: string[];
  correctAnswer?: string | string[];
};

type FormData = {
  _id: string;
  title: string;
  description?: string;
  isQuiz: boolean;
  version: number;
  fields: FormField[];
};

type ScoreResult = {
  obtained: number;
  total: number;
} | null;

type PageState =
  | "loading"
  | "unauthorized"
  | "not_found"
  | "form"
  | "submitted"
  | "already_submitted_quiz";

export default function FormPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [form, setForm] = useState<FormData | null>(null);
  const [existingResponse, setExistingResponse] = useState<any>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult>(null);

  const loadForm = useCallback(async () => {
    setPageState("loading");

    try {
      const [formRes, responseRes] = await Promise.allSettled([
        api.get(`/forms/${id}`),
        api.get(`/forms/${id}/my-response`),
      ]);

      if (formRes.status === "rejected") {
        const status = (formRes.reason as any)?.response?.status;
        setPageState(status === 403 ? "unauthorized" : "not_found");
        return;
      }

      const formData =
        (formRes.value as any).data?.data || (formRes.value as any).data;

      setForm(formData);

      if (
        responseRes.status === "fulfilled" &&
        (responseRes.value as any).data?.data
      ) {
        const resp = (responseRes.value as any).data.data;

        setExistingResponse(resp);

        if (formData.isQuiz) {
          setScoreResult(resp.score || null);
          setPageState("already_submitted_quiz");
        } else {
          setPageState("form");
        }
      } else {
        setPageState("form");
      }
    } catch (err: any) {
      setPageState(err?.response?.status === 403 ? "unauthorized" : "not_found");
    }
  }, [id]);

  useEffect(() => {
    if (id) loadForm();
  }, [id, loadForm]);

  const handleSubmit = async (answers: Record<string, any>) => {
    try {
      const res = await api.post(`/forms/${id}/submit`, {
        answers,
        version: form?.version,
      });

      const data = res.data?.data;

      if (form?.isQuiz && data?.score) {
        setScoreResult(data.score);
        setPageState("already_submitted_quiz");
      } else {
        toast.success("Response submitted!");
        setPageState("submitted");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Submission failed");
    }
  };

  /* ---------------- LOADING ---------------- */
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-muted/30 py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  /* ---------------- UNAUTHORIZED ---------------- */
  if (pageState === "unauthorized") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-8 space-y-4">
            <ShieldX className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Access Denied</h2>
            <Button onClick={() => router.push("/forms")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------------- NOT FOUND ---------------- */
  if (pageState === "not_found") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-8 space-y-4">
            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            <h2 className="text-xl font-bold">Form Not Found</h2>
            <Button onClick={() => router.push("/forms")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------------- SUBMITTED ---------------- */
  if (pageState === "submitted") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-8 space-y-3">
            <h2 className="text-xl font-bold">Response Submitted</h2>
            <Button onClick={() => loadForm()} variant="outline">
              View Response
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------------- MAIN FORM ---------------- */
  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.push("/forms")}> 
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>{form?.title}</CardTitle>
                <CardDescription>{form?.description}</CardDescription>
              </div>

              <div className="flex gap-2">
                <Badge>{form?.isQuiz ? "Quiz" : "Form"}</Badge>
                <Badge variant="outline">v{form?.version}</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {form && (
          <Card>
            <CardContent>
              <DynamicForm
                form={form}
                existingResponse={existingResponse}
                onSubmit={handleSubmit}
                scoreResult={scoreResult}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
