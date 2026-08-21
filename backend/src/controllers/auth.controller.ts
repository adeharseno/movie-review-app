import type { RequestHandler } from 'express'

import { loginSchema } from '../schemas/auth.schema.js'
import { authenticateUser } from '../services/auth.service.js'

export const login: RequestHandler = async (request, response, next) => {
  const result = loginSchema.safeParse(request.body)

  if (!result.success) {
    response.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'A valid email and password are required.',
      },
    })
    return
  }

  try {
    const session = await authenticateUser(result.data.email, result.data.password)

    if (!session) {
      response.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email or password is incorrect.',
        },
      })
      return
    }

    response.json({ success: true, data: session })
  } catch (error) {
    next(error)
  }
}

export const getCurrentUser: RequestHandler = (request, response) => {
  response.json({
    success: true,
    data: {
      user: request.user,
    },
  })
}
