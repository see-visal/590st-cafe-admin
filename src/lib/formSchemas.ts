import { z } from "zod";
import { ESTIMATE_MAX_MINUTES } from "@/lib/estimate";
import type { SellUnit, StockUnit, VariantLabel } from "@/store/api/types";
import {
  emailField,
  fullNameField,
  numberField,
  optionalNumberField,
  optionalPhoneField,
  optionalText,
  otpField,
  requiredChoice,
  requiredPhoneField,
  requiredText,
  strongPasswordField,
} from "@/lib/validation";

// Every schema mirrors the matching Coffee-Shop-API request DTO so the form catches
// what the server would reject. Messages are full sentences, shown as an error toast
// by `parseForm`.

// ---- Auth -------------------------------------------------------------------------

export const emailLoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, { message: "Password is required." }),
});

export const phoneLoginSchema = z.object({
  phoneNumber: requiredPhoneField(),
});

export const otpSchema = z.object({ otp: otpField });

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = z
  .object({
    otp: otpField,
    newPassword: strongPasswordField,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "The new passwords do not match.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, { message: "Enter your current password." }),
    next: strongPasswordField,
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "The new passwords do not match.", path: ["confirm"] })
  .refine((v) => v.next !== v.current, {
    message: "The new password must be different from the current one.",
    path: ["next"],
  });

// ---- People -----------------------------------------------------------------------

export const profileSchema = z.object({
  fullName: fullNameField,
  phoneNumber: optionalPhoneField,
});

export const userAccountSchema = profileSchema;

export const staffUpdateSchema = profileSchema;

export const staffCreateSchema = z.object({
  fullName: fullNameField,
  email: emailField,
  password: strongPasswordField,
  phoneNumber: optionalPhoneField,
});

export const staffInviteSchema = z.object({
  fullName: fullNameField,
  phoneNumber: requiredPhoneField("Phone number is required to invite via Telegram."),
});

export function attendanceSchema({ now, mustKeepCheckOut }: { now: string; mustKeepCheckOut: boolean }) {
  return z
    .object({
      baristaId: requiredChoice("Choose a staff member."),
      checkInAt: z.string().min(1, { message: "Choose a check-in time." }),
      checkOutAt: z.string().transform((value) => value || undefined),
      note: optionalText("Note"),
    })
    .refine((v) => v.checkInAt <= now, { message: "Check-in can't be in the future.", path: ["checkInAt"] })
    .refine((v) => !v.checkOutAt || v.checkOutAt <= now, {
      message: "Check-out can't be in the future — leave it empty if still on shift.",
      path: ["checkOutAt"],
    })
    .refine((v) => !v.checkOutAt || v.checkOutAt > v.checkInAt, {
      message: "Check-out must be after check-in.",
      path: ["checkOutAt"],
    })
    .refine((v) => !mustKeepCheckOut || Boolean(v.checkOutAt), {
      message: "A completed shift must keep a check-out time.",
      path: ["checkOutAt"],
    });
}

// ---- Catalog ----------------------------------------------------------------------

export const categorySchema = z.object({
  name: requiredText("Category name"),
  description: optionalText("Description"),
});

export const SKU_PATTERN = /^[A-Z0-9]+([-_.][A-Z0-9]+)*$/;
export const SKU_MAX_LENGTH = 64;
export const SKU_FORMAT_HINT = "Letters, digits and single - _ . separators, e.g. FD-COF-IL-001";

export function productSchema({ isCreate, hasNoCategories }: { isCreate: boolean; hasNoCategories: boolean }) {
  return z
    .object({
      name: requiredText("Product name"),
      description: optionalText("Description"),
      categoryId: requiredChoice(
        hasNoCategories ? "Create a category first — a product has to belong to one." : "Choose a category.",
      ),
      stockUnit: requiredChoice<StockUnit>("Choose a stock unit."),
      sellUnit: requiredChoice<SellUnit>("Choose a sell unit."),
      skuMode: z.string(),
      sku: z.string().trim(),
      unitsPerStock: optionalNumberField("units per stock", { min: 0.001 }),
      reorderLevel: optionalNumberField("reorder level", { min: 0 }),
      variantName: z.string().transform((value) => value as VariantLabel | ""),
      variantPrice: z.string(),
    })
    .refine(
      (v) => v.skuMode !== "MANUAL" || !v.sku || (v.sku.length <= SKU_MAX_LENGTH && SKU_PATTERN.test(v.sku)),
      { message: `Invalid SKU. ${SKU_FORMAT_HINT}.`, path: ["sku"] },
    )
    .refine((v) => !isCreate || Boolean(v.variantName), {
      message: "Choose a variant (e.g. Medium) for the starting price.",
      path: ["variantName"],
    })
    .refine((v) => !isCreate || startingPrice.safeParse(v.variantPrice).success, {
      message: "Enter a valid starting price (0 or more).",
      path: ["variantPrice"],
    });
}

const startingPrice = numberField("starting price", { min: 0 });

export function discountSchema(type: "PERCENTAGE" | "FIXED") {
  return z
    .object({
      value: numberField("discount", type === "PERCENTAGE" ? { greaterThan: 0, max: 100 } : { greaterThan: 0 }),
      start: z.string(),
      end: z.string(),
    })
    .refine((v) => !v.start || !v.end || v.end > v.start, {
      message: "End time must be after start time.",
      path: ["end"],
    });
}

export const variantSchema = z.object({
  price: numberField("price", { min: 0 }),
  sortOrder: optionalNumberField("display order", { min: 0, integer: true }),
});

export const extraSchema = z.object({
  name: requiredText("Extra name"),
  price: numberField("price", { min: 0 }),
  quantityOnHand: optionalNumberField("quantity on hand", { min: 0 }),
});

export const attachExtraSchema = z.object({
  extraId: requiredChoice("Choose an extra to offer."),
});

export function stockMovementSchema(kind: "STOCK_IN" | "STOCK_CUT") {
  return z.object({
    productId: requiredChoice("Choose a product first."),
    quantity: numberField("quantity", { greaterThan: 0 }),
    unitCost: kind === "STOCK_IN" ? numberField("unit cost", { min: 0 }) : z.any().transform(() => undefined),
    note: optionalText("Note", 500),
  });
}

// ---- Shop content -----------------------------------------------------------------

export const isUsableLink = (link: string) => link.startsWith("/") || /^https?:\/\//i.test(link);

export const bannerSchema = z.object({
  title: requiredText("Title"),
  linkUrl: optionalText("Link").refine((link) => !link || isUsableLink(link), {
    message: 'Link must be a shop path starting with "/" (e.g. /menu) or a full http(s) URL.',
  }),
  sortOrder: optionalNumberField("display order", { min: 0, integer: true }).transform((value) => value ?? 0),
});

export const eventSchema = z
  .object({
    title: requiredText("Title"),
    description: optionalText("Description"),
    startAt: z.string().min(1, { message: "Choose when the event starts." }),
    endAt: z.string().min(1, { message: "Choose when the event ends." }),
    latitude: optionalNumberField("latitude", { min: -90, max: 90 }),
    longitude: optionalNumberField("longitude", { min: -180, max: 180 }),
  })
  .refine((v) => new Date(v.endAt).getTime() > new Date(v.startAt).getTime(), {
    message: "The end must come after the start.",
    path: ["endAt"],
  })
  .refine((v) => (v.latitude === undefined) === (v.longitude === undefined), {
    message: "Latitude and longitude must be given together.",
    path: ["longitude"],
  });

export const tableSchema = z.object({
  tableNumber: z
    .string()
    .trim()
    .min(1, { message: "Table number is required." })
    .regex(/^[A-Za-z0-9-]{1,20}$/, { message: "Use 1–20 letters, digits or dashes for the table number." }),
  size: requiredChoice("Choose a table size."),
  capacity: optionalNumberField("seats", { min: 1, max: 50, integer: true }),
});

// ---- Settings & orders ------------------------------------------------------------

export const exchangeRateSchema = z.object({
  khrPerUsd: numberField("exchange rate", { greaterThan: 0 }),
  marketRate: optionalNumberField("market rate", { greaterThan: 0 }),
});

export const estimateMinutesSchema = z.object({
  minutes: numberField("number of minutes", { min: 1, max: ESTIMATE_MAX_MINUTES, integer: true }),
});
