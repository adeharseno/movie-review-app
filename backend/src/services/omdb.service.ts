import { z } from 'zod'

import { env } from '../config/env.js'

const searchResultSchema = z.object({
  imdbID: z.string(),
  Title: z.string(),
  Year: z.string(),
  Type: z.string(),
  Poster: z.string(),
})

const searchResponseSchema = z.discriminatedUnion('Response', [
  z.object({
    Response: z.literal('True'),
    Search: z.array(searchResultSchema),
    totalResults: z.string(),
  }),
  z.object({ Response: z.literal('False'), Error: z.string() }),
])

export class MovieProviderError extends Error {}

export const searchMovies = async (query: string, page: number) => {
  if (!env.OMDB_API_KEY) {
    throw new MovieProviderError('OMDb API key is not configured')
  }

  const url = new URL('https://www.omdbapi.com/')
  url.searchParams.set('apikey', env.OMDB_API_KEY)
  url.searchParams.set('s', query)
  url.searchParams.set('page', String(page))

  let response: Response

  try {
    response = await fetch(url, { signal: AbortSignal.timeout(5000) })
  } catch {
    throw new MovieProviderError('OMDb request failed')
  }

  if (!response.ok) {
    throw new MovieProviderError(`OMDb returned HTTP ${response.status}`)
  }

  const parsed = searchResponseSchema.safeParse(await response.json().catch(() => null))

  if (!parsed.success) {
    throw new MovieProviderError('OMDb returned an invalid response')
  }

  if (parsed.data.Response === 'False') {
    if (/not found/i.test(parsed.data.Error)) {
      return {
        movies: [],
        pagination: { page, totalResults: 0, totalPages: 0 },
      }
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
      poster: movie.Poster === 'N/A' ? null : movie.Poster,
    })),
    pagination: {
      page,
      totalResults,
      totalPages: Math.ceil(totalResults / 10),
    },
  }
}
