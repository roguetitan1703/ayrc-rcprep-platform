import nodemailer from 'nodemailer'
import templates from '../utils/emailTemplate.json' with { type: 'json' } 

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function replacePlaceholders(template, data) {
  let text = template
  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    text = text.replace(regex, data[key])
  }
  return text
}

export async function sendEmail(type, data) {
  const tmpl = templates[type]
  if (!tmpl) throw new Error(`Email template "${type}" not found`)

  const subject = replacePlaceholders(tmpl.subject, data)
  const html = replacePlaceholders(tmpl.html, data)

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: data.email,
    subject,
    html,
  }

  return transporter.sendEmail(mailOptions)
}
