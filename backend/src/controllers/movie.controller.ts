import type { NextFunction, RequestHandler, Response } from 'express'

import { movieParamsSchema, movieScoreSchema, movieSearchSchema } from '../schemas/movie.schema.js'
import { getMovieDetail, setMovieScore } from '../services/movie.service.js'
import { MovieNotFoundError, MovieProviderError, searchMovies } from '../services/omdb.service.js'

const handleMovieLookupError = (error: unknown, response: Response, next: NextFunction) => {
  if (error instanceof MovieNotFoundError) {
    response.status(404).json({
      success: false,
      error: { code: 'MOVIE_NOT_FOUND', message: 'Movie not found.' },
    })
    return
  }

  if (error instanceof MovieProviderError) {
    console.error(error.message)
    response.status(502).json({
      success: false,
      error: { code: 'MOVIE_PROVIDER_ERROR', message: 'Unable to retrieve movie details.' },
    })
    return
  }

  next(error)
}

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

export const getDetail: RequestHandler = async (request, response, next) => {
  const params = movieParamsSchema.safeParse(request.params)

  if (!params.success) {
    response.status(400).json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'A valid IMDb ID is required.' },
    })
    return
  }

  try {
    const detail = await getMovieDetail(params.data.imdbId, request.user!.id)
    response.json({ success: true, data: detail })
  } catch (error) {
    handleMovieLookupError(error, response, next)
  }
}

export const putScore: RequestHandler = async (request, response, next) => {
  const params = movieParamsSchema.safeParse(request.params)
  const body = movieScoreSchema.safeParse(request.body)

  if (!params.success || !body.success) {
    response.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'A valid IMDb ID and integer score from 1 to 10 are required.',
      },
    })
    return
  }

  try {
    const score = await setMovieScore(params.data.imdbId, request.user!.id, body.data.score)
    response.json({ success: true, data: { score } })
  } catch (error) {
    handleMovieLookupError(error, response, next)
  }
}
