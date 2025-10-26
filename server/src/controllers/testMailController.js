import nodemailer from 'nodemailer'

export const sendTestMail = async (req, res) => {
  try {
    console.log('📨 sendTestMail controller triggered')

    // transporter setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER, // your Gmail address
        pass: process.env.MAIL_PASS, // your App Password
      },
    })

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: 'testreceiver@example.com',
      subject: 'Test Email from ARC Platform',
      text: 'Hello! This is a test email to verify Nodemailer integration.',
    }

    await transporter.sendMail(mailOptions)
    console.log('✅ Mail sent successfully')
    res.status(200).json({ success: true, message: 'Mail sent successfully!' })
  } catch (error) {
    console.error('❌ Error sending mail:', error)
    res.status(500).json({ success: false, error: 'Failed to send mail' })
  }
}
