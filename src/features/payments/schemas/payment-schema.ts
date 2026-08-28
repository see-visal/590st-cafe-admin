import { z } from "zod";

export const paymentIdSchema = z.number().int().positive();
