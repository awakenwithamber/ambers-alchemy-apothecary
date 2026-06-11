const { getAdminClient } = require('../lib/supabase');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(str, max) {
  if (!str) return '';
  return String(str).replace(/[<>]/g, '').trim().slice(0, max);
}

exports.submit = async (req, res) => {
  const body = req.body || {};
  const email = sanitize(body.email, 200).toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'Valid email required' });
  }

  const id = `ql_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const record = {
    id,
    email,
    first_name: sanitize(body.firstName || body.first_name, 60) || null,
    phone: sanitize(body.phone, 20) || null,
    result_summary: body.resultSummary || body.result_summary || null,
    extended_requested: !!body.extendedRequested,
  };

  const sb = getAdminClient();
  // Upsert by email (de-duplicate)
  const { error } = await sb.from('quiz_leads').upsert(record, { onConflict: 'email', ignoreDuplicates: false });
  if (error) {
    console.error('[quiz-lead]', error.message);
    return res.status(500).json({ ok: false, error: 'Could not save lead' });
  }

  res.json({ ok: true, id });
};
