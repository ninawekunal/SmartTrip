import { z } from "zod";

export const createTripSchema = z.object({
  title: z.string().min(1).max(120),
  city: z.string().min(1).max(120),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export const updateTripSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  city: z.string().min(1).max(120).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional()
});

export const createStopSchema = z.object({
  name: z.string().min(1).max(120),
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
  placeId: z.string().max(255).optional(),
  notes: z.string().max(1000).optional()
});

export const updateStopSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  notes: z.string().max(1000).nullable().optional()
});

export const reorderStopsSchema = z.object({
  stopIdsInOrder: z.array(z.string().uuid()).min(1)
});
