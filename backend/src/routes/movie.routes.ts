import { Router } from 'express'

import { search } from '../controllers/movie.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

export const movieRouter = Router()

movieRouter.get('/search', requireAuth, search)
