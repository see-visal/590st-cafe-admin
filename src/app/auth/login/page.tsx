"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Mail,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TelegramLoginPanel } from "@/features/auth/components/TelegramLoginPanel";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useLoginMutation,
  useResendOtpMutation,
  useVerifyLoginOtpMutation,
} from "@/store/api/authApi";

// two step for authentication login page with email/password and Telegram login options. It handles user input, form submission, OTP verification, and error handling. The page also remembers the last login method used and provides a responsive design with a poster section for visual appeal.
function resolveNextPath(): string {
  if (typeof window === "undefined") return "/";
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

type LoginMethod = "EMAIL" | "TELEGRAM";

const LOGIN_METHODS: {
  value: LoginMethod;
  label: string;
  icon: typeof Mail;
}[] = [
  { value: "EMAIL", label: "Email", icon: Mail },
  { value: "TELEGRAM", label: "Telegram", icon: Send },
];

const LOGIN_METHOD_KEY = "loginMethod";

export default function AuthPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [rememberMe, setRememberMe] = useState(true);

  // Remembers the last method used on this browser, so a Telegram-only barista isn't sent back
  // to the email form every time. Restored after mount to keep the prerendered HTML stable.
  const [method, setMethod] = useState<LoginMethod>("EMAIL");
  useEffect(() => {
    try {
      if (window.localStorage.getItem(LOGIN_METHOD_KEY) === "TELEGRAM")
        setMethod("TELEGRAM");
    } catch {
      // Storage blocked — the email form is a fine default.
    }
  }, []);
  const chooseMethod = (next: LoginMethod) => {
    setMethod(next);
    setError("");
    try {
      window.localStorage.setItem(LOGIN_METHOD_KEY, next);
    } catch {
      // Not remembering the choice is harmless.
    }
  };

  const [loginTicket, setLoginTicket] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyLoginOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const handleCredentials = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      const result = await login({
        email: email.trim(),
        password,
        remember: rememberMe,
      }).unwrap();
      if (result.otpRequired && result.loginTicket) {
        setLoginTicket(result.loginTicket);
      } else {
        router.push(resolveNextPath());
      }
    } catch (err) {
      setError(
        apiErrorMessage(
          err as Parameters<typeof apiErrorMessage>[0],
          "Login failed. Check your credentials and try again.",
        ),
      );
    }
  };

  const handleOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!loginTicket) return;

    try {
      await verifyOtp({
        loginTicket,
        otp: otp.trim(),
        remember: rememberMe,
      }).unwrap();
      router.push(resolveNextPath());
    } catch (err) {
      setError(
        apiErrorMessage(
          err as Parameters<typeof apiErrorMessage>[0],
          "That code was not accepted. Check it and try again.",
        ),
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

  const backToCredentials = () => {
    setLoginTicket(null);
    setOtp("");
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#1f1f1f] p-4 text-black sm:p-8">
      <p className="mb-4 text-sm text-white/50">Login</p>
      {/* The card widens with a wide (zoomed-out) viewport instead of stopping at 80rem, so it
          keeps roughly the same proportions on screen at any zoom level. */}
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[clamp(80rem,70vw,120rem)] overflow-hidden rounded-2xl bg-white lg:grid-cols-2">
        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg min-[1920px]:max-w-xl">
            <div className="mb-12 flex justify-center">
              <Image
                src="/logos/logo-black.png"
                alt="590st CAFE"
                width={800}
                height={539}
                className="h-16 w-auto"
                priority
              />
            </div>

            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-gray-200">
              <UserRound className="h-12 w-12" strokeWidth={1.6} />
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold">Login to your account</h1>
              <p className="mt-3 text-sm text-gray-500">
                {method === "TELEGRAM"
                  ? "Sign in with the Telegram account your invite was sent to"
                  : "Enter your email and password to access the admin dashboard"}
              </p>
            </div>

            {/* Two ways in: staff invited over Telegram have no email or password at all, while
                the super admin and password-created staff sign in by email. */}
            <div
              role="tablist"
              aria-label="Sign-in method"
              className="mt-8 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1"
            >
              {LOGIN_METHODS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={method === value}
                  onClick={() => chooseMethod(value)}
                  className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors ${
                    method === value
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${value === "TELEGRAM" && method === value ? "text-[#229ED9]" : ""}`}
                  />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-8">
              {method === "TELEGRAM" ? (
                <TelegramLoginPanel
                  remember={rememberMe}
                  onSuccess={() => router.push(resolveNextPath())}
                />
              ) : (
                <form onSubmit={handleCredentials}>
                  <div className="space-y-6">
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
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
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

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="mt-8 h-12 w-full rounded-md bg-black text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {isLoggingIn ? "Signing in..." : "Login"}
                  </button>
                </form>
              )}
            </div>

            {/* Shared by both methods — it picks where the session is stored, not how you sign in. */}
            <label className="mt-6 inline-flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="sr-only"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span
                className={`grid h-5 w-5 place-items-center rounded border ${
                  rememberMe
                    ? "border-black bg-black text-[#befe35]"
                    : "border-gray-300 bg-white"
                }`}
              >
                {rememberMe && <Check className="h-4 w-4" />}
              </span>
              Keep me logged in
            </label>
          </div>
        </section>

        {/* Posters are placed and sized against this panel (container query units), not in fixed
            pixels, so the composition holds at any zoom level instead of drifting apart when
            zoomed out or piling up when zoomed in. */}
        <section className="relative hidden overflow-hidden bg-[#f7f6f1] [container-type:size] lg:block">
          <div className="absolute left-[10%] top-[13%] aspect-[13/18] w-[min(32cqw,25cqh)] -rotate-[28deg] rounded-lg bg-white p-[2.5cqmin] shadow-2xl">
            <Poster
              title="590st CAFE"
              subtitle="Iced Coffee Collection"
              light
            />
          </div>
          <div className="absolute right-[10%] top-[5%] aspect-[32/43] w-[min(50cqw,38cqh)] rotate-[28deg] rounded-lg bg-[#21140d] p-[3cqmin] shadow-2xl">
            <Poster title="590st CAFE" subtitle="Refreshing!" />
          </div>
          <div className="absolute -bottom-[10%] left-[30%] aspect-[7/9] w-[min(35cqw,27cqh)] -rotate-[20deg] rounded-lg bg-[#3b291b] p-[2.5cqmin] shadow-2xl">
            <Poster title="Iced Latte" subtitle="Fresh coffee" />
          </div>
          <div className="absolute bottom-[6%] right-[4%] aspect-[2/3] w-[min(30cqw,23cqh)] rotate-[20deg] rounded-lg bg-[#f6df7a] p-[2.5cqmin] shadow-2xl">
            <Poster title="Coffee" subtitle="Best with everything" light />
          </div>
        </section>
      </div>

      <Dialog
        open={otpStage}
        onOpenChange={(next) => {
          if (!next && !isVerifying) backToCredentials();
        }}
      >
        <DialogContent className="max-w-md gap-0 rounded-2xl border-none bg-white p-0 text-black shadow-2xl">
          <form onSubmit={handleOtp} className="px-6 py-10 sm:px-10">
            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-gray-200">
              <ShieldCheck className="h-11 w-11" strokeWidth={1.6} />
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold">Enter your code</h1>
              <p className="mt-3 text-sm text-gray-500">
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
                autoFocus
                required
              />
            </label>

            {error ? (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            ) : null}

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
                onClick={backToCredentials}
                className="text-gray-600 underline"
              >
                Use a different account
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
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
  // Type and spacing are in container units of the poster itself (the outer div is the
  // container, so the inner one's padding resolves against it too), letting the artwork scale
  // with the poster rather than overflowing it when the panel is small.
  return (
    <div
      className={`h-full rounded-md border [container-type:inline-size] ${
        light
          ? "border-black/10 bg-white text-black"
          : "border-white/10 bg-black/20 text-white"
      }`}
    >
      <div className="flex h-full flex-col justify-between p-[8cqw]">
        <Image
          src={light ? "/logos/logo-black.png" : "/logos/logo-white.png"}
          alt=""
          width={800}
          height={539}
          className="h-auto w-[30cqw]"
        />
        <div>
          <p className="text-[19cqw] font-black leading-none">{title}</p>
          <p className="mt-[5cqw] text-[8cqw] font-semibold leading-tight text-[#d88a2d]">
            {subtitle}
          </p>
        </div>
        <div className="grid grid-cols-3 items-end gap-[5cqw]">
          <span className="aspect-[1/2] rounded-full bg-[#d88a2d]" />
          <span className="aspect-[5/12] rounded-full bg-[#e8d0a8]" />
          <span className="aspect-[1/2] rounded-full bg-[#5a331d]" />
        </div>
      </div>
    </div>
  );
}
