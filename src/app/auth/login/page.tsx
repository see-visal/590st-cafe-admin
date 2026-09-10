"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Eye, EyeOff, Mail, ShieldCheck, UserRound } from "lucide-react";

import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useLoginMutation,
  useResendOtpMutation,
  useVerifyLoginOtpMutation,
} from "@/store/api/authApi";

/**
 * Two-step login, matching the API: POST /api/auth/login either returns tokens outright
 * (super admin) or an `otpRequired` challenge carrying a `loginTicket`, which is exchanged
 * for tokens at /api/auth/verify-login-otp along with the 6-digit code emailed to the user.
 *
 * The local profile also logs the code; mail delivery is configured by the API.
 */
/**
 * AuthGuard appends ?next= when it bounces someone off a protected page.
 *
 * Read from `window.location` at submit time rather than with `useSearchParams`: that hook
 * opts the whole page out of prerendering, which would leave the login form blank until the
 * JS bundle loads. Only same-origin absolute paths are honoured, so a crafted ?next= cannot
 * redirect to another site.
 */
function resolveNextPath(): string {
  if (typeof window === "undefined") return "/";
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export default function AuthPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [loginTicket, setLoginTicket] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyLoginOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const handleCredentials = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const result = await login({ email: email.trim(), password }).unwrap();
      if (result.otpRequired && result.loginTicket) {
        setLoginTicket(result.loginTicket);
      } else {
        router.push(resolveNextPath());
      }
    } catch (err) {
      setError(
        apiErrorMessage(
          err as Parameters<typeof apiErrorMessage>[0],
          "Login failed. Check your credentials and try again."
        )
      );
    }
  };

  const handleOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!loginTicket) return;

    try {
      await verifyOtp({ loginTicket, otp: otp.trim() }).unwrap();
      router.push(resolveNextPath());
    } catch (err) {
      setError(
        apiErrorMessage(
          err as Parameters<typeof apiErrorMessage>[0],
          "That code was not accepted. Check it and try again."
        )
      );
    }
  };

  const handleResend = async () => {
    setError("");
    if (!loginTicket) return;
    try {
      await resendOtp({ purpose: "LOGIN", loginTicket }).unwrap();
    } catch (err) {
      setError(apiErrorMessage(err as Parameters<typeof apiErrorMessage>[0]));
    }
  };

  const otpStage = loginTicket !== null;

  return (
    <main className="min-h-screen bg-[#1f1f1f] p-4 text-black sm:p-8">
      <p className="mb-4 text-sm text-white/50">Login</p>
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl overflow-hidden rounded-2xl bg-white lg:grid-cols-2">
        <section className="flex items-center justify-center px-6 py-12">
          {otpStage ? (
            <form onSubmit={handleOtp} className="w-full max-w-lg">
              <div className="mb-16 flex justify-center">
                <Image
                  src="/logos/logo.svg"
                  alt="590st CAFE"
                  width={120}
                  height={70}
                  priority
                />
              </div>

              <div className="mx-auto mb-8 grid h-24 w-24 place-items-center rounded-full bg-gray-200">
                <ShieldCheck className="h-14 w-14" strokeWidth={1.6} />
              </div>

              <div className="text-center">
                <h1 className="text-2xl font-bold">Enter your code</h1>
                <p className="mt-4 text-sm text-gray-500">
                  We sent a 6-digit verification code to{" "}
                  <span className="font-medium text-gray-700">{email}</span>
                </p>
              </div>

              <label className="mt-8 block text-sm font-medium">
                Verification code
                <input
                  className="mt-2 h-12 w-full rounded-md border border-gray-300 text-center text-2xl tracking-[0.5em] outline-none focus:border-[#befe35] focus:ring-2 focus:ring-lime-100"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </label>

              {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

              <button
                type="submit"
                disabled={isVerifying || otp.length !== 6}
                className="mt-8 h-12 w-full rounded-md bg-black text-sm font-semibold text-white disabled:opacity-60"
              >
                {isVerifying ? "Verifying..." : "Verify and sign in"}
              </button>

              <div className="mt-6 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-gray-600 underline disabled:opacity-60"
                >
                  {isResending ? "Sending..." : "Resend code"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginTicket(null);
                    setOtp("");
                    setError("");
                  }}
                  className="text-gray-600 underline"
                >
                  Use a different account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCredentials} className="w-full max-w-lg">
              <div className="mb-16 flex justify-center">
                <Image
                  src="/logos/logo.svg"
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
                  Email
                  <span className="relative mt-2 block">
                    <input
                      type="email"
                      className="h-11 w-full rounded-md border border-gray-300 px-11 text-sm outline-none focus:border-[#befe35] focus:ring-2 focus:ring-lime-100"
                      placeholder="admin@590st.cafe"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
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
                      autoComplete="current-password"
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

              {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

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
                disabled={isLoggingIn}
                className="mt-8 h-12 w-full rounded-md bg-black text-sm font-semibold text-white disabled:opacity-60"
              >
                {isLoggingIn ? "Signing in..." : "Login"}
              </button>
            </form>
          )}
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
      <Image src="/logos/logo.svg" alt="" width={64} height={34} />
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
