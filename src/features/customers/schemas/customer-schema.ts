import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6),
  address: z.string().trim().optional(),
});
