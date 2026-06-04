"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Eye, EyeOff, UserRound } from "lucide-react";
import { authService } from "@/features/auth/api/authApi";
import { ApiError } from "@/lib/apiClient";

export default function AuthPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.login(username.trim(), password);
      router.push("/");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Login failed. Check your credentials and try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1f1f1f] p-4 text-black sm:p-8">
      <p className="mb-4 text-sm text-white/50">Login</p>
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl overflow-hidden rounded-2xl bg-white lg:grid-cols-2">
        <section className="flex items-center justify-center px-6 py-12">
          <form onSubmit={handleSubmit} className="w-full max-w-lg">
            <div className="mb-16 flex justify-center">
              <Image
                src="/Logo/Logo.svg"
                alt="590st CAFE"
                width={120}
                height={70}
                priority
              />
            </div>

            <div className="mx-auto mb-8 grid h-24 w-24 place-items-center rounded-full bg-gray-200">
              <UserRound className="h-14 w-14" strokeWidth={1.6} />
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold">Login to your account</h1>
              <p className="mt-4 text-sm text-gray-500">
                Enter your credentials to access the admin dashboard
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <label className="block text-sm font-medium">
                Username
                <span className="relative mt-2 block">
                  <input
                    className="h-11 w-full rounded-md border border-gray-300 px-11 text-sm outline-none focus:border-[#befe35] focus:ring-2 focus:ring-lime-100"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
                </span>
              </label>

              <label className="block text-sm font-medium">
                Password
                <span className="relative mt-2 block">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="h-11 w-full rounded-md border border-gray-300 px-4 pr-11 text-sm outline-none focus:border-[#befe35] focus:ring-2 focus:ring-lime-100"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </span>
              </label>
            </div>

            {error ? (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            ) : null}

            <div className="mt-8 flex items-center justify-between gap-4 text-sm">
              <label className="inline-flex items-center gap-3">
                <span className="grid h-5 w-5 place-items-center rounded bg-black text-[#befe35]">
                  <Check className="h-4 w-4" />
                </span>
                Keep me logged in
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 h-12 w-full rounded-md bg-black text-sm font-semibold text-white disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>
        </section>

        <section className="relative hidden overflow-hidden bg-[#f7f6f1] lg:block">
          <div className="absolute left-16 top-28 h-72 w-52 -rotate-[28deg] rounded-lg bg-white p-4 shadow-2xl">
            <Poster title="590st CAFE" subtitle="Iced Coffee Collection" light />
          </div>
          <div className="absolute right-16 top-10 h-[430px] w-80 rotate-[28deg] rounded-lg bg-[#21140d] p-5 shadow-2xl">
            <Poster title="590st CAFE" subtitle="Refreshing!" />
          </div>
          <div className="absolute bottom-[-80px] left-48 h-72 w-56 -rotate-[20deg] rounded-lg bg-[#3b291b] p-4 shadow-2xl">
            <Poster title="Iced Latte" subtitle="Fresh coffee" />
          </div>
          <div className="absolute bottom-12 right-6 h-72 w-48 rotate-[20deg] rounded-lg bg-[#f6df7a] p-4 shadow-2xl">
            <Poster title="Coffee" subtitle="Best with everything" light />
          </div>
        </section>
      </div>
    </main>
  );
}

function Poster({
  title,
  subtitle,
  light = false,
}: {
  title: string;
  subtitle: string;
  light?: boolean;
}) {
  return (
    <div
      className={`flex h-full flex-col justify-between rounded-md border ${
        light ? "border-black/10 bg-white text-black" : "border-white/10 bg-black/20 text-white"
      } p-4`}
    >
      <Image src="/Logo/Logo.svg" alt="" width={64} height={34} />
      <div>
        <p className="text-5xl font-black leading-none">{title}</p>
        <p className="mt-3 text-lg font-semibold text-[#d88a2d]">{subtitle}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <span className="h-20 rounded-full bg-[#d88a2d]" />
        <span className="h-24 rounded-full bg-[#e8d0a8]" />
        <span className="h-20 rounded-full bg-[#5a331d]" />
      </div>
    </div>
  );
}
