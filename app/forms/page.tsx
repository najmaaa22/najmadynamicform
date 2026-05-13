"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import API from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

type Form = {
  _id: string;
  title: string;
  description?: string;
  version: number;
  isQuiz: boolean;
  fields: any[];
  createdAt?: string;
};

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await API.get("/forms");
      setForms(res.data.data || []);
    } catch (error) {
      console.log(error);
      alert("Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-lg">
        Loading forms...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              All Forms
            </h1>

            <p className="text-slate-500 mt-2">
              Dynamic Form Platform
            </p>
          </div>

          <Link href="/admin/create">
            <Button>
              Create Form
            </Button>
          </Link>
        </div>

        {/* EMPTY */}
        {forms.length === 0 && (
          <Card className="text-center py-10">
            <CardContent>
              <p className="text-slate-500">
                No forms available
              </p>
            </CardContent>
          </Card>
        )}

        {/* FORMS GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card
              key={form._id}
              className="rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {form.title}
                  </CardTitle>

                  {form.isQuiz ? (
                    <Badge>
                      Quiz
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Form
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">

                <p className="text-sm text-slate-500 line-clamp-2">
                  {form.description || "No description"}
                </p>

                <div className="space-y-1 text-sm text-slate-600">
                  <p>
                    Version: v{form.version}
                  </p>

                  <p>
                    Fields: {form.fields?.length || 0}
                  </p>

                  {form.createdAt && (
                    <p>
                      Created:{" "}
                      {new Date(
                        form.createdAt
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 pt-3">
                  <Link
                    href={`/forms/${form._id}`}
                    className="flex-1"
                  >
                    <Button className="w-full">
                      Open
                    </Button>
                  </Link>

                  <Link
                    href={`/admin/responses/${form._id}`}
                  >
                    <Button variant="outline">
                      Responses
                    </Button>
                  </Link>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}