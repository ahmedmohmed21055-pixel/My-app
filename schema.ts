import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// Product schema for store inventory
export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "اسم الصنف مطلوب"),
  purchasePrice: z.number().min(0, "سعر الشراء يجب أن يكون موجب"),
  sellPrice: z.number().min(0, "سعر البيع يجب أن يكون موجب"),
  qty: z.number().int().min(0, "الكمية يجب أن تكون عدد صحيح موجب"),
  img: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// Insert schema (excluding auto-generated fields)
export const insertProductSchema = productSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Update schema (all fields optional except id)
export const updateProductSchema = productSchema.partial().required({ id: true });

// Types
export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

// AI request schema
export const aiRequestSchema = z.object({
  prompt: z.string().min(1, "السؤال مطلوب")
});

export type AIRequest = z.infer<typeof aiRequestSchema>;

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional()
});

export type APIResponse = z.infer<typeof apiResponseSchema>;