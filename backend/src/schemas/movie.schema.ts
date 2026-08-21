import { z } from 'zod'

export const movieSearchSchema = z.object({
  q: z.string().trim().min(1),
  page: z.coerce.number().int().positive().default(1),
})
