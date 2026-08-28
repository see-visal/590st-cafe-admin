"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Eye, EyeOff, User } from "lucide-react";
import {
  AuthShell,
  loginSchema,
  otpSchema,
  useLogin,
  useVerifyLoginOtp,
} from "@/features/auth";
import { TooltipAlert } from "@/features/auth/components/tooltip-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/axios";

type FieldKey = "email" | "password" | "otp";
type FormErrors = Partial<Record<FieldKey, string>>;

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const verifyOtp = useVerifyLoginOtp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeInput, setActiveInput] = useState<FieldKey | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  /** Set once the API answers with an OTP challenge. */
  const [loginTicket, setLoginTicket] = useState<string | null>(null);

  const isBusy = login.isPending || verifyOtp.isPending;

  /** Clears a field's error as soon as it has content, like the storefront. */
  const validateField = (field: FieldKey, value: string) => {
    if (value.trim().length > 0) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const collect = (issues: { path: PropertyKey[]; message: string }[]) => {
    const next: FormErrors = {};
    for (const issue of issues) {
      const key = issue.path[0] as FieldKey;
      next[key] ??= issue.message;
    }
    return next;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setToastMessage(null);

    if (loginTicket) {
      const parsed = otpSchema.safeParse({ otp });
      if (!parsed.success) {
        setActiveInput("otp");
        setErrors({ otp: parsed.error.issues[0]?.message });
        return;
      }
      setErrors({});
      try {
        await verifyOtp.mutateAsync({
          loginTicket,
          otp,
          persist: keepLoggedIn,
        });
        router.push("/dashboard");
      } catch (err) {
        setToastMessage(
          err instanceof ApiError ? err.message : "That code did not work."
        );
      }
      return;
    }

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const next = collect(parsed.error.issues);
      setActiveInput(next.email ? "email" : "password");
      setErrors(next);
      return;
    }
    setErrors({});

    try {
      const result = await login.mutateAsync({
        ...parsed.data,
        persist: keepLoggedIn,
      });
      if (result.otpRequired && result.loginTicket) {
        setLoginTicket(result.loginTicket);
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setToastMessage(
        err instanceof ApiError
          ? err.message
          : "Login failed. Check your credentials and try again."
      );
    }
  };

  return (
    <AuthShell>
      {toastMessage && (
        <div className="mb-4 w-full rounded-md bg-red-50 px-3 py-2 text-center text-xs text-red-600">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="login_avatar_circle">
        <User className="h-10 w-10 stroke-[1.5]" />
      </div>

      <h1 className="login_title">
        {loginTicket ? "Check your email" : "Login to your account"}
      </h1>
      <p className="login_subtitle">
        {loginTicket
          ? `We sent a 6-digit code to ${email}`
          : "Enter your credential to login"}
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
        {loginTicket ? (
          <div>
            <label className="login_input_label">Verification code</label>
            <div className="relative flex items-center">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                autoFocus
                onFocus={() => setActiveInput("otp")}
                onChange={(e) => {
                  setOtp(e.target.value);
                  validateField("otp", e.target.value);
                }}
                placeholder="enter the 6-digit code"
                className="login_input_field_pass"
              />
            </div>
            {activeInput === "otp" && errors.otp && (
              <TooltipAlert message={errors.otp} />
            )}
          </div>
        ) : (
          <>
            <div>
              <label className="login_input_label">Email</label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onFocus={() => setActiveInput("email")}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateField("email", e.target.value);
                  }}
                  placeholder="enter your email"
                  className="login_input_field"
                />
              </div>
              {activeInput === "email" && errors.email && (
                <TooltipAlert message={errors.email} />
              )}
            </div>

            <div>
              <label className="login_input_label">Password</label>
              <div className="relative flex items-center">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onFocus={() => setActiveInput("password")}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validateField("password", e.target.value);
                  }}
                  placeholder="enter your password"
                  className="login_input_field_pass"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {activeInput === "password" && errors.password && (
                <TooltipAlert message={errors.password} />
              )}
            </div>

            <div className="login_controls_row">
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <div
                  onClick={() => setKeepLoggedIn(!keepLoggedIn)}
                  className={`login_checkbox_box ${keepLoggedIn ? "checked" : ""}`}
                >
                  {keepLoggedIn && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
                <span className="text-xs font-medium text-gray-700">
                  Keep me logged in
                </span>
              </label>

              <Link href="/forgot-password" className="login_forgot_link">
                Forgot password?
              </Link>
            </div>
          </>
        )}

        <Button type="submit" disabled={isBusy} className="login_submit_button">
          {isBusy ? "Please wait..." : loginTicket ? "Verify" : "Login"}
        </Button>

        {!loginTicket && (
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don&apos;t have an account?
            </span>
            &nbsp;
            <Link href="/signup" className="login_forgot_link">
              Sign up
            </Link>
          </div>
        )}
      </form>
    </AuthShell>
  );
}
