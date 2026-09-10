"use client";

import { clearTokens } from "@/lib/authStorage";

export default function Unauthorized() {
  const handleGoHome = () => {
    // No NextAuth session to end — the admin's session is the JWT pair it holds itself.
    clearTokens();
    window.location.href = "/auth/login";
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
      <p className="text-lg mb-6">
        You need <span className="font-semibold">ADMIN</span> role to access
        this application.
      </p>
      <button
        onClick={handleGoHome}
        className="mt-4 px-6 py-3 cursor-pointer bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-md transition-colors"
      >
        Go Back
      </button>
    </div>
  );
}
