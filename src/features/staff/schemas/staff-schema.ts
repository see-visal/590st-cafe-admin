import { z } from "zod";
import { STAFF_ROLES } from "@/features/staff/types/staff.type";

export const staffSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(6, "Enter a valid phone number."),
  username: z.string().trim(),
  password: z.string().refine((value) => value.length === 0 || value.length >= 8, {
    message: "Use at least 8 characters.",
  }),
  role: z.enum(STAFF_ROLES),
});

export type StaffFormValues = z.infer<typeof staffSchema>;

export const STAFF_FORM_DEFAULTS: StaffFormValues = {
  name: "",
  email: "",
  phone: "",
  username: "",
  password: "",
  role: "BARISTA",
};
