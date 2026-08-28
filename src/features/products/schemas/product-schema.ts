import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required."),
  price: z.number().positive("Price must be greater than zero."),
  categoryId: z.number().int().positive("Category is required."),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  imageUrl: z.string().trim().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
