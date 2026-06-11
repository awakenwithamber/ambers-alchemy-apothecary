const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const OPTS = {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws },
};

let _adminClient = null;
let _anonClient = null;

function getAdminClient() {
  if (!_adminClient) {
    _adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPTS);
  }
  return _adminClient;
}

function getAnonClient() {
  if (!_anonClient) {
    _anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, OPTS);
  }
  return _anonClient;
}

module.exports = { getAdminClient, getAnonClient };
