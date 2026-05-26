"use client";

export default function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-500">
      <div className="text-center">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
          Login is disabled.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          You can use the admin dashboard without Keycloak.
        </p>
      </div>
    </div>
  );
}
