// api/ai.js
// AI-powered herbal advisor endpoint using the Vercel AI Gateway.
// Uses VERCEL_OIDC_TOKEN (auto-injected by Vercel) — no API key needed.
//
// POST /api/ai/chat
//   body: { message: string, history?: [{role, content}] }
//   returns: streaming text response

const { streamText } = require('ai');

const SYSTEM_PROMPT = `You are the Amber's Alchemy Apothecary herbal advisor — a warm, knowledgeable guide for visitors exploring herbal wellness.

Guidelines:
- Be warm, grounded, and approachable — like a knowledgeable friend, not a clinical reference.
- Recommend herbs, teas, and natural remedies from a holistic perspective.
- Suggest specific herbs (e.g., ashwagandha, chamomile, valerian, passionflower, rhodiola) when relevant.
- Always remind visitors that herbal remedies complement but don't replace professional medical advice.
- Never diagnose conditions or claim to cure, treat, or prevent disease.
- Keep responses concise — 2-4 short paragraphs max.
- If someone asks about serious medical conditions, encourage them to consult a healthcare provider.
- Match the mystical, nature-rooted tone of the apothecary — references to moon cycles, seasons, and earth wisdom are welcome when natural.
- You represent Amber's Alchemy Apothecary at AwakenAgain.com.

Never provide:
- Specific dosages for medical conditions
- Advice for pregnant or nursing individuals beyond "consult your provider"
- Recommendations to replace prescribed medications`;

async function chat(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
  }

  try {
    // Build conversation messages from history + current message
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const result = streamText({
      model: 'openai/gpt-5.5',
      messages,
    });

    // Stream the response back to the client
    for await (const chunk of result.textStream) {
      res.write(chunk);
    }
    res.end();
  } catch (err) {
    console.error('[ai/chat]', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI service unavailable. Please try again.' });
    } else {
      res.end();
    }
  }
}

module.exports = { chat };
