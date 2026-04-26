const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { name, email, message } = JSON.parse(event.body);
  if (!email || !name) return { statusCode: 400, body: 'Missing required fields' };

  try {
    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'We received your message ✦',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #2c1810;">
          <h2 style="color: #6b3d2e;">Hi ${name},</h2>
          <p>Thank you for reaching out to Amber's Alchemy Apothecary.</p>
          <p>We've received your message and will be in touch within 1–2 business days.</p>
          <p style="margin-top: 40px;">With love and light,<br><strong>Amber ✦</strong><br>
          <a href="${process.env.SITE_URL}" style="color: #6b3d2e;">AwakenAgain.com</a></p>
        </div>
      `,
    });

    await sgMail.send({
      to: process.env.BUSINESS_EMAIL,
      cc: process.env.BACKUP_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: `New Contact Form Message — ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br>${message}</p>`,
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Email send failed' };
  }
};
