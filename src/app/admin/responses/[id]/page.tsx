"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Download, Users, BarChart2, Trophy } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function ResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ── Admin guard ──
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") router.replace("/login");
  }, [user, authLoading, router]);

  const loadAll = useCallback(async () => {
    try {
      const [formRes, respRes, analyticsRes] = await Promise.allSettled([
        api.get(`/forms/${id}`),
        api.get(`/forms/${id}/responses`),
        api.get(`/forms/${id}/analytics`), // FIX: correct route
      ]);

      if (formRes.status === "fulfilled")
        setForm(formRes.value.data.data || formRes.value.data);

      if (respRes.status === "fulfilled")
        setResponses(respRes.value.data.data || respRes.value.data || []);

      if (analyticsRes.status === "fulfilled")
        setAnalytics(analyticsRes.value.data.data || analyticsRes.value.data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && user?.role === "admin") loadAll();
  }, [id, user, loadAll]);

  const handleExport = async () => {
    try {
      const res = await api.get(`/forms/${id}/export`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      // FIX: meaningful filename using form title
      a.download = `${form?.title?.replace(/\s+/g, "-") || id}-responses.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch {
      toast.error("No responses to export yet");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-muted/30 py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="pt-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{form?.title ?? "Responses"}</h1>
              <p className="text-xs text-muted-foreground">Response Dashboard</p>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">Total Responses</span>
              </div>
              <p className="text-3xl font-bold">
                {analytics?.totalResponses ?? responses.length}
              </p>
            </CardContent>
          </Card>

          {form?.isQuiz && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Trophy className="h-4 w-4" />
                  <span className="text-xs">Average Score</span>
                </div>
                {/* FIX: null check — non-quiz or no submissions */}
                <p className="text-3xl font-bold">
                  {analytics?.averageScore != null
                    ? `${Number(analytics.averageScore).toFixed(1)}%`
                    : "—"}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart2 className="h-4 w-4" />
                <span className="text-xs">Version</span>
              </div>
              <p className="text-3xl font-bold">v{form?.version ?? "—"}</p>
            </CardContent>
          </Card>
        </div>

        {/* ── RESPONSES TABLE ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              All Responses ({responses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">
                No responses yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs whitespace-nowrap">
                        Submitted By
                      </TableHead>
                      <TableHead className="text-xs whitespace-nowrap">
                        Submitted At
                      </TableHead>
                      <TableHead className="text-xs">Ver</TableHead>
                      {form?.isQuiz && (
                        <TableHead className="text-xs">Score</TableHead>
                      )}
                      {form?.fields?.map((f: any) => (
                        <TableHead
                          key={f.fieldId}
                          className="text-xs whitespace-nowrap"
                        >
                          {f.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses.map((resp) => (
                      <TableRow key={resp._id}>
                        {/* Submitted by — populated user */}
                        <TableCell className="text-xs">
                          {resp.submittedBy?.name ||
                            resp.submittedBy?.email ||
                            "Anonymous"}
                        </TableCell>

                        <TableCell className="text-xs whitespace-nowrap">
                          {resp.submittedAt
                            ? format(
                                new Date(resp.submittedAt),
                                "MMM d, yyyy HH:mm"
                              )
                            : "—"}
                        </TableCell>

                        <TableCell className="text-xs">
                          <Badge variant="outline">v{resp.version}</Badge>
                        </TableCell>

                        {form?.isQuiz && (
                          <TableCell className="text-xs font-medium">
                            {resp.score
                              ? `${resp.score.obtained}/${resp.score.total}`
                              : "—"}
                          </TableCell>
                        )}

                        {form?.fields?.map((f: any) => {
                          const ans = resp.answers?.[f.fieldId];
                          return (
                            <TableCell
                              key={f.fieldId}
                              className="text-xs max-w-[160px] truncate"
                            >
                              {Array.isArray(ans)
                                ? ans.join(", ")
                                : (ans ?? "—")}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}