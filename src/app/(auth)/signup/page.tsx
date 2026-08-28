"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Mail, Phone, User, UserPlus } from "lucide-react";
import {
  AuthShell,
  GENDERS,
  otpSchema,
  registerSchema,
  useRegister,
  useVerifyRegistration,
} from "@/features/auth";
import type { Gender, RegisterFormValues } from "@/features/auth";
import { TooltipAlert } from "@/features/auth/components/tooltip-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api/axios";

type FieldKey = keyof RegisterFormValues | "otp";
type FormErrors = Partial<Record<FieldKey, string>>;

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

export default function SignupPage() {
  const router = useRouter();
  const register = useRegister();
  const verifyRegistration = useVerifyRegistration();

  const [form, setForm] = useState(EMPTY_FORM);
  const [gender, setGender] = useState<Gender | undefined>();
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeInput, setActiveInput] = useState<FieldKey | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  /** Flips once the API has emailed the verification code. */
  const [awaitingCode, setAwaitingCode] = useState(false);

  const isBusy = register.isPending || verifyRegistration.isPending;

  const set = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (value.trim().length > 0) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setToastMessage(null);

    if (awaitingCode) {
      const parsed = otpSchema.safeParse({ otp });
      if (!parsed.success) {
        setActiveInput("otp");
        setErrors({ otp: parsed.error.issues[0]?.message });
        return;
      }
      setErrors({});
      try {
        await verifyRegistration.mutateAsync({ email: form.email.trim(), otp });
        router.push("/login");
      } catch (err) {
        setToastMessage(
          err instanceof ApiError ? err.message : "That code did not work."
        );
      }
      return;
    }

    const parsed = registerSchema.safeParse({ ...form, gender });
    if (!parsed.success) {
      const next: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldKey;
        next[key] ??= issue.message;
      }
      setErrors(next);
      setActiveInput(Object.keys(next)[0] as FieldKey);
      return;
    }
    setErrors({});

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
      setToastMessage(
        err instanceof ApiError
          ? err.message
          : "Could not create your account. Try again."
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
        <UserPlus className="h-10 w-10 stroke-[1.5]" />
      </div>

      <h1 className="login_title">
        {awaitingCode ? "Verify your email" : "Create your account"}
      </h1>
      <p className="login_subtitle">
        {awaitingCode
          ? `We sent a 6-digit code to ${form.email}`
          : "Enter your details to get started"}
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-3" noValidate>
        {awaitingCode ? (
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
                onChange={(e) => setOtp(e.target.value)}
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
              <label className="login_input_label">Full name</label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <Input
                  type="text"
                  autoComplete="name"
                  value={form.fullName}
                  onFocus={() => setActiveInput("fullName")}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="enter your full name"
                  className="login_input_field"
                />
              </div>
              {activeInput === "fullName" && errors.fullName && (
                <TooltipAlert message={errors.fullName} />
              )}
            </div>

            <div>
              <label className="login_input_label">Email</label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <Input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onFocus={() => setActiveInput("email")}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="enter your email address"
                  className="login_input_field"
                />
              </div>
              {activeInput === "email" && errors.email && (
                <TooltipAlert message={errors.email} />
              )}
            </div>

            <div>
              <label className="login_input_label">Phone number</label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-gray-400">
                  <Phone className="h-4 w-4" />
                </span>
                <Input
                  type="tel"
                  autoComplete="tel"
                  value={form.phoneNumber}
                  onFocus={() => setActiveInput("phoneNumber")}
                  onChange={(e) => set("phoneNumber", e.target.value)}
                  placeholder="072 345 5674"
                  className="login_input_field"
                />
              </div>
              {activeInput === "phoneNumber" && errors.phoneNumber && (
                <TooltipAlert message={errors.phoneNumber} />
              )}
            </div>

            <div>
              <label className="login_input_label">Gender</label>
              <Select
                value={gender}
                onValueChange={(next) => setGender(next as Gender)}
              >
                <SelectTrigger className="login_input_field h-auto">
                  <SelectValue placeholder="select your gender" />
                </SelectTrigger>
                <SelectContent className="border-gray-200 bg-white text-gray-900">
                  {GENDERS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0) + option.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="login_input_label">Password</label>
              <div className="relative flex items-center">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onFocus={() => setActiveInput("password")}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="create a strong password"
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

            <div>
              <label className="login_input_label">Confirm password</label>
              <div className="relative flex items-center">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onFocus={() => setActiveInput("confirmPassword")}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  placeholder="re-enter your password"
                  className="login_input_field_pass"
                />
              </div>
              {activeInput === "confirmPassword" && errors.confirmPassword && (
                <TooltipAlert message={errors.confirmPassword} />
              )}
            </div>
          </>
        )}

        <Button type="submit" disabled={isBusy} className="login_submit_button">
          {isBusy ? "Please wait..." : awaitingCode ? "Verify" : "Create account"}
        </Button>

        {!awaitingCode && (
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?
            </span>
            &nbsp;
            <Link href="/login" className="login_forgot_link">
              Login
            </Link>
          </div>
        )}
      </form>
    </AuthShell>
  );
}
