import { z } from "zod";

export const orderStatusSchema = z.object({
  status: z.string().trim().min(1, "Order status is required."),
});
