"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { AuthShell, authService } from "@/features/auth";
import { AuthField } from "@/features/auth/components/auth-field";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/axios";
import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Please enter your email")
  .email("Email must be valid");

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message);
      return;
    }
    setFieldError(undefined);
    setIsSending(true);

    try {
      await authService.forgotPassword(parsed.data);
      setSent(true);
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : "Could not send the reset link. Try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AuthShell>
      <form onSubmit={handleSubmit}>

        <h1 className="mt-8 text-center text-lg font-bold text-black">
          {sent ? "Check your email" : "Forgot your password?"}
        </h1>
        <p className="mt-1 text-center text-xs text-gray-500">
          {sent
            ? `If an account exists for ${email}, we have sent reset instructions.`
            : "Enter your email and we will send you reset instructions"}
        </p>

        {!sent && (
          <div className="mt-7">
            <AuthField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="user@gmail.com"
              leadingIcon={<Mail className="size-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldError}
            />
          </div>
        )}

        {formError && (
          <p role="alert"
            className="mt-3.5 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
            {formError}
          </p>
        )}

        {!sent && (
          <Button
            type="submit"
            disabled={isSending}
            className="mt-6 h-10 w-full rounded-lg bg-black text-sm font-medium text-white transition-colors hover:bg-gray-900"
          >
            {isSending ? "Sending..." : "Send reset link"}
          </Button>
        )}

        <p className="mt-5 text-center text-xs text-gray-500">
          <Link
            href="/login"
            className="font-semibold text-black underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
