"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, UserRound } from "lucide-react";
import {
  AuthShell,
  loginSchema,
  otpSchema,
  useLogin,
  useVerifyLoginOtp,
} from "@/features/auth";
import { AuthField } from "@/features/auth/components/auth-field";
import { AuthLogo } from "@/features/auth/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/axios";

type FieldErrors = Partial<Record<"email" | "password" | "otp", string>>;

function messageFor(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const verifyOtp = useVerifyLoginOtp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  /** Set once the API answers with an OTP challenge. */
  const [loginTicket, setLoginTicket] = useState<string | null>(null);

  const isBusy = login.isPending || verifyOtp.isPending;

  const handleCredentials = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        next[key] ??= issue.message;
      }
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});

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
      setFormError(
        messageFor(err, "Login failed. Check your credentials and try again.")
      );
    }
  };

  const handleOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const parsed = otpSchema.safeParse({ otp });
    if (!parsed.success) {
      setFieldErrors({ otp: parsed.error.issues[0]?.message });
      return;
    }
    setFieldErrors({});

    try {
      await verifyOtp.mutateAsync({
        loginTicket: loginTicket!,
        otp,
        persist: keepLoggedIn,
      });
      router.push("/dashboard");
    } catch (err) {
      setFormError(messageFor(err, "That code did not work. Try again."));
    }
  };

  return (
    <AuthShell>
      <form onSubmit={loginTicket ? handleOtp : handleCredentials}>
        <AuthLogo />

        <div className="mx-auto mt-9 grid size-14 place-items-center rounded-full border border-gray-300 text-gray-500">
          <UserRound className="size-7" strokeWidth={1.5} />
        </div>

        <h1 className="mt-4 text-center text-lg font-bold text-black">
          {loginTicket ? "Check your email" : "Login to your account"}
        </h1>
        <p className="mt-1 text-center text-xs text-gray-500">
          {loginTicket
            ? `We sent a 6-digit code to ${email}`
            : "Enter your credential to login"}
        </p>

        {loginTicket ? (
          <div className="mt-7">
            <AuthField
              label="Verification code"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              autoComplete="one-time-code"
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={fieldErrors.otp}
            />
          </div>
        ) : (
          <div className="mt-7 space-y-3.5">
            <AuthField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="Placeholder"
              leadingIcon={<UserRound className="size-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
            />
            <AuthField
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Placeholder"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="cursor-pointer transition-colors hover:text-black"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              }
            />
          </div>
        )}

        {formError && (
          <p
            role="alert"
            className="mt-3.5 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600"
          >
            {formError}
          </p>
        )}

        {!loginTicket && (
          <div className="mt-5 flex items-center justify-between gap-3 text-xs">
            <Label className="inline-flex cursor-pointer items-center gap-2 font-normal text-gray-700">
              <Checkbox
                checked={keepLoggedIn}
                onCheckedChange={(next) => setKeepLoggedIn(next === true)}
                className="size-4 rounded data-[state=checked]:border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
              />
              Keep me logged in
            </Label>
            <Link
              href="/forgot-password"
              className="text-gray-500 underline-offset-4 transition-colors hover:text-black hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <Button
          type="submit"
          disabled={isBusy}
          className="mt-6 h-10 w-full rounded-lg bg-black text-sm font-medium text-white transition-colors hover:bg-gray-900"
        >
          {isBusy ? "Please wait..." : loginTicket ? "Verify" : "Login"}
        </Button>

        {!loginTicket && (
          <p className="mt-5 text-center text-xs text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-black underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        )}
      </form>
    </AuthShell>
  );
}
