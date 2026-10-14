"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Check,
  Eye,
  EyeOff,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiErrorMessage } from "@/store/api/baseApi";
import {
  useLazyGetCurrentUserQuery,
  useLoginMutation,
  useLoginPhoneMutation,
  useLogoutMutation,
  useResendOtpMutation,
  useVerifyLoginOtpMutation,
} from "@/store/api/authApi";
import { formatPhoneInput, PHONE_MAX_LENGTH, PHONE_PLACEHOLDER } from "@/lib/phone";
import { parseForm } from "@/lib/validation";
import { emailLoginSchema, otpSchema, phoneLoginSchema } from "@/lib/formSchemas";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useI18n } from "@/contexts/I18nContext";
import { ForgotPasswordDialog } from "@/features/auth/components/ForgotPasswordDialog";
import {
  AUTH_DIALOG_BADGE_CLASS,
  AUTH_DIALOG_CLASS,
  AUTH_FIELD_CLASS as FIELD_CLASS,
  AUTH_SUBMIT_CLASS as SUBMIT_CLASS,
} from "@/features/auth/authStyles";

function resolveNextPath(): string {
  if (typeof window === "undefined") return "/";
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

type LoginMethod = "EMAIL" | "PHONE";

const LOGIN_METHOD_KEY = "loginMethod";

const parseLoginMethod = (raw: string | null): LoginMethod =>
  raw === "PHONE" || raw === "TELEGRAM" ? "PHONE" : "EMAIL";

export default function AuthPage() {
  const router = useRouter();
  const { t } = useI18n();

  const loginMethods: {
    value: LoginMethod;
    label: string;
    icon: typeof Mail;
    hint: string;
  }[] = [
    {
      value: "EMAIL",
      label: t("fields.email", "Email"),
      icon: Mail,
      hint: t(
        "auth.login.hints.email",
        "Enter your email and password to access the admin dashboard",
      ),
    },
    {
      value: "PHONE",
      label: t("auth.login.phone_number", "Phone number"),
      icon: Phone,
      hint: t(
        "auth.login.hints.phone",
        "Invited over Telegram? Enter your phone number and we'll send a code to your Telegram",
      ),
    },
  ];

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);
  const [method, setMethod] = useLocalStorageState<LoginMethod>(
    LOGIN_METHOD_KEY,
    parseLoginMethod,
  );
  const chooseMethod = (next: LoginMethod) => {
    setMethod(next);
  };

  const [loginTicket, setLoginTicket] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [loginPhone, { isLoading: isSendingPhoneCode }] =
    useLoginPhoneMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyLoginOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [fetchCurrentUser] = useLazyGetCurrentUserQuery();
  const [logout] = useLogoutMutation();
  const finishSignIn = async () => {
    let role;
    try {
      role = (await fetchCurrentUser(undefined, false).unwrap()).role;
    } catch {
      role = undefined;
    }
    if (role !== "CUSTOMER") {
      router.push(resolveNextPath());
      return;
    }
    try {
      await logout().unwrap();
    } catch {}
    setLoginTicket(null);
    setOtp("");
    setPassword("");
    toast.error(
      t(
        "auth.toast.customer_account",
        "This is a customer account. Customer accounts can't open the staff dashboard — sign in with an admin or barista account.",
      ),
    );
  };

  const handleCredentials = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const credentials = parseForm(emailLoginSchema, { email, password });
    if (!credentials) return;

    try {
      const result = await login({ ...credentials, remember: rememberMe }).unwrap();
      if (result.otpRequired && result.loginTicket) {
        setLoginTicket(result.loginTicket);
      } else {
        await finishSignIn();
      }
    } catch (err) {
      toast.error(
        apiErrorMessage(
          err as Parameters<typeof apiErrorMessage>[0],
          t(
            "auth.errors.login_failed",
            "Login failed. Check your credentials and try again.",
          ),
        ),
      );
    }
  };

  const handlePhone = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseForm(phoneLoginSchema, { phoneNumber: phone });
    if (!parsed) return;

    try {
      const result = await loginPhone(parsed).unwrap();
      if (result.loginTicket) setLoginTicket(result.loginTicket);
    } catch (err) {
      toast.error(
        apiErrorMessage(
          err as Parameters<typeof apiErrorMessage>[0],
          t(
            "auth.errors.send_code_failed",
            "Could not send a code to this number. Please try again.",
          ),
        ),
      );
    }
  };

  const handleOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loginTicket) return;
    const parsed = parseForm(otpSchema, { otp });
    if (!parsed) return;

    try {
      await verifyOtp({
        loginTicket,
        otp: parsed.otp,
        remember: rememberMe,
      }).unwrap();
      await finishSignIn();
    } catch (err) {
      toast.error(
        apiErrorMessage(
          err as Parameters<typeof apiErrorMessage>[0],
          t(
            "auth.errors.code_not_accepted",
            "That code was not accepted. Check it and try again.",
          ),
        ),
      );
    }
  };

  const handleResend = async () => {
    if (!loginTicket) return;
    try {
      await resendOtp({ purpose: "LOGIN", loginTicket }).unwrap();
    } catch (err) {
      toast.error(apiErrorMessage(err as Parameters<typeof apiErrorMessage>[0]));
    }
  };

  const otpStage = loginTicket !== null;
  const [otpSentBefore, otpSentAfter] = (
    method === "PHONE"
      ? t(
          "auth.otp.sent_telegram",
          "We sent a 6-digit verification code to your Telegram for {target}",
        )
      : t("auth.otp.sent_email", "We sent a 6-digit verification code to {target}")
  ).split("{target}");

  const backToCredentials = () => {
    setLoginTicket(null);
    setOtp("");
  };

  return (
    <main className="min-h-screen bg-[#1f1f1f] p-4 text-black sm:p-8">
      <p className="mb-4 text-sm text-white/50">
        {t("auth.login.page_label", "Login")}
      </p>
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
              <h1 className="text-2xl font-bold">
                {t("auth.login.heading", "Login to your account")}
              </h1>
              <p className="mt-3 text-sm text-gray-500">
                {loginMethods.find(({ value }) => value === method)?.hint}
              </p>
            </div>

            <div
              role="tablist"
              aria-label={t("auth.login.method_aria", "Sign-in method")}
              className="mt-8 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1"
            >
              {loginMethods.map(({ value, label, icon: Icon }) => (
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
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-8">
              {method === "PHONE" ? (
                <form onSubmit={handlePhone} noValidate>
                  <label className="block text-sm font-medium">
                    {t("auth.login.phone_number", "Phone number")}
                    <span className="relative mt-2 block">
                      <input
                        type="tel"
                        inputMode="tel"
                        className={`${FIELD_CLASS} px-11 tabular-nums`}
                        placeholder={PHONE_PLACEHOLDER}
                        value={phone}
                        onChange={(e) =>
                          setPhone(formatPhoneInput(e.target.value))
                        }
                        maxLength={PHONE_MAX_LENGTH}
                        autoComplete="tel-national"
                        required
                      />
                      <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
                    </span>
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    {t(
                      "auth.login.phone_help",
                      "The number your admin invited. The code arrives in the Telegram chat that accepted the invite.",
                    )}
                  </p>

                  <button
                    type="submit"
                    disabled={isSendingPhoneCode}
                    className={SUBMIT_CLASS}
                  >
                    {isSendingPhoneCode
                      ? t("auth.shared.sending_code", "Sending code...")
                      : t("auth.login.send_code", "Send code")}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCredentials}>
                  <div className="space-y-6">
                    <label className="block text-sm font-medium">
                      {t("fields.email", "Email")}
                      <span className="relative mt-2 block">
                        <input
                          type="email"
                          className={`${FIELD_CLASS} px-11`}
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
                      {t("fields.password", "Password")}
                      <span className="relative mt-2 block">
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`${FIELD_CLASS} px-4 pr-11`}
                          placeholder={t("fields.password", "Password")}
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
                            showPassword
                              ? t("auth.shared.hide_password", "Hide password")
                              : t("auth.shared.show_password", "Show password")
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

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className={SUBMIT_CLASS}
                  >
                    {isLoggingIn
                      ? t("auth.shared.signing_in", "Signing in...")
                      : t("auth.login.submit", "Login")}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-3 text-sm">
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
                {t("auth.login.remember_me", "Keep me logged in")}
              </label>
              {method === "EMAIL" ? (
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-sm font-medium text-gray-700 underline hover:text-black"
                >
                  {t("auth.login.forgot_password", "Forgot password?")}
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-[#f7f6f1] [container-type:size] lg:block">
          <div className="absolute left-[10%] top-[13%] aspect-[13/18] w-[min(32cqw,25cqh)] -rotate-[28deg] rounded-lg bg-white p-[2.5cqmin] shadow-2xl">
            <Poster
              title="590st CAFE"
              subtitle={t(
                "auth.login.posters.iced_coffee_collection",
                "Iced Coffee Collection",
              )}
              light
            />
          </div>
          <div className="absolute right-[10%] top-[5%] aspect-[32/43] w-[min(50cqw,38cqh)] rotate-[28deg] rounded-lg bg-[#21140d] p-[3cqmin] shadow-2xl">
            <Poster
              title="590st CAFE"
              subtitle={t("auth.login.posters.refreshing", "Refreshing!")}
            />
          </div>
          <div className="absolute -bottom-[10%] left-[30%] aspect-[7/9] w-[min(35cqw,27cqh)] -rotate-[20deg] rounded-lg bg-[#3b291b] p-[2.5cqmin] shadow-2xl">
            <Poster
              title={t("auth.login.posters.iced_latte", "Iced Latte")}
              subtitle={t("auth.login.posters.fresh_coffee", "Fresh coffee")}
            />
          </div>
          <div className="absolute bottom-[6%] right-[4%] aspect-[2/3] w-[min(30cqw,23cqh)] rotate-[20deg] rounded-lg bg-[#f6df7a] p-[2.5cqmin] shadow-2xl">
            <Poster
              title={t("auth.login.posters.coffee", "Coffee")}
              subtitle={t(
                "auth.login.posters.best_with_everything",
                "Best with everything",
              )}
              light
            />
          </div>
        </section>
      </div>

      <Dialog
        open={otpStage}
        onOpenChange={(next) => {
          if (!next && !isVerifying) backToCredentials();
        }}
      >
        <DialogContent className={AUTH_DIALOG_CLASS}>
          <form onSubmit={handleOtp} className="px-6 py-10 sm:px-10">
            <div className={AUTH_DIALOG_BADGE_CLASS}>
              <ShieldCheck className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" />
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold">
                {t("auth.otp.heading", "Enter your code")}
              </h1>
              <p className="mt-3 text-sm text-gray-500">
                {otpSentBefore}
                <span className="font-medium text-gray-700">
                  {method === "PHONE" ? phone : email}
                </span>
                {otpSentAfter}
              </p>
            </div>

            <label className="mt-8 block text-sm font-medium">
              {t("auth.shared.verification_code", "Verification code")}
              <input
                className={`${FIELD_CLASS} mt-2 h-12 text-center text-2xl tracking-[0.5em]`}
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

            <button
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              className={SUBMIT_CLASS}
            >
              {isVerifying
                ? t("auth.otp.verifying", "Verifying...")
                : t("auth.otp.verify", "Verify and sign in")}
            </button>

            <div className="mt-6 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-gray-600 underline disabled:opacity-60"
              >
                {isResending
                  ? t("states.sending", "Sending...")
                  : t("auth.shared.resend_code", "Resend code")}
              </button>
              <button
                type="button"
                onClick={backToCredentials}
                className="text-gray-600 underline"
              >
                {t("auth.otp.different_account", "Use a different account")}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ForgotPasswordDialog
        open={forgotOpen}
        onOpenChange={setForgotOpen}
        initialEmail={email}
        onReset={(resetEmail) => {
          setEmail(resetEmail);
          setPassword("");
          toast.success(
            t(
              "auth.toast.password_reset",
              "Password reset. Log in with your new password.",
            ),
          );
        }}
      />
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
