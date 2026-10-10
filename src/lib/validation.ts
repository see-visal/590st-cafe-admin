import { z } from "zod";

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
