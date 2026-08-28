import { z } from "zod";

export const kitchenOrderStatusSchema = z.enum([
  "CONFIRMED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "CANCELLED",
]);
