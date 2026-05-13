"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import api from "@/lib/api";

import DynamicForm from "@/components/form/DynamicForm";

import { FormSchema } from "@/types/form";

export default function FormRendererPage() {
  const { id } = useParams();

  const [form, setForm] =
    useState<FormSchema | null>(null);

  const [loading, setLoading] =
    useState(true);

  // =========================
  // FETCH FORM
  // =========================
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await api.get(
          `/forms/${id}`
        );

        setForm(res.data.data);
      } catch (err) {
        console.log(err);

        alert(
          "Form not found or expired"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchForm();
    }
  }, [id]);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-medium">
        Loading form...
      </div>
    );
  }

  // =========================
  // NOT FOUND
  // =========================
  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg font-semibold">
        Form not found
      </div>
    );
  }

  // =========================
  // RENDER DYNAMIC FORM
  // =========================
  return <DynamicForm form={form} />;
}