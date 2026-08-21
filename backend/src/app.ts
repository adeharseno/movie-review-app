import express from 'express'
import { handleError } from './middleware/error.middleware.js'
import { successHeader } from './middleware/success-header.middleware.js'
import { apiRouter } from './routes/index.js'

export const app = express()
app.disable('x-powered-by')
app.use(express.json())
app.use(successHeader)
app.use('/api', apiRouter)
app.use(handleError)
