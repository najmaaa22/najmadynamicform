"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Skeleton } from "@/components/ui/skeleton";

import {
  PlusCircle,
  MoreVertical,
  Pencil,
  Trash2,
  BarChart2,
  Download,
  FileText,
  Trophy,
  Users,
  LogOut,
  FileStack,
} from "lucide-react";

import toast from "react-hot-toast";
import { format } from "date-fns";

type Form = {
  _id: string;
  title: string;
  description?: string;
  isQuiz: boolean;
  version: number;
  isActive: boolean;
  allowedUsers: string[];
  createdAt: string;
  formGroupId: string;
};

type Analytics = {
  totalResponses: number;
  averageScore: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Form | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, Analytics>>({});

  // Admin guard
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchForms();
    }
  }, [user]);

  const fetchForms = async () => {
    try {
      const res = await api.get("/forms");
      const data: Form[] = res.data.data || res.data || [];
      setForms(data);
      data.forEach((f) => fetchAnalytics(f._id));
    } catch {
      toast.error("Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (formId: string) => {
    try {
      const res = await api.get(`/analytics/${formId}`);
      const data: Analytics = res.data.data || res.data;
      setAnalytics((prev) => ({ ...prev, [formId]: data }));
    } catch {
      // ignore
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/forms/${deleteTarget._id}`);
      setForms((prev) => prev.filter((f) => f._id !== deleteTarget._id));
      toast.success("Form deleted");
    } catch {
      toast.error("Failed to delete form");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleExport = async (formId: string) => {
    try {
      const res = await api.get(`/forms/${formId}/export`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `responses-${formId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch {
      toast.error("No responses to export");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* HEADER */}
      <div className="border-b bg-background">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-xl">
              <FileStack className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">FormCraft</h1>
              <p className="text-xs text-muted-foreground">
                {user?.name} · Admin
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => router.push("/admin/create")} size="sm">
              <PlusCircle className="h-4 w-4 mr-1" />
              New Form
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Stats bar */}
        {!loading && forms.length > 0 && (
          <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
            <span>{forms.length} form{forms.length !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span>
              {Object.values(analytics).reduce(
                (sum, a) => sum + (a.totalResponses ?? 0), 0
              )} total responses
            </span>
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : forms.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-2xl mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-lg">No forms yet</p>
            <p className="text-sm text-muted-foreground mb-6 mt-1">
              Create your first form to get started
            </p>
            <Button onClick={() => router.push("/admin/create")}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {forms.map((form) => {
              const stats = analytics[form._id];
              return (
                <Card key={form._id} className="relative hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 pr-10">
                    <CardTitle className="text-base">{form.title}</CardTitle>
                    {form.description && (
                      <CardDescription className="text-xs line-clamp-1">
                        {form.description}
                      </CardDescription>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant={form.isQuiz ? "default" : "secondary"}>
                        {form.isQuiz ? (
                          <><Trophy className="h-3 w-3 mr-1" />Quiz</>
                        ) : (
                          <><FileText className="h-3 w-3 mr-1" />Form</>
                        )}
                      </Badge>
                      <Badge variant="outline">v{form.version}</Badge>
                      <Badge variant={form.isActive ? "outline" : "secondary"}>
                        {form.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {form.allowedUsers?.length || 0} users
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart2 className="h-3 w-3" />
                        {stats?.totalResponses ?? 0} responses
                      </span>
                      {form.isQuiz && stats?.averageScore !== undefined && (
                        <span>Avg: {stats.averageScore.toFixed(1)}%</span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Created {format(new Date(form.createdAt), "MMM d, yyyy")}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/admin/responses/${form._id}`)}
                      >
                        <BarChart2 className="h-3 w-3 mr-1" />
                        Responses
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport(form._id)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>

                  {/* DROPDOWN MENU */}
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/edit/${form._id}`)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => setDeleteTarget(form)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* DELETE CONFIRM DIALOG */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &quot;{deleteTarget?.title}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the form and all its versions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}