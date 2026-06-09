'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ExportCSVButton } from '@/components/admin/ExportCSVButton';
import { ArrowLeft, Users, Percent, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


type AnalyticsData = {
  formTitle: string;
  isQuiz: boolean;
  totalResponses: number;
  averageScore: number;
  isPublic?: boolean; 
};

export default function FormAnalyticsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const res = await api.get(`/analytics/${id}`);
        const resData = res.data;
        
        if (resData?.success) {
          setAnalytics(resData.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-medium">Loading stats...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-10 text-slate-500">
        Analytics data unavailable.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6 bg-slate-50/50 min-h-screen">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="gap-2 text-gray-600 text-sm hover:bg-white border border-transparent hover:border-gray-100"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div>
          <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${analytics.isQuiz ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {analytics.isQuiz ? 'Quiz Performance' : 'Form Insights'}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{analytics.formTitle}</h1>
        </div>
        <ExportCSVButton formId={id as string} />
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-500">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-900">{analytics.totalResponses}</p>
          </CardContent>
        </Card>

        {analytics.isQuiz && (
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-slate-500">Average Class Score</CardTitle>
              <Percent className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-emerald-600">{analytics.averageScore}%</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}