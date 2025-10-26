import { Router } from 'express'
import { sendMail } from '../services/mailer.service.js'

const router = Router()


// ✅ Add this log right here
console.log('📨 testMail route loaded')

router.get('/mail', async (req, res) => {
  await sendMail({
    to: 'someone@example.com',
    subject: 'ARC Platform Test Email',
    html: '<h2>Hello from ARC!</h2><p>This is a test email from Nodemailer.</p>',
  })
  res.json({ message: 'Test email sent' })
})

export default router
