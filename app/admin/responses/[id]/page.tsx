"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API from "@/lib/api";

type ResponseType = {
  _id: string;
  answers: Record<string, any>;
  score?: {
    obtained: number;
    total: number;
  };
  submittedAt?: string;
  createdAt?: string;
};

type AnalyticsType = {
  totalResponses: number;
  averageScore: number;
};

export default function ResponsesPage() {
  const params = useParams();
  const id = params?.id as string;

  const [responses, setResponses] = useState<ResponseType[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchResponses(), fetchAnalytics()]);
        setLoading(false);
      };
      loadData();
    }
  }, [id]);

  const fetchResponses = async () => {
    try {
      const res = await API.get(`/responses/${id}`);
      setResponses(res.data.data || []);
    } catch (error) {
      console.error("Fetch Responses Error:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await API.get(`/analytics/${id}`);
      setAnalytics(res.data.data);
    } catch (error) {
      console.error("Fetch Analytics Error:", error);
    }
  };

  const exportCSV = () => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api";

    window.open(`${apiUrl}/responses/${id}/export`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          Loading Admin Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-8 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-800">
                Response Dashboard
              </h1>
              <p className="text-slate-500 mt-2">
                ID: <span className="text-blue-600 font-mono">{id}</span>
              </p>
            </div>

            <button
              onClick={exportCSV}
              className="bg-blue-600 text-white px-8 py-3 rounded-2xl hover:bg-blue-700"
            >
              Export CSV Data
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <div className="bg-slate-50 p-6 rounded-2xl">
              <h2 className="text-sm font-bold text-slate-400">
                Total Submissions
              </h2>
              <p className="text-5xl font-black mt-3">
                {analytics?.totalResponses || 0}
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl">
              <h2 className="text-sm font-bold text-slate-400">
                Average Quiz Score
              </h2>
              <p className="text-5xl font-black mt-3 text-blue-600">
                {analytics?.averageScore?.toFixed(1) || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-8">
            Recent Responses ({responses.length})
          </h2>

          {responses.length === 0 ? (
            <p className="text-center text-slate-400 py-10">
              No responses yet
            </p>
          ) : (
            responses.map((response, index) => (
              <div
                key={response._id}
                className="border p-6 rounded-2xl mb-6"
              >
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="font-bold">User Submission</h3>
                    <p className="text-xs text-gray-400">
                      {response._id}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(response.answers).map(
                    ([key, value]) => (
                      <div key={key} className="p-3 bg-slate-50 rounded">
                        <p className="text-xs font-bold">{key}</p>
                        <p>{String(value)}</p>
                      </div>
                    )
                  )}
                </div>
                 {response.score && typeof response.score === "object" && (
                  <div className="mt-6 pt-4 border-t flex justify-between">
                    <span>Quiz Performance:</span>
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">
                      SCORE: {response.score.obtained}/{response.score.total}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}