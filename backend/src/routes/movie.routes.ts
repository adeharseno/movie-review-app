import { Router } from 'express'

import { getDetail, putScore, search } from '../controllers/movie.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

export const movieRouter = Router()

movieRouter.get('/search', requireAuth, search)
movieRouter.get('/:imdbId', requireAuth, getDetail)
movieRouter.put('/:imdbId/score', requireAuth, putScore)
