export function notFound(req, res, next) {
  res.status(404).json({ error: 'Not Found' })
}

export function errorHandler(err, req, res, next) {
  console.error(err)
  const status = err.status || 500
  const message = err.message || 'Server Error'
  res.status(status).json({ error: message, errorCode: err.code || null })
}
