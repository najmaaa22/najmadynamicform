import { Navbar } from "@/components/layout/Navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* You can use admin-specific navbar if needed */}
      <Navbar />

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}