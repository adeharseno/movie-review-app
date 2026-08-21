import type { RequestHandler } from 'express'

import { movieSearchSchema } from '../schemas/movie.schema.js'
import { MovieProviderError, searchMovies } from '../services/omdb.service.js'

export const search: RequestHandler = async (request, response, next) => {
  const query = movieSearchSchema.safeParse(request.query)

  if (!query.success) {
    response.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'A search query and positive page number are required.',
      },
    })
    return
  }

  try {
    const result = await searchMovies(query.data.q, query.data.page)
    response.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof MovieProviderError) {
      console.error(error.message)
      response.status(502).json({
        success: false,
        error: {
          code: 'MOVIE_PROVIDER_ERROR',
          message: 'Unable to retrieve movies.',
        },
      })
      return
    }

    next(error)
  }
}
