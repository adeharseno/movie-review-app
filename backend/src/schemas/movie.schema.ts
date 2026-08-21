import { z } from 'zod'

export const movieSearchSchema = z.object({
  q: z.string().trim().min(1),
  page: z.coerce.number().int().positive().default(1),
})

export const movieParamsSchema = z.object({
  imdbId: z.string().regex(/^tt\d{7,10}$/),
})

export const movieScoreSchema = z.object({
  score: z.number().int().min(1).max(10),
})
