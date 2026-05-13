"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api"; 
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Form {
  _id: string;
  title: string;
  description: string;
  isQuiz: boolean;
}

export default function AdminDashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
       
        const response = await API.get("/forms");
        
        console.log("Full Response from Backend:", response.data);

        let fetchedData = [];
        if (response.data && Array.isArray(response.data.data)) {
          fetchedData = response.data.data;
        } else if (response.data && Array.isArray(response.data.forms)) {
          fetchedData = response.data.forms;
        } else if (Array.isArray(response.data)) {
          fetchedData = response.data;
        }

        setForms(fetchedData);
      } catch (error: any) {
        console.error("Dashboard Fetch Error:", error);
     
        if (error.response?.status === 401) {
          alert("Session Expired! Please login again.");
          router.push("/login");
        } else {
          const msg = error.response?.data?.message || "Could not load forms";
          alert(`Error: ${msg}`);
        }
        setForms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [router]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500"></p>
          </div>
          <Link 
            href="/admin/create" 
            className="mt-4 md:mt-0 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg transition-all"
          >
            + Create New Form
          </Link>
        </div>

        {forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <div key={form._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800 line-clamp-1">{form.title}</h2>
                  {form.isQuiz && <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded">Quiz</span>}
                </div>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{form.description || "No description."}</p>
                <div className="flex gap-2">
                  <Link href={`/admin/analytics/${form._id}`} className="flex-1 text-center py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white">Analytics</Link>
                  <Link href={`/admin/responses/${form._id}`} className="flex-1 text-center py-2 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-600 hover:text-white">Responses</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400"></p>
          </div>
        )}
      </div>
    </div>
  );
}