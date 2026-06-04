import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 text-center">
      <h1 className="text-6xl font-black text-gray-900">404</h1>
      <p className="text-xl font-semibold text-gray-700">Page Not Found</p>
      <p className="text-sm text-gray-500">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/dashboard"
        className="h-10 rounded-md bg-black px-6 text-sm font-semibold text-white leading-10 hover:bg-gray-800 transition"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
