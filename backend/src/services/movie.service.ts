import { prisma } from '../config/prisma.js'
import { getMovieById } from './omdb.service.js'

export const getMovieDetail = async (imdbId: string, userId: string) => {
  const movie = await getMovieById(imdbId)
  const movieScore = await prisma.movieScore.findUnique({
    where: { userId_imdbId: { userId, imdbId } },
    select: { score: true },
  })

  return { movie, userScore: movieScore?.score ?? null }
}

export const setMovieScore = async (imdbId: string, userId: string, score: number) => {
  const existingScore = await prisma.movieScore.findUnique({
    where: { userId_imdbId: { userId, imdbId } },
    select: { id: true },
  })

  if (!existingScore) {
    await getMovieById(imdbId)
  }

  const movieScore = await prisma.movieScore.upsert({
    where: { userId_imdbId: { userId, imdbId } },
    update: { score },
    create: { userId, imdbId, score },
    select: { score: true },
  })

  return movieScore.score
}
