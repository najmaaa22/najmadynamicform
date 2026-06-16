"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import DynamicForm from "@/components/DyanamicForm";

export default function FormPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [pageState, setPageState] = useState("loading");
  const [form, setForm] = useState<any>(null);
  const [existingResponse, setExistingResponse] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);

  const loadForm = useCallback(async () => {
    setPageState("loading");

    try {
      const [formRes, responseRes] = await Promise.allSettled([
        api.get(`/forms/${id}`),
        api.get(`/forms/${id}/my-response`),
      ]);

      if (formRes.status === "rejected") {
        setPageState("not_found");
        return;
      }

      const formData =
        (formRes.value as any).data?.data ||
        (formRes.value as any).data;

      setForm(formData);

      if (
        responseRes.status === "fulfilled" &&
        (responseRes.value as any).data?.data
      ) {
        const resp = (responseRes.value as any).data.data;

        setExistingResponse(resp);

        if (formData.isQuiz) {
          setScoreResult(resp.score || null);
        }
      }

      setPageState("form");
    } catch (error) {
      setPageState("not_found");
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id, loadForm]);

  const handleSubmit = async (answers: Record<string, any>) => {
    try {
      await api.post(`/forms/${id}/submit`, {
        answers,
        version: form?.version,
      });

      setPageState("submitted");
    } catch (error) {
      console.error(error);
    }
  };

  if (pageState === "loading") {
    return <div>Loading...</div>;
  }

  if (pageState === "not_found") {
    return <div>Form Not Found</div>;
  }

  if (pageState === "submitted") {
    return <div>Response Submitted Successfully</div>;
  }

  return (
    <div>
      {form && (
        <DynamicForm
  fields={form?.fields || []}
  initialData={(existingResponse as any)?.answers || {}}
  isQuiz={form?.isQuiz || false}
  onSubmit={handleSubmit}
  scoreResult={scoreResult}
/>
        
      )}
    </div>
  );
}