import { z } from 'zod'

import { env } from '../config/env.js'

const searchResultSchema = z.object({
  imdbID: z.string(),
  Title: z.string(),
  Year: z.string(),
  Type: z.string(),
  Poster: z.string(),
})

const failedResponseSchema = z.object({
  Response: z.literal('False'),
  Error: z.string(),
})

const searchResponseSchema = z.union([
  z.object({
    Response: z.literal('True'),
    Search: z.array(searchResultSchema),
    totalResults: z.string(),
  }),
  failedResponseSchema,
])

const detailResponseSchema = z.union([
  z.object({
    Response: z.literal('True'),
    imdbID: z.string(),
    Title: z.string(),
    Year: z.string(),
    Rated: z.string(),
    Released: z.string(),
    Runtime: z.string(),
    Genre: z.string(),
    Director: z.string(),
    Actors: z.string(),
    Plot: z.string(),
    Poster: z.string(),
    Ratings: z.array(z.object({ Source: z.string(), Value: z.string() })),
    imdbRating: z.string(),
    Type: z.string(),
  }),
  failedResponseSchema,
])

export class MovieProviderError extends Error {}
export class MovieNotFoundError extends Error {}

const requestOmdb = async (params: Record<string, string>) => {
  if (!env.OMDB_API_KEY) {
    throw new MovieProviderError('OMDb API key is not configured')
  }

  const url = new URL('https://www.omdbapi.com/')
  url.searchParams.set('apikey', env.OMDB_API_KEY)

  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value)
  }

  let response: Response

  try {
    response = await fetch(url, { signal: AbortSignal.timeout(5000) })
  } catch {
    throw new MovieProviderError('OMDb request failed')
  }

  if (!response.ok) {
    throw new MovieProviderError(`OMDb returned HTTP ${response.status}`)
  }

  return response.json().catch(() => null)
}

const valueOrNull = (value: string) => (value === 'N/A' ? null : value)

export const searchMovies = async (query: string, page: number) => {
  const parsed = searchResponseSchema.safeParse(
    await requestOmdb({ s: query, page: String(page) }),
  )

  if (!parsed.success) {
    throw new MovieProviderError('OMDb returned an invalid response')
  }

  if (parsed.data.Response === 'False') {
    if (/not found/i.test(parsed.data.Error)) {
      return { movies: [], pagination: { page, totalResults: 0, totalPages: 0 } }
    }

    throw new MovieProviderError(`OMDb rejected the request: ${parsed.data.Error}`)
  }

  const totalResults = Number.parseInt(parsed.data.totalResults, 10)

  if (!Number.isSafeInteger(totalResults) || totalResults < 0) {
    throw new MovieProviderError('OMDb returned an invalid result count')
  }

  return {
    movies: parsed.data.Search.map((movie) => ({
      imdbId: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      type: movie.Type,
      poster: valueOrNull(movie.Poster),
    })),
    pagination: { page, totalResults, totalPages: Math.ceil(totalResults / 10) },
  }
}

export const getMovieById = async (imdbId: string) => {
  const parsed = detailResponseSchema.safeParse(await requestOmdb({ i: imdbId, plot: 'full' }))

  if (!parsed.success) {
    throw new MovieProviderError('OMDb returned an invalid response')
  }

  if (parsed.data.Response === 'False') {
    if (/not found|incorrect imdb/i.test(parsed.data.Error)) {
      throw new MovieNotFoundError('Movie not found')
    }

    throw new MovieProviderError(`OMDb rejected the request: ${parsed.data.Error}`)
  }

  return {
    imdbId: parsed.data.imdbID,
    title: parsed.data.Title,
    year: parsed.data.Year,
    rated: valueOrNull(parsed.data.Rated),
    released: valueOrNull(parsed.data.Released),
    runtime: valueOrNull(parsed.data.Runtime),
    genre: valueOrNull(parsed.data.Genre),
    director: valueOrNull(parsed.data.Director),
    actors: valueOrNull(parsed.data.Actors),
    plot: valueOrNull(parsed.data.Plot),
    poster: valueOrNull(parsed.data.Poster),
    ratings: parsed.data.Ratings.map((rating) => ({ source: rating.Source, value: rating.Value })),
    imdbRating: valueOrNull(parsed.data.imdbRating),
    type: parsed.data.Type,
  }
}
