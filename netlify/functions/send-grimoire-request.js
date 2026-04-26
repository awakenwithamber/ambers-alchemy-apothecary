const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { email } = JSON.parse(event.body);
  if (!email) return { statusCode: 400, body: 'Missing email' };

  try {
    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Your Grimoire access request is in ✦',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #2c1810;">
          <h2 style="color: #6b3d2e;">The request is received ✦</h2>
          <p>Amber will verify your subscription and send your Grimoire access within 24 hours.</p>
          <p>If you haven't subscribed yet:<br>
          <a href="${process.env.SITE_URL}/grimoire" style="color:#6b3d2e;">Join the Grimoire →</a></p>
          <p style="margin-top: 40px;">With love,<br><strong>Amber ✦</strong></p>
        </div>
      `,
    });

    await sgMail.send({
      to: process.env.BUSINESS_EMAIL,
      cc: process.env.BACKUP_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: `Grimoire Access Request — ${email}`,
      html: `<p>A visitor has requested Grimoire access.</p><p><strong>Email:</strong> ${email}</p><p>Please verify their subscription and reply to grant access.</p>`,
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Email send failed' };
  }
};
