import { Router } from 'express'
import { authRouter } from './auth.routes.js'
import { healthRouter } from './health.routes.js'
import { movieRouter } from './movie.routes.js'

export const apiRouter = Router()
apiRouter.use('/auth', authRouter)
apiRouter.use('/health', healthRouter)
apiRouter.use('/movies', movieRouter)
