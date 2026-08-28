import { z } from "zod";

export const reportFilterSchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});
