"use client";

/**
 * app/forms/page.tsx
 * User-facing: list of all forms/quizzes accessible to the logged-in user
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Trophy, ChevronRight, LogOut } from "lucide-react";
import { format } from "date-fns";

type Form = {
  _id: string;
  title: string;
  description?: string;
  isQuiz: boolean;
  version: number;
  createdAt: string;
};

export default function FormsListPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await api.get("/forms");
      setForms(res.data.data || res.data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">My Forms</h1>
            <p className="text-xs text-muted-foreground">Welcome, {user?.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : forms.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No forms available for you right now.</p>
          </div>
        ) : (
          forms.map((form) => (
            <Card
              key={form._id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/forms/${form._id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{form.title}</CardTitle>
                    {form.description && (
                      <CardDescription className="mt-0.5 text-xs line-clamp-2">
                        {form.description}
                      </CardDescription>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={form.isQuiz ? "default" : "secondary"} className="text-xs">
                    {form.isQuiz ? (
                      <><Trophy className="h-3 w-3 mr-1" />Quiz</>
                    ) : (
                      <><FileText className="h-3 w-3 mr-1" />Form</>
                    )}
                  </Badge>
                  <Badge variant="outline" className="text-xs">v{form.version}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {format(new Date(form.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}