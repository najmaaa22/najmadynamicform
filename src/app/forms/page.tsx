import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";

interface Form {
  _id: string;
  title: string;
  description: string;
  version: number;
}

async function getForms(): Promise<Form[]> {
  try {
    const res = await fetch("http://localhost:5000/api/forms", {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("API Error:", res.status);
      return [];
    }

    const data = await res.json();

    console.log("Forms API Response:", data);

    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.data)) {
      return data.data;
    }

    if (data && Array.isArray(data.forms)) {
      return data.forms;
    }

    if (data && data.success && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching forms:", error);
    return [];
  }
}

export default async function FormsPage() {
  const forms = await getForms();

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Available Forms
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forms?.length === 0 ? (
            <div className="col-span-3 text-center py-12 border rounded-xl">
              <p className="text-gray-500">
                No active forms available.
              </p>
            </div>
          ) : (
            forms.map((form) => (
              <Link
                key={form._id}
                href={`/forms/${form._id}`}
              >
                <Card hover className="p-6">
                  <h3 className="text-lg font-semibold">
                    {form.title}
                  </h3>

                  <p className="text-gray-600 mt-2">
                    {form.description ||
                      "No description provided"}
                  </p>

                  <p className="text-xs text-indigo-600 mt-4">
                    Version {form.version || 1}
                  </p>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}