import { z } from "zod";
import toast from "react-hot-toast";
import { PHONE_INVALID_MESSAGE, PHONE_PATTERN } from "@/lib/phone";

export const currencySchema = z.enum(["USD", "KHR"], {
  message: "Select a currency.",
});

export function buildCashPaymentSchema(minAmount: number) {
  return z.object({
    currency: currencySchema,
    amountTendered: z.coerce
      .number({ message: "Enter the amount handed over." })
      .positive({ message: "Enter the amount handed over." })
      .min(minAmount, {
        message: "Amount tendered is less than the total due.",
      }),
  });
}

export type CashPaymentFormValues = z.infer<
  ReturnType<typeof buildCashPaymentSchema>
>;

export const deliveryFeeSchema = z.object({
  fee: z.coerce
    .number({ message: "Enter the delivery fee." })
    .min(0, { message: "Delivery fee cannot be negative." }),
});

export function firstIssueMessage(
  error: z.ZodError,
  fallback = "Check the form and try again.",
): string {
  return error.issues[0]?.message ?? fallback;
}

// Mirrors the API's ValidationPatterns.STRONG_PASSWORD_REGEX (register, reset, change password, create staff).
export const STRONG_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const STRONG_PASSWORD_HINT =
  "At least 8 characters, including an uppercase letter, a lowercase letter, a number and a symbol.";

export const OTP_PATTERN = /^\d{6}$/;

/**
 * Validates form values against a schema. On failure it shows the first issue as an
 * error toast and returns null, so every admin form reports problems the same way.
 */
export function parseForm<S extends z.ZodType>(schema: S, values: z.input<S>): z.output<S> | null {
  const result = schema.safeParse(values);
  if (!result.success) {
    toast.error(firstIssueMessage(result.error));
    return null;
  }
  return result.data;
}

// ---- Field builders shared by the form schemas -------------------------------------

/** Required text, trimmed. `max` mirrors the API's @Size limit. */
export const requiredText = (label: string, max = 255) =>
  z
    .string()
    .trim()
    .min(1, { message: `${label} is required.` })
    .max(max, { message: `${label} must be ${max} characters or fewer.` });

/** Optional text, trimmed; blank becomes undefined. */
export const optionalText = (label: string, max = 255) =>
  z
    .string()
    .trim()
    .max(max, { message: `${label} must be ${max} characters or fewer.` })
    .transform((value) => value || undefined);

export const fullNameField = z
  .string()
  .trim()
  .min(1, { message: "Full name is required." })
  .min(2, { message: "Full name must be at least 2 characters." })
  .max(120, { message: "Full name must be 120 characters or fewer." });

export const emailField = z
  .string()
  .trim()
  .min(1, { message: "Email is required." })
  .pipe(z.email({ message: "Enter a valid email address." }))
  .transform((value) => value.toLowerCase());

export const optionalPhoneField = z
  .string()
  .trim()
  .refine((value) => !value || PHONE_PATTERN.test(value), { message: PHONE_INVALID_MESSAGE })
  .transform((value) => value || undefined);

export const requiredPhoneField = (requiredMessage = "Phone number is required.") =>
  z
    .string()
    .trim()
    .min(1, { message: requiredMessage })
    .regex(PHONE_PATTERN, { message: PHONE_INVALID_MESSAGE });

export const strongPasswordField = z
  .string()
  .min(1, { message: "Password is required." })
  .regex(STRONG_PASSWORD_PATTERN, { message: STRONG_PASSWORD_HINT });

export const otpField = z
  .string()
  .trim()
  .regex(OTP_PATTERN, { message: "Enter the 6-digit code." });

/** A select that must have a value; `T` keeps the option's union type after parsing. */
export const requiredChoice = <T extends string = string>(message: string) =>
  z
    .string()
    .min(1, { message })
    .transform((value) => value as T);

type NumberRules = {
  /** Inclusive lower bound. */
  min?: number;
  /** Exclusive lower bound (e.g. 0 for "greater than zero"). */
  greaterThan?: number;
  max?: number;
  integer?: boolean;
};

const toNumber = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.replace(/,/g, "").trim();
  return trimmed === "" ? undefined : Number(trimmed);
};

function numberRules(label: string, rules: NumberRules) {
  let schema = z.number({ message: `Enter a valid ${label}.` });
  if (rules.integer) schema = schema.int({ message: `${capitalise(label)} must be a whole number.` });
  if (rules.greaterThan !== undefined)
    schema = schema.gt(rules.greaterThan, { message: `${capitalise(label)} must be greater than ${rules.greaterThan}.` });
  if (rules.min !== undefined)
    schema = schema.min(rules.min, {
      message:
        rules.max !== undefined
          ? `${capitalise(label)} must be between ${rules.min} and ${rules.max}.`
          : `${capitalise(label)} must be ${rules.min} or more.`,
    });
  if (rules.max !== undefined)
    schema = schema.max(rules.max, {
      message:
        rules.min !== undefined
          ? `${capitalise(label)} must be between ${rules.min} and ${rules.max}.`
          : `${capitalise(label)} must be ${rules.max} or less.`,
    });
  return schema;
}

/** A required number typed into a text input ("1,250.50" is accepted). */
export const numberField = (label: string, rules: NumberRules = {}) =>
  z.preprocess(toNumber, numberRules(label, rules));

/** An optional number typed into a text input; blank becomes undefined. */
export const optionalNumberField = (label: string, rules: NumberRules = {}) =>
  z.preprocess(toNumber, numberRules(label, rules).optional());

function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
