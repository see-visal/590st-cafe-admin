"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Mail, Phone, UserRound } from "lucide-react";
import {
  AuthShell,
  GENDERS,
  otpSchema,
  registerSchema,
  useRegister,
  useVerifyRegistration,
} from "@/features/auth";
import { AuthField } from "@/features/auth/components/auth-field";
import { AuthLogo } from "@/features/auth/components/auth-shell";
import type { Gender, RegisterFormValues } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api/axios";

type FieldKey = keyof RegisterFormValues | "otp";
type FieldErrors = Partial<Record<FieldKey, string>>;

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
};

function messageFor(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export default function SignupPage() {
  const router = useRouter();
  const register = useRegister();
  const verifyRegistration = useVerifyRegistration();

  const [form, setForm] = useState(EMPTY_FORM);
  const [gender, setGender] = useState<Gender | undefined>();
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  /** Flips to true once the API has emailed the verification code. */
  const [awaitingCode, setAwaitingCode] = useState(false);

  const isBusy = register.isPending || verifyRegistration.isPending;
  const set = (key: keyof typeof EMPTY_FORM, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const parsed = registerSchema.safeParse({ ...form, gender });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldKey;
        next[key] ??= issue.message;
      }
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});

    try {
      await register.mutateAsync({
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        password: parsed.data.password,
        phoneNumber: parsed.data.phoneNumber || undefined,
        gender: parsed.data.gender,
      });
      setAwaitingCode(true);
    } catch (err) {
      setFormError(messageFor(err, "Could not create your account. Try again."));
    }
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const parsed = otpSchema.safeParse({ otp });
    if (!parsed.success) {
      setFieldErrors({ otp: parsed.error.issues[0]?.message });
      return;
    }
    setFieldErrors({});

    try {
      await verifyRegistration.mutateAsync({ email: form.email.trim(), otp });
      router.push("/login");
    } catch (err) {
      setFormError(messageFor(err, "That code did not work. Try again."));
    }
  };

  return (
    <AuthShell wide>
      <form onSubmit={awaitingCode ? handleVerify : handleRegister}>
        <AuthLogo />

        <h1 className="mt-8 text-center text-lg font-bold text-black">
          {awaitingCode ? "Verify your email" : "Create your account"}
        </h1>
        <p className="mt-1 text-center text-xs text-gray-500">
          {awaitingCode
            ? `We sent a 6-digit code to ${form.email}`
            : "Enter your details to get started"}
        </p>

        {awaitingCode ? (
          <div className="mt-7">
            <AuthField
              label="Verification code"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={fieldErrors.otp}
            />
          </div>
        ) : (
          <div className="mt-7 space-y-3.5">
            <AuthField
              label="Full name"
              autoComplete="name"
              placeholder="Customer Vip"
              leadingIcon={<UserRound className="size-4" />}
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              error={fieldErrors.fullName}
            />
            <AuthField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="user@gmail.com"
              leadingIcon={<Mail className="size-4" />}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              error={fieldErrors.email}
            />
            <AuthField
              label="Phone number (optional)"
              autoComplete="tel"
              placeholder="072 345 5674"
              leadingIcon={<Phone className="size-4" />}
              value={form.phoneNumber}
              onChange={(e) => set("phoneNumber", e.target.value)}
              error={fieldErrors.phoneNumber}
            />

            <div>
              <Label htmlFor="signup-gender" className="text-xs font-medium text-gray-700">
                Gender (optional)
              </Label>
              <Select
                value={gender}
                onValueChange={(next) => setGender(next as Gender)}
              >
                <SelectTrigger
                  id="signup-gender"
                  className="mt-1.5 h-9 w-full rounded-md border-gray-300 text-xs"
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0) + option.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <AuthField
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              error={fieldErrors.password}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              }
            />
            <AuthField
              label="Confirm password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              error={fieldErrors.confirmPassword}
            />
          </div>
        )}

        {formError && (
          <p role="alert"
            className="mt-3.5 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
            {formError}
          </p>
        )}

        <Button
          type="submit"
          disabled={isBusy}
          className="mt-6 h-10 w-full rounded-lg bg-black text-sm font-medium text-white transition-colors hover:bg-gray-900"
        >
          {isBusy ? "Please wait..." : awaitingCode ? "Verify" : "Create account"}
        </Button>

        {!awaitingCode && (
          <p className="mt-5 text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-black underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </p>
        )}
      </form>
    </AuthShell>
  );
}
