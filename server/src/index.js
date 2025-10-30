import 'dotenv/config'
import { connectDB } from './lib/db.js'
import app from './app.js'

const PORT = process.env.PORT || 4000

// Start after DB connect — app.js is the canonical place where routes and middleware are registered.
connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => console.log(`API listening on :${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to connect to DB:', err)
    process.exit(1)
  })

export default app
