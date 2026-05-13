"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

type Response = {
  _id: string;
  answers: Record<string, any>;
  score?: number;
  submittedAt: string;
};

type Analytics = {
  totalResponses: number;
  averageScore: number;
  responses: Response[];
};

export default function AnalyticsPage() {
  const { id } = useParams();

  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/analytics/${id}`);
        setData(res.data.data);
      } catch (err) {
        console.log(err);
        alert("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAnalytics();
  }, [id]);
  if (loading) {
    return <div className="p-10 text-center">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="p-10 text-center text-red-500">No data found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Form Analytics</h1>
      <div className="grid grid-cols-2 gap-4">

        <div className="p-4 border rounded shadow">
          <h2 className="text-sm text-gray-500">Total Responses</h2>
          <p className="text-2xl font-bold">
            {data.totalResponses}
          </p>
        </div>

        <div className="p-4 border rounded shadow">
          <h2 className="text-sm text-gray-500">Average Score</h2>
          <p className="text-2xl font-bold">
            {data.averageScore}
          </p>
        </div>

      </div>
      <div className="space-y-4">

        <h2 className="text-lg font-semibold">
          Recent Responses
        </h2>

        {data.responses.map((res) => (
          <div
            key={res._id}
            className="border p-4 rounded space-y-2"
          >

            <p className="text-sm text-gray-500">
              {new Date(res.submittedAt).toLocaleString()}
            </p>

            {/* SCORE */}
            {res.score !== undefined && (
              <p className="font-semibold">
                Score: {res.score}
              </p>
            )}
            <div className="text-sm space-y-1">
              {Object.entries(res.answers).map(([key, value]) => (
                <p key={key}>
                  <span className="font-medium">{key}:</span>{" "}
                  {Array.isArray(value)
                    ? value.join(", ")
                    : String(value)}
                </p>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}