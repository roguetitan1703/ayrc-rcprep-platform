import { ZodError } from 'zod'

export function notFound(req, res, next) {
  res.status(404).json({ error: 'Not Found' })
}

export function errorHandler(err, req, res, next) {
  console.error(err)

  // Handle Zod errors
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Wrong email format' })
  }

 // Handle Mongoose ValidationError (e.g., password too short)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ error: messages.join(', ') })
  }

  // Handle custom badRequest errors
  const status = err.status || 500
  const message = err.message || 'Server Error'
  res.status(status).json({ error: message, errorCode: err.code || null })
}
