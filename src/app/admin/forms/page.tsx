"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formService } from "@/lib/formService";
import type { Form as FormSchema } from "@/types";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function AdminFormsPage() {
  const router = useRouter();

  const [forms, setForms] = useState<FormSchema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);

      const data = await formService.getAll();
      setForms(data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this form?")) return;

    try {
      await formService.delete(id);
      toast.success("Form deleted");
      await fetchForms();
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete form");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-slate-500">Loading forms...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">All Forms</h1>

          {/* FIXED ROUTE */}
          <Button onClick={() => router.push("/create-form")}>
            + Create Form
          </Button>
        </div>

        {/* EMPTY STATE */}
        {forms.length === 0 && (
          <Card className="rounded-2xl">
            <CardContent className="p-10 text-center text-slate-500">
              <p className="mb-3">No forms yet</p>

              <Button onClick={() => router.push("/create-form")}>
                Create your first form
              </Button>
            </CardContent>
          </Card>
        )}

        {/* LIST */}
        {forms.map((form) => (
          <Card key={form._id} className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row justify-between items-start">

              {/* INFO */}
              <div className="space-y-1">
                <CardTitle className="text-xl">
                  {form.title}
                </CardTitle>

                <p className="text-sm text-slate-500">
                  {form.description}
                </p>

                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border border-slate-300 text-slate-700 bg-white">
                    v{form.version}
                  </span>

                  {form.isQuiz && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                      Quiz
                    </span>
                  )}

                  {form.isActive ? (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                      Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 flex-shrink-0">

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/edit/${form._id}`)
                  }
                >
                  Edit
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/responses/${form._id}`)
                  }
                >
                  Responses
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/analytics/${form._id}`)
                  }
                >
                  Analytics
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(form._id)}
                >
                  Delete
                </Button>

              </div>
            </CardHeader>
          </Card>
        ))}

      </div>
    </div>
  );
}