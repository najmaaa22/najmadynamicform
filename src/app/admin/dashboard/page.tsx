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

import { Button } from "@/components/ui/button";

type DashboardStats = {
  totalForms: number;
  totalResponses: number;
  totalUsers: number;
};

type RecentForm = {
  _id: string;
  title: string;
  version: number;
  isQuiz: boolean;
};

export default function AdminHome() {
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    totalResponses: 0,
    totalUsers: 0,
  });

  const [recentForms, setRecentForms] = useState<RecentForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const formsRes = await API.get("/forms/public");
      const forms: RecentForm[] = formsRes.data?.data || [];

      setRecentForms(forms.slice(0, 5));

      // 🚀 FIX: parallel API calls (faster)
      const responseCounts = await Promise.all(
        forms.map(async (form) => {
          try {
            const res = await API.get(
              `/forms/${form._id}/responses`
            );
            return res.data?.data?.length || 0;
          } catch {
            return 0;
          }
        })
      );

      const totalResponses = responseCounts.reduce(
        (a, b) => a + b,
        0
      );

      setStats({
        totalForms: forms.length,
        totalResponses,
        totalUsers: 0, // backend not ready yet
      });
    } catch (error) {
      console.log("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 mt-2">
              Dynamic Form Management System
            </p>
          </div>

          <Link href="/create-form">
            <Button>Create New Form</Button>
          </Link>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">

          <Card>
            <CardHeader>
              <CardTitle>Total Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold">
                {stats.totalForms}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-blue-600">
                {stats.totalResponses}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-green-600">
                {stats.totalUsers}
              </p>
            </CardContent>
          </Card>

        </div>

        {/* RECENT FORMS */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Recent Forms</CardTitle>

            <Link href="/forms">
              <Button variant="outline">View All</Button>
            </Link>
          </CardHeader>

          <CardContent>
            {recentForms.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                No forms created yet
              </div>
            ) : (
              <div className="space-y-4">
                {recentForms.map((form) => (
                  <div
                    key={form._id}
                    className="flex justify-between items-center border p-5 rounded-2xl bg-slate-50"
                  >
                    <div>
                      <h2 className="text-lg font-bold">
                        {form.title}
                      </h2>

                      <div className="flex gap-3 mt-2">
                        <span className="text-sm px-3 py-1 border rounded-full">
                          Version {form.version}
                        </span>

                        <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {form.isQuiz ? "Quiz" : "Form"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link href={`/forms/${form._id}`}>
                        <Button>Open</Button>
                      </Link>

                      <Link href={`/admin/responses/${form._id}`}>
                        <Button variant="outline">
                          Responses
                        </Button>
                      </Link>
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