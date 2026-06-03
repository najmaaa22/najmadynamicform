"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import API from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

type ResponseType = {
  _id: string;

  answers: Record<string, any>;

  score?: {
    obtained: number;
    total: number;
  };

  submittedAt?: string;

  createdAt?: string;

  version?: number;
};

type AnalyticsType = {
  totalResponses: number;

  averageScore: number | null;
};

export default function ResponsesPage() {
  const params = useParams();

  const id = params?.id as string;

  const [responses, setResponses] =
    useState<ResponseType[]>([]);

  const [analytics, setAnalytics] =
    useState<AnalyticsType | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  // ✅ LOAD DATA
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);

        await Promise.all([
          fetchResponses(),
          fetchAnalytics(),
        ]);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // ✅ FETCH RESPONSES
  const fetchResponses = async () => {
    try {
      const res = await API.get(
        `/forms/${id}/responses`
      );

      setResponses(
        res.data?.data || []
      );
    } catch (error) {
      console.log(
        "Responses Error:",
        error
      );
    }
  };

  // ✅ FETCH ANALYTICS
  const fetchAnalytics = async () => {
    try {
      const res = await API.get(
        `/forms/${id}/analytics`
      );

      setAnalytics(
        res.data?.data
      );
    } catch (error) {
      console.log(
        "Analytics Error:",
        error
      );
    }
  };

  // ✅ EXPORT CSV
  const exportCSV = () => {
    window.open(
      `http://localhost:5000/api/forms/${id}/export`,
      "_blank"
    );
  };

  // ✅ LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-slate-600">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-5">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-5 mb-8">

          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Response Dashboard
            </h1>

            <p className="text-slate-500 mt-2">
              Form ID:
              <span className="font-mono text-blue-600 ml-2">
                {id}
              </span>
            </p>
          </div>

          <Button onClick={exportCSV}>
            Export CSV
          </Button>
        </div>

        {/* ANALYTICS */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">

          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>
                Total Responses
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-5xl font-black">
                {analytics?.totalResponses || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle>
                Average Score
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-5xl font-black text-blue-600">
                {analytics?.averageScore
                  ? `${analytics.averageScore}%`
                  : "0%"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* RESPONSES */}
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>
              All Responses ({responses.length})
            </CardTitle>
          </CardHeader>

          <CardContent>

            {responses.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                No responses found
              </div>
            ) : (
              <div className="space-y-6">

                {responses.map((response) => (
                  <div
                    key={response._id}
                    className="border rounded-2xl p-6 bg-slate-50"
                  >

                    {/* TOP */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">

                      <div>
                        <h3 className="font-bold text-lg">
                          Submission
                        </h3>

                        <p className="text-xs text-slate-400 font-mono mt-1 break-all">
                          {response._id}
                        </p>
                      </div>

                      <div className="flex gap-3 flex-wrap">

                        {response.version && (
                          <div className="bg-white border px-4 py-2 rounded-xl text-sm font-semibold">
                            v{response.version}
                          </div>
                        )}

                        {response.score && (
                          <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
                            Score:
                            {" "}
                            {response.score.obtained}
                            /
                            {response.score.total}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ANSWERS */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                      {Object.entries(
                        response.answers || {}
                      ).map(([key, value]) => (
                        <div
                          key={key}
                          className="bg-white border rounded-xl p-4"
                        >
                          <p className="text-xs uppercase font-bold text-slate-400 mb-2">
                            {key}
                          </p>

                          <p className="text-slate-700 break-words]">
                            {Array.isArray(value)
                              ? value.join(", ")
                              : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* FOOTER */}
                    <div className="mt-5 pt-4 border-t text-sm text-slate-500">
                      Submitted:
                      {" "}
                      {new Date(
                        response.submittedAt ||
                        response.createdAt ||
                        ""
                      ).toLocaleString()}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}