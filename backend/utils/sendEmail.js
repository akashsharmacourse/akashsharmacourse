import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendWelcomeEmail({ to, name, email, password, loginUrl }) {
  await transporter.sendMail({
    from: `"AskAkashSharma" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your Course Access is Ready — AskAkashSharma',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#05070A;color:#F5F5F7;padding:40px;border-radius:16px;">
        <h2 style="color:#C9A84C;font-size:24px;">Welcome, ${name}!</h2>
        <p style="color:#8A8A9A;">Your payment was successful. Here are your login credentials:</p>
        <div style="background:#111A26;border-radius:10px;padding:24px;margin:24px 0;">
          <p style="margin:0 0 8px;color:#8A8A9A;font-size:13px;">LOGIN EMAIL</p>
          <p style="margin:0 0 20px;font-size:16px;font-weight:600;">${email}</p>
          <p style="margin:0 0 8px;color:#8A8A9A;font-size:13px;">PASSWORD</p>
          <p style="margin:0;font-size:16px;font-weight:600;">${password}</p>
        </div>
        <a href="${loginUrl}" style="display:block;text-align:center;background:#C9A84C;color:#000;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Access Your Course</a>
        <p style="margin-top:24px;color:#4A4A5A;font-size:12px;">Please change your password after first login. Do not share credentials with anyone.</p>
      </div>
    `,
  })
}

export async function sendOneOnOneConfirmationEmail({ to, name, calendlyLink }) {
  await transporter.sendMail({
    from: `"AskAkashSharma" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Payment Confirmed — Book Your 1-on-1 Session',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#05070A;color:#F5F5F7;padding:40px;border-radius:16px;">
        <h2 style="color:#C9A84C;">Payment Confirmed, ${name}!</h2>
        <p style="color:#8A8A9A;">Your 1-on-1 session with Akash Sir is confirmed. Click below to book your slot.</p>
        <a href="${calendlyLink}" style="display:block;text-align:center;background:#C9A84C;color:#000;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;margin:24px 0;">Book Your Session Slot</a>
        <p style="color:#4A4A5A;font-size:12px;">If you have any questions, reply to this email or WhatsApp us directly.</p>
      </div>
    `,
  })
}
