const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { firstName, email } = JSON.parse(event.body);
  if (!email) return { statusCode: 400, body: 'Missing email' };

  try {
    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Welcome to the Apothecary ✦',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #2c1810;">
          <h2 style="color: #6b3d2e;">Welcome${firstName ? ', ' + firstName : ''} ✦</h2>
          <p>You've stepped into something special.</p>
          <p>Amber's Alchemy Apothecary is a place of handcrafted herbal soaps, remedies, and light magic — made with intention and care.</p>
          <p style="margin: 32px 0;">
            <a href="${process.env.SITE_URL}/soap-builder" style="display:block; margin: 8px 0; color:#6b3d2e;">✦ Build your own custom soap</a>
            <a href="${process.env.SITE_URL}/find-my-remedy" style="display:block; margin: 8px 0; color:#6b3d2e;">✦ Find your herbal remedy</a>
            <a href="${process.env.SITE_URL}/grimoire" style="display:block; margin: 8px 0; color:#6b3d2e;">✦ Enter the Grimoire</a>
          </p>
          <p>We're so glad you're here.</p>
          <p style="margin-top: 40px;">With love and light,<br><strong>Amber ✦</strong><br>
          <a href="${process.env.SITE_URL}" style="color:#6b3d2e;">AwakenAgain.com</a></p>
        </div>
      `,
    });

    await sgMail.send({
      to: process.env.BUSINESS_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: `New Subscriber — ${email}`,
      text: `${firstName || ''} (${email}) just subscribed to the newsletter.`,
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Email send failed' };
  }
};
