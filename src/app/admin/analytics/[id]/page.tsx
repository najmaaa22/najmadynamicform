"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

type Analytics = {
  totalResponses: number;
  averageScore: number | null;
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
    return (
      <div className="p-10 text-center">
        Loading analytics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 text-center text-red-500">
        No data found
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Form Analytics
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4">

        <div className="p-4 border rounded shadow">
          <h2 className="text-sm text-gray-500">
            Total Responses
          </h2>
          <p className="text-2xl font-bold">
            {data.totalResponses}
          </p>
        </div>

        <div className="p-4 border rounded shadow">
          <h2 className="text-sm text-gray-500">
            Average Score
          </h2>
          <p className="text-2xl font-bold">
            {data.averageScore ?? "N/A"}
          </p>
        </div>

      </div>

      {/* NOTE */}
      <div className="text-sm text-gray-500">
        ⚠️ Detailed responses are not included in this API.
        (Only stats are returned)
      </div>

    </div>
  );
}