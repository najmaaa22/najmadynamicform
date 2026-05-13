"use client";
import { useState } from "react";
import API from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CreateFormPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isQuiz, setIsQuiz] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a form title!");
      return;
    }

    setLoading(true);

    try {
      const formData = {
        title: title.trim(),
        description: description.trim() || "",
        isQuiz,
        fields: [],
      };

      console.log("Submitting Data:", formData);

      const response = await API.post("/forms", formData);

      if (response.status === 201 || response.data?.success) {
        alert("Form created successfully! 🎉");
        router.push("/admin/dashboard");
      }
    } catch (error: any) {
      if (error.response) {
        console.error("Backend Error Data:", error.response.data);
        console.error("Status Code:", error.response.status);

        const msg =
          error.response.data?.message ||
          error.response.data?.error ||
          "Validation Failed";

        alert(`Error: ${msg}`);
      } else if (error.request) {
        console.error("Network/CORS Error:", error.request);
        alert("Server not responding. Check if your backend is running!");
      } else {
        console.error("Error Message:", error.message);
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Create New Form
        </h1>

        <form onSubmit={handleSaveForm} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Form Title
            </label>
            <input
              type="text"
              placeholder="Give your form a name"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Description
            </label>
            <textarea
              placeholder="What is this form about?"
              className="w-full p-2.5 border border-gray-300 rounded-lg h-28 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="quizMode"
              checked={isQuiz}
              onChange={(e) => setIsQuiz(e.target.checked)}
              className="w-5 h-5 text-green-600 border-gray-300 rounded cursor-pointer"
            />
            <label
              htmlFor="quizMode"
              className="text-sm font-semibold text-gray-700 cursor-pointer select-none"
            >
              Enable Quiz Mode
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-bold text-white rounded-lg shadow-md transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 active:scale-95"
            }`}
          >
            {loading ? "Creating..." : "Create Form"}
          </button>
        </form>
      </div>
    </div>
  );
}