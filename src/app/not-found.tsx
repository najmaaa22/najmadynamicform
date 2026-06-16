import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-lg mb-2">
        Sorry, we could not find the page you are looking for.
      </p>
      <Link href="/" className="text-blue-600 underline">
        Go back home
      </Link>
    </main>
  );
}
