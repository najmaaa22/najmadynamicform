"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Reply, Users, LayoutGrid, Plus, ArrowUpRight } from "lucide-react";

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
  description?: string;
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

    
      const formsRes = await api.get("/forms");
      
     
      const formsResult = formsRes.data;
      const forms: RecentForm[] = formsResult?.success ? formsResult.data : (formsResult || []);

      setRecentForms(forms.slice(0, 5));

    
      const responseCounts = await Promise.all(
        forms.map(async (form) => {
          try {
            const res = await api.get(`/responses/${form._id}/responses`);
            
          
            const resData = res.data;
            const responseList = resData?.success ? resData.data : resData;
            return Array.isArray(responseList) ? responseList.length : 0;
          } catch {
            return 0;
          }
        })
      );

      const totalResponses = responseCounts.reduce((a, b) => a + b, 0);

      setStats({
        totalForms: forms.length,
        totalResponses,
        totalUsers: 12,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Welcome back! Manage your forms, quizzes, and track user submissions.
            </p>
          </div>

          <Link href="/admin/forms/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm font-medium">
              <Plus className="h-4 w-4" /> Create New Form
            </Button>
          </Link>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-slate-500">Total Forms</CardTitle>
              <FileText className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-slate-900">{stats.totalForms}</p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-slate-500">Total Responses</CardTitle>
              <Reply className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-indigo-600">{stats.totalResponses}</p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-slate-500">Registered Users</CardTitle>
              <Users className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-emerald-600">{stats.totalUsers}</p>
            </CardContent>
          </Card>
        </div>

        {/* RECENT FORMS LIST */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-5">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-slate-400" />
              <CardTitle className="text-xl font-bold text-slate-800">Recent Forms & Quizzes</CardTitle>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 text-sm gap-1 hover:bg-indigo-50">
                View All <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="pt-6">
            {recentForms.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border border-dashed rounded-xl border-gray-200">
                No forms created yet. Click the button above to build one.
              </div>
            ) : (
              <div className="space-y-4">
                {recentForms.map((form) => (
                  <div
                    key={form._id}
                    className="flex flex-col sm:flex-row justify-between sm:items-center p-5 border border-gray-100 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all gap-4"
                  >
                    <div>
                      <h2 className="text-base font-bold text-slate-800">
                        {form.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs px-2.5 py-0.5 border border-gray-200 bg-white text-slate-600 rounded-md font-medium">
                          v{form.version}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold ${form.isQuiz ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {form.isQuiz ? "Quiz Mode" : "Standard Form"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/forms/${form._id}`} target="_blank">
                        <Button variant="outline" size="sm" className="text-slate-700 border-gray-200">
                          View
                        </Button>
                      </Link>
                      <Link href={`/admin/forms/${form._id}/analytics`}>
                        <Button size="sm" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 shadow-none">
                          Analytics
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