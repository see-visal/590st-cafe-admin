import { z } from "zod";

export const inventoryAdjustmentSchema = z.object({
  inventoryId: z.number().int().positive(),
  quantity: z.number().finite().refine((value) => value !== 0, "Quantity cannot be zero."),
});
