import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

import { env } from '../config/env.js'
import { prisma } from '../config/prisma.js'

const unauthorized = {
  success: false,
  error: {
    code: 'UNAUTHORIZED',
    message: 'Authentication is required.',
  },
}

export const requireAuth: RequestHandler = async (request, response, next) => {
  const [scheme, token] = request.headers.authorization?.split(' ') ?? []

  if (scheme !== 'Bearer' || !token) {
    response.status(401).json(unauthorized)
    return
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET)

    if (typeof payload === 'string' || !payload.sub) {
      response.status(401).json(unauthorized)
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    })

    if (!user) {
      response.status(401).json(unauthorized)
      return
    }

    request.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      response.status(401).json(unauthorized)
      return
    }

    next(error)
  }
}
