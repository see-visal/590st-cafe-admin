"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, KeyRound, Mail } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useForgotPasswordMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
} from "@/store/api/authApi";
import { parseForm, STRONG_PASSWORD_HINT } from "@/lib/validation";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/formSchemas";
import {
  AUTH_DIALOG_BADGE_CLASS,
  AUTH_DIALOG_CLASS,
  AUTH_FIELD_CLASS,
  AUTH_SUBMIT_CLASS,
} from "../authStyles";

type Step = "REQUEST" | "RESET";

type ApiError = Parameters<typeof apiErrorMessage>[0];

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  initialEmail,
  onReset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEmail: string;
  onReset: (email: string) => void;
}) {
  const [step, setStep] = useState<Step>("REQUEST");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [forgotPassword, { isLoading: isRequesting }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep("REQUEST");
      setEmail(initialEmail.trim());
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
    }
  }

  const busy = isRequesting || isResetting;

  const handleRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseForm(forgotPasswordSchema, { email });
    if (!parsed) return;

    try {
      await forgotPassword(parsed).unwrap();
      setEmail(parsed.email);
      setStep("RESET");
    } catch (err) {
      toast.error(apiErrorMessage(err as ApiError, "Could not send a reset code. Please try again."));
    }
  };

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!parseForm(resetPasswordSchema, { otp, newPassword, confirmPassword })) return;

    try {
      await resetPassword({ email, otp, newPassword }).unwrap();
      onReset(email);
      onOpenChange(false);
    } catch (err) {
      toast.error(apiErrorMessage(err as ApiError, "That code was not accepted. Check it and try again."));
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp({ purpose: "RESET_PASSWORD", email }).unwrap();
      toast.success("A new code is on its way. Codes from earlier emails no longer work.");
    } catch (err) {
      toast.error(apiErrorMessage(err as ApiError, "Could not resend the code. Please try again."));
    }
  };

  const backToEmail = () => {
    setStep("REQUEST");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && busy) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className={AUTH_DIALOG_CLASS}>
        {step === "REQUEST" ? (
          <form onSubmit={handleRequest} noValidate className="px-6 py-10 sm:px-10">
            <div className={AUTH_DIALOG_BADGE_CLASS}>
              <KeyRound className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" />
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold">Forgot your password?</h1>
              <p className="mt-3 text-sm text-gray-500">
                Enter the email of your staff account and we&apos;ll email you a 6-digit code to set a new password.
              </p>
            </div>

            <label className="mt-8 block text-sm font-medium">
              Email
              <span className="relative mt-2 block">
                <input
                  type="email"
                  className={`${AUTH_FIELD_CLASS} px-11`}
                  placeholder="admin@590st.cafe"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                />
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
              </span>
            </label>

            <button type="submit" disabled={isRequesting} className={AUTH_SUBMIT_CLASS}>
              {isRequesting ? "Sending code..." : "Send reset code"}
            </button>

            <div className="mt-6 text-center text-sm">
              <button type="button" onClick={() => onOpenChange(false)} className="text-gray-600 underline">
                Back to login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleReset} noValidate className="px-6 py-10 sm:px-10">
            <div className={AUTH_DIALOG_BADGE_CLASS}>
              <KeyRound className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" />
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold">Set a new password</h1>
              <p className="mt-3 text-sm text-gray-500">
                If an account exists for <span className="font-medium text-gray-700">{email}</span>, we sent it a
                6-digit code. Enter it below with your new password.
              </p>
            </div>

            <label className="mt-8 block text-sm font-medium">
              Verification code
              <input
                className={`${AUTH_FIELD_CLASS} mt-2 h-12 text-center text-2xl tracking-[0.5em]`}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
              />
            </label>

            <label className="mt-6 block text-sm font-medium">
              New password
              <span className="relative mt-2 block">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`${AUTH_FIELD_CLASS} px-4 pr-11`}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </span>
            </label>
            <p className="mt-2 text-xs text-gray-500">{STRONG_PASSWORD_HINT}</p>

            <label className="mt-6 block text-sm font-medium">
              Confirm new password
              <input
                type={showPassword ? "text" : "password"}
                className={`${AUTH_FIELD_CLASS} mt-2 px-4`}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>

            <button
              type="submit"
              disabled={isResetting || otp.length !== 6 || !newPassword || !confirmPassword}
              className={AUTH_SUBMIT_CLASS}
            >
              {isResetting ? "Resetting..." : "Reset password"}
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
              <button type="button" onClick={backToEmail} className="text-gray-600 underline">
                Use a different email
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
