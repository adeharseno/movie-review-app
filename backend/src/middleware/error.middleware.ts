import type { ErrorRequestHandler } from 'express'

export const handleError: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    response.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Request body must be valid JSON.',
      },
    })
    return
  }

  console.error(error)
  response.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    },
  })
}
