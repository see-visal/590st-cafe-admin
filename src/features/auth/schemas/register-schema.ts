import { z } from "zod";
import { GENDERS } from "@/features/auth/types/auth.type";

/** Mirrors ValidationPatterns.STRONG_PASSWORD_REGEX on the API. */
const STRONG_PASSWORD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

/** Mirrors ValidationPatterns.CAMBODIA_PHONE_REGEX on the API. */
const CAMBODIA_PHONE = /^0\d{2}\s?\d{3}\s?\d{3,4}$/;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, "Please enter your full name"),
    email: z
      .string()
      .trim()
      .min(1, "Please enter your email")
      .email("Email must be valid"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        STRONG_PASSWORD,
        "Use an uppercase letter, a lowercase letter, a digit and a special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phoneNumber: z
      .string()
      .trim()
      .regex(CAMBODIA_PHONE, "Enter a Cambodian number, e.g. 072 345 5674")
      .optional()
      .or(z.literal("")),
    gender: z.enum(GENDERS).optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits"),
});
