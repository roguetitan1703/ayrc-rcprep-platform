import 'dotenv/config'
import { connectDB } from './src/lib/db.js'
import app from './src/app.js'

const PORT = process.env.PORT || 4000

connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`API listening on http://localhost:${PORT}`)
    })
}).catch((err) => {
    console.error('Failed to connect to DB:', err)
    process.exit(1)
})
