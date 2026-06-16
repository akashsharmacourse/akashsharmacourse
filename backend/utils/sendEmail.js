import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail({ to, name, email, password, loginUrl }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AskAkashSharma <noreply@askakashsharma.in>',
      to,
      subject: 'Your Course Access is Ready — AskAkashSharma',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#05070A;color:#F5F5F7;padding:40px;border-radius:16px;">
          <h2 style="color:#C9A84C;font-size:24px;margin:0 0 8px;">Welcome, ${name}!</h2>
          <p style="color:#8A8A9A;margin:0 0 24px;">Your payment was successful. Here are your login credentials:</p>
          
          <div style="background:#111A26;border-radius:10px;padding:24px;margin:0 0 24px;">
            <p style="margin:0 0 4px;color:#8A8A9A;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Login Email</p>
            <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#F5F5F7;">${email}</p>
            <p style="margin:0 0 4px;color:#8A8A9A;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Password</p>
            <p style="margin:0;font-size:16px;font-weight:600;color:#F5F5F7;">${password}</p>
          </div>

          <a href="${loginUrl}" style="display:block;text-align:center;background:#C9A84C;color:#000;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;margin:0 0 24px;">
            Access Your Course
          </a>

          <div style="background:#111A26;border-radius:8px;padding:16px;margin:0 0 24px;">
            <p style="margin:0 0 8px;color:#8A8A9A;font-size:13px;">Join our WhatsApp group for updates and live session links:</p>
            <a href="${process.env.WHATSAPP_GROUP_LINK || '#'}" style="color:#C9A84C;font-weight:600;font-size:14px;">Join WhatsApp Group →</a>
          </div>

          <p style="margin:0;color:#4A4A5A;font-size:12px;line-height:1.6;">
            Please change your password after first login. Do not share your credentials with anyone.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error(error.message)
    }

    console.log('Welcome email sent:', data?.id)
    return data

  } catch (err) {
    console.error('sendWelcomeEmail error:', err)
    throw err
  }
}

export async function sendOneOnOneConfirmationEmail({ to, name, calendlyLink }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AskAkashSharma <noreply@askakashsharma.in>',
      to,
      subject: 'Payment Confirmed — Book Your 1-on-1 Session with Akash Sir',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#05070A;color:#F5F5F7;padding:40px;border-radius:16px;">
          <h2 style="color:#C9A84C;font-size:24px;margin:0 0 8px;">Payment Confirmed, ${name}!</h2>
          <p style="color:#8A8A9A;margin:0 0 24px;">Your 1-on-1 session with Akash Sir is confirmed. Click below to choose your preferred time slot.</p>

          <a href="${calendlyLink}" style="display:block;text-align:center;background:#C9A84C;color:#000;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;margin:0 0 24px;">
            Book Your Session Slot
          </a>

          <div style="background:#111A26;border-radius:8px;padding:16px;margin:0 0 24px;">
            <p style="margin:0 0 4px;color:#8A8A9A;font-size:13px;">Session details:</p>
            <p style="margin:0;color:#F5F5F7;font-size:14px;">Duration: 60 minutes · Platform: Google Meet / Zoom</p>
          </div>

          <p style="margin:0;color:#4A4A5A;font-size:12px;line-height:1.6;">
            If you have any questions, reply to this email or WhatsApp us directly.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend 1on1 error:', error)
      throw new Error(error.message)
    }

    console.log('1on1 confirmation email sent:', data?.id)
    return data

  } catch (err) {
    console.error('sendOneOnOneConfirmationEmail error:', err)
    throw err
  }
}
