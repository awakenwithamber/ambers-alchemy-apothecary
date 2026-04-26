const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { name, email, base, scent, color, botanical, shape, notes } = JSON.parse(event.body);
  if (!email || !name) return { statusCode: 400, body: 'Missing required fields' };

  try {
    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Your custom soap request is in ✦',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #2c1810;">
          <h2 style="color: #6b3d2e;">Hi ${name},</h2>
          <p>Your custom soap request has been received and Amber is already dreaming up your bar. ✦</p>
          <table style="width:100%; border-collapse:collapse; margin: 24px 0;">
            <tr style="background:#f9f0e8;"><td style="padding:8px 12px;font-weight:bold;">Base</td><td style="padding:8px 12px;">${base}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;">Scent</td><td style="padding:8px 12px;">${scent}</td></tr>
            <tr style="background:#f9f0e8;"><td style="padding:8px 12px;font-weight:bold;">Color</td><td style="padding:8px 12px;">${color}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:bold;">Botanical</td><td style="padding:8px 12px;">${botanical}</td></tr>
            <tr style="background:#f9f0e8;"><td style="padding:8px 12px;font-weight:bold;">Shape</td><td style="padding:8px 12px;">${shape}</td></tr>
            ${notes ? `<tr><td style="padding:8px 12px;font-weight:bold;">Notes</td><td style="padding:8px 12px;">${notes}</td></tr>` : ''}
          </table>
          <p>We'll be in touch within 1–2 business days to confirm your order.</p>
          <p style="margin-top:40px;">With love,<br><strong>Amber ✦</strong><br>
          <a href="${process.env.SITE_URL}" style="color:#6b3d2e;">AwakenAgain.com</a></p>
        </div>
      `,
    });

    await sgMail.send({
      to: process.env.BUSINESS_EMAIL,
      cc: process.env.BACKUP_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: `✦ New Custom Soap Request — ${name}`,
      html: `
        <p><strong>Customer:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Base:</strong> ${base}</p>
        <p><strong>Scent:</strong> ${scent}</p>
        <p><strong>Color:</strong> ${color}</p>
        <p><strong>Botanical:</strong> ${botanical}</p>
        <p><strong>Shape:</strong> ${shape}</p>
        <p><strong>Notes:</strong> ${notes || 'None'}</p>
      `,
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Email send failed' };
  }
};
