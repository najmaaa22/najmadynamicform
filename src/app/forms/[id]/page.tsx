"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Navbar } from "@/components/layout/Navbar";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { Form } from "@/types/form";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function FormRendererPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null); // ✅ FIXED
  const [previousResponse, setPreviousResponse] =
    useState<PreviousResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchFormAndResponse = async () => {
    try {
      setLoading(true);
      setUnauthorized(false);

      const formRes = await api.get(`/forms/${id}`);
      const formData = formRes.data?.data;

      if (!formData || !formData.isActive) {
        throw new Error("This form is inactive or not found");
      }

      setForm(formData);

      try {
        const responseRes = await api.get(`/forms/${id}/my-response`);
        if (responseRes.data?.data) {
          setPreviousResponse(responseRes.data.data);
        }
      } catch (err) {
        console.log("No previous response");
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setUnauthorized(true);
        setErrorMessage(
          err.response?.data?.message ||
            "Unauthorized access to this form"
        );
      } else {
        setErrorMessage(err.message || "Failed to load form");
      }
      setForm(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchFormAndResponse();
  }, [id]);

  const handleSubmit = async (answers: any) => {
    try {
      await api.post(`/forms/${id}/submit`, {
        answers,
        version: form?.version || 1,
      });

      toast.success(
        form?.isQuiz
          ? "Quiz submitted successfully!"
          : "Form submitted successfully!"
      );

      await fetchFormAndResponse();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Submission failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (unauthorized) {
    return (
      <>
        <Navbar />
        <div className="p-10 text-center text-red-500">
          <ShieldAlert className="mx-auto mb-2" />
          {errorMessage}
          <Button onClick={() => router.push("/forms")} className="mt-4">
            Back
          </Button>
        </div>
      </>
    );
  }

  if (!form) {
    return (
      <>
        <Navbar />
        <div className="p-10 text-center">
          <AlertCircle className="mx-auto mb-2 text-red-500" />
          <p>{errorMessage || "Form not found"}</p>
        </div>
      </>
    );
  }

  const isQuiz = form.isQuiz;
  const hasSubmitted = !!previousResponse;

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{form.title}</h1>
          <p className="text-gray-500">{form.description}</p>
        </div>

        {hasSubmitted && (
          <div className="p-4 border rounded">
            <p>You have already submitted this form.</p>
          </div>
        )}

        {isQuiz && hasSubmitted && previousResponse?.score && (
          <div className="p-6 bg-indigo-900 text-white rounded">
            <h2>Your Score</h2>
            <p>
              {previousResponse.score.obtained} /{" "}
              {previousResponse.score.total}
            </p>
          </div>
        )}

        {(!isQuiz || !hasSubmitted) && (
          <DynamicForm
            fields={form.fields}
            onSubmit={handleSubmit}
            initialData={previousResponse?.answers}
            isQuiz={isQuiz}
            readOnly={isQuiz && hasSubmitted}
          />
        )}
      </div>
    </>
  );
}