"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Navbar } from "@/components/layout/Navbar";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { FormSchema } from "@/types/form";
import { ShieldAlert, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Award } from "lucide-react";
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

  const [form, setForm] = useState<FormSchema | null>(null);
  const [previousResponse, setPreviousResponse] = useState<PreviousResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchFormAndResponse = async () => {
    try {
      setLoading(true);
      setUnauthorized(false);

      // Fetch the form schema
      const formRes = await api.get(`/forms/${id}`);
      const formData = formRes.data?.data;

      if (!formData || !formData.isActive) {
        throw new Error("This form is currently inactive or does not exist.");
      }

      setForm(formData);

      // Fetch the user's previous response if it exists
      try {
        const responseRes = await api.get(`/forms/${id}/my-response`);
        if (responseRes.data?.data) {
          setPreviousResponse(responseRes.data.data);
        }
      } catch (err) {
        console.log("No previous response or not authenticated:", err);
      }
    } catch (err: any) {
      console.log(err);
      if (err.response?.status === 403) {
        setUnauthorized(true);
        setErrorMessage(
          err.response?.data?.message || 
          "Unauthorized Access: You are not whitelisted to access this form/quiz."
        );
      } else {
        setErrorMessage(err.message || "Failed to load form.");
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
          ? "Quiz answers submitted successfully!" 
          : "Form response submitted successfully!"
      );
      
      // Refresh form and response data
      await fetchFormAndResponse();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit answers");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium text-lg animate-pulse">Loading form details...</p>
        </div>
      </div>
    );
  }

  // Render Premium Unauthorized Screen
  if (unauthorized) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-64px)] bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500"></div>
            
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <ShieldAlert className="h-10 w-10 text-red-400" />
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">Access Denied</h2>
            
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              {errorMessage}
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/forms")}
                className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-6 rounded-2xl transition"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Available Forms
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!form) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
          <div className="text-center max-w-md bg-white border rounded-3xl p-8 shadow-lg">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Form Not Found</h2>
            <p className="text-slate-500 mb-6">{errorMessage || "The form you are looking for does not exist or has expired."}</p>
            <Button onClick={() => router.push("/forms")} className="w-full">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </>
    );
  }

  const isQuiz = form.isQuiz;
  const hasSubmitted = !!previousResponse;

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-tr from-slate-50 via-slate-100 to-indigo-50/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">{form.title}</h1>
                <p className="text-slate-500 mt-2 leading-relaxed">{form.description || "No description provided."}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full h-fit">
                  Version {form.version}
                </span>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full h-fit ${
                  isQuiz ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-blue-100 text-blue-700 border border-blue-200"
                }`}>
                  {isQuiz ? "Quiz Mode" : "Standard Form"}
                </span>
              </div>
            </div>

            {/* Submissions Limit Warning / Notification Banner */}
            {hasSubmitted && (
              <div className={`mt-6 flex items-start gap-3 p-4 rounded-2xl border ${
                isQuiz 
                  ? "bg-amber-50 border-amber-200/80 text-amber-800" 
                  : "bg-green-50 border-green-200/80 text-green-800"
              }`}>
                {isQuiz ? (
                  <>
                    <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Quiz Completed</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        You have already submitted this quiz. Quizzes are strictly single-submission and answers cannot be modified.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Response Already Submitted</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        You have already submitted this form. You can update your response below and re-submit your updated entries.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quiz Score Summary (If Quiz & Already Submitted) */}
          {isQuiz && hasSubmitted && previousResponse.score && (
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl border border-white/10 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Award className="w-48 h-48" />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left space-y-2">
                  <h3 className="text-xl font-bold text-slate-300">Your Score</h3>
                  <div className="flex items-baseline justify-center sm:justify-start gap-1">
                    <span className="text-6xl font-black text-white">{previousResponse.score.obtained}</span>
                    <span className="text-2xl font-bold text-indigo-300">/ {previousResponse.score.total}</span>
                  </div>
                  <p className="text-sm text-indigo-200">
                    Percentage: {Math.round((previousResponse.score.obtained / previousResponse.score.total) * 100)}%
                  </p>
                </div>

                <div className="h-28 w-28 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/20 shadow-inner">
                  <Award className="h-10 w-10 text-yellow-400 mb-1" />
                  <span className="text-xs text-indigo-200 uppercase font-semibold tracking-wider">Result</span>
                  <span className="text-sm font-bold text-white mt-0.5">
                    {previousResponse.score.obtained >= previousResponse.score.total / 2 ? "PASSED" : "FAILED"}
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="mt-8 border-t border-white/10 pt-6 space-y-4">
                <h4 className="font-bold text-indigo-100 text-sm uppercase tracking-wider">Answer Performance Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.fields.map((field: any, idx: number) => {
                    const ansBreakdown = previousResponse.score?.breakdown.find(
                      (b) => b.fieldId === field.fieldId
                    );
                    const isCorrect = ansBreakdown?.isCorrect;
                    const ansVal = previousResponse.answers[field.fieldId];

                    return (
                      <div 
                        key={field.fieldId} 
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                          isCorrect 
                            ? "bg-green-500/10 border-green-500/20" 
                            : "bg-red-500/10 border-red-500/20"
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400 font-semibold uppercase">Question {idx + 1}</p>
                          <p className="text-sm font-bold text-white leading-snug line-clamp-1">{field.label}</p>
                          <p className="text-xs text-slate-300 line-clamp-1">
                            Your Answer: <span className="font-semibold text-white">{Array.isArray(ansVal) ? ansVal.join(", ") : String(ansVal ?? "N/A")}</span>
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {isCorrect ? (
                            <CheckCircle2 className="h-6 w-6 text-green-400" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Form / Quiz Input Area */}
          {(!isQuiz || !hasSubmitted) && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl">
              <DynamicForm
                fields={form.fields}
                onSubmit={handleSubmit}
                initialData={previousResponse?.answers}
                isQuiz={isQuiz}
                readOnly={isQuiz && hasSubmitted}
              />
            </div>
          )}

          {/* Quiz Locked View (Read Only State) */}
          {isQuiz && hasSubmitted && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl space-y-6">
              <h3 className="text-xl font-bold text-slate-900 border-b pb-3">Your Answered Quiz</h3>
              <DynamicForm
                fields={form.fields}
                onSubmit={async () => {}}
                initialData={previousResponse.answers}
                isQuiz={isQuiz}
                readOnly={true}
              />
            </div>
          )}

        </div>
      </div>
    </>
  );
}