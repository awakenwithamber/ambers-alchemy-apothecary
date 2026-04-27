// profile.js — subscriber profile dashboard.

(function () {
  const $login = document.getElementById('login-card');
  const $profile = document.getElementById('profile-content');
  const $loginError = document.getElementById('login-error');
  const $loginForm = document.getElementById('login-form');
  const $signupForm = document.getElementById('signup-form');
  const $toggleSignup = document.getElementById('toggle-signup');
  const $toggleLogin = document.getElementById('toggle-login');
  const $logoutBtn = document.getElementById('logout-btn');

  const $accountInfo = document.getElementById('account-info');
  const $statusBadge = document.getElementById('status-badge');
  const $perksSection = document.getElementById('perks-section');
  const $ordersTable = document.getElementById('orders-table');
  const $tarotWidget = document.getElementById('tarot-widget');
  const $cancelBtn = document.getElementById('cancel-subscription');

  function showLogin() {
    if ($login) $login.style.display = '';
    if ($profile) $profile.style.display = 'none';
  }
  function showProfile() {
    if ($login) $login.style.display = 'none';
    if ($profile) $profile.style.display = '';
  }

  function escape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtDate(d) {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch (e) { return d; }
  }

  $toggleSignup?.addEventListener('click', (e) => {
    e.preventDefault();
    $loginForm.style.display = 'none';
    $signupForm.style.display = '';
  });
  $toggleLogin?.addEventListener('click', (e) => {
    e.preventDefault();
    $signupForm.style.display = 'none';
    $loginForm.style.display = '';
  });

  $loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if ($loginError) $loginError.textContent = '';
    const email = $loginForm.querySelector('[name=email]').value.trim();
    const password = $loginForm.querySelector('[name=password]').value;
    try {
      await window.GrimiorAuth.login(email, password);
      window.GrimiorAuth.setFallbackEmail(email);
      loadProfile();
    } catch (err) {
      if ($loginError) $loginError.textContent = err.message || 'Login failed.';
    }
  });

  $signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if ($loginError) $loginError.textContent = '';
    const email = $signupForm.querySelector('[name=email]').value.trim();
    const password = $signupForm.querySelector('[name=password]').value;
    const name = $signupForm.querySelector('[name=name]').value.trim();
    try {
      await window.GrimiorAuth.signup(email, password, name);
      // Try immediate login if autoconfirm is enabled
      try {
        await window.GrimiorAuth.login(email, password);
        window.GrimiorAuth.setFallbackEmail(email);
        loadProfile();
      } catch (e2) {
        if ($loginError) $loginError.textContent = 'Account created. Check your email to confirm, then log in.';
      }
    } catch (err) {
      if ($loginError) $loginError.textContent = err.message || 'Signup failed.';
    }
  });

  $logoutBtn?.addEventListener('click', () => {
    window.GrimiorAuth.logout();
    showLogin();
  });

  $cancelBtn?.addEventListener('click', async () => {
    const confirmed = confirm("Are you sure you want to cancel your Grimior subscription? You'll retain access until your next renewal date.");
    if (!confirmed) return;
    try {
      const r = await window.GrimiorAuth.authedFetch('/api/cancel-subscription', { method: 'POST', body: '{}' });
      const data = await r.json();
      alert(data.message || 'Subscription cancelled. Access continues until end of current billing period.');
      loadProfile();
    } catch (e) {
      alert('Could not cancel. Please contact awaken@consultant.com.');
    }
  });

  async function loadProfile() {
    const session = window.GrimiorAuth.getSession();
    if (!session) {
      showLogin();
      // Check anchor #cancel — open cancel hint
      if (location.hash === '#cancel' && $loginError) {
        $loginError.textContent = 'Please log in to cancel your subscription.';
      }
      return;
    }
    showProfile();

    try {
      const res = await window.GrimiorAuth.authedFetch('/api/get-profile');
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Profile error');

      // Account info
      $accountInfo.innerHTML = `
        <div class="info-grid">
          <div class="field"><div class="label">Name</div><div class="value">${escape(data.name || '—')}</div></div>
          <div class="field"><div class="label">Email</div><div class="value">${escape(data.email)}</div></div>
          <div class="field"><div class="label">Renewal</div><div class="value">${fmtDate(data.subscription.renewalDate)}</div></div>
          <div class="field"><div class="label">Member Since</div><div class="value">${fmtDate(data.subscription.memberSince)}</div></div>
        </div>
      `;

      // Status badge
      const status = data.subscription.active ? 'active' : (data.subscription.status || 'inactive');
      const cls = data.role === 'admin' ? 'admin' :
                  data.subscription.active ? 'active' :
                  /cancel/i.test(status) ? 'cancelled' : 'inactive';
      $statusBadge.className = `status-badge ${cls}`;
      $statusBadge.textContent = data.role === 'admin' ? 'Admin' :
                                 data.subscription.active ? 'Active' :
                                 status.charAt(0).toUpperCase() + status.slice(1);

      // Perks
      if (data.perks && data.perks.length) {
        $perksSection.style.display = '';
        $perksSection.querySelector('.perks-list').innerHTML = data.perks.map(p => `
          <li>
            <span class="icon">${escape(p.icon)}</span>
            <span>
              <span class="perk-title">${escape(p.title)}</span>
              <small>${escape(p.detail || '')}</small>
            </span>
          </li>
        `).join('');
      } else {
        $perksSection.style.display = 'none';
      }

      // Cancel button visibility
      if ($cancelBtn) {
        $cancelBtn.style.display = data.subscription.active && data.role !== 'admin' ? '' : 'none';
      }

      // Orders
      if (data.orders && data.orders.length) {
        $ordersTable.innerHTML = `
          <table class="orders-table">
            <thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>${data.orders.map(o => `
              <tr>
                <td>#${escape(o.number)}</td>
                <td>${fmtDate(o.created)}</td>
                <td>$${escape(o.total)}</td>
                <td>${escape(o.status || '—')}</td>
              </tr>
            `).join('')}</tbody>
          </table>
        `;
      } else {
        $ordersTable.innerHTML = '<p class="muted">No orders yet.</p>';
      }

      // Tarot widget
      if (data.subscription.active || data.role === 'admin') {
        $tarotWidget.style.display = '';
        loadTarot();
      } else {
        $tarotWidget.style.display = 'none';
      }

    } catch (err) {
      console.error(err);
      window.GrimiorAuth.logout();
      showLogin();
    }
  }

  async function loadTarot() {
    const $card = document.getElementById('tarot-card-content');
    if (!$card) return;
    $card.innerHTML = '<div class="muted">Drawing your card...</div>';
    try {
      const r = await window.GrimiorAuth.authedFetch('/api/tarot-of-day');
      const data = await r.json();
      if (!data.ok) throw new Error(data.error);
      const c = data.card;
      $card.innerHTML = `
        <div class="card-number">${escape(c.number)}</div>
        <div class="card-name">${escape(c.name)}</div>
        <div class="card-meaning">${escape(c.meaning)}</div>
        <p style="margin-top:14px;color:var(--gold-light);font-size:13px;">
          <em>${escape(c.affirmation)}</em>
        </p>
        <p style="font-size:13px;margin-top:8px;">
          <strong>Journal:</strong> ${escape(c.journal_prompt)}
        </p>
      `;
    } catch (e) {
      $card.innerHTML = '<div class="muted">Could not draw the card right now.</div>';
    }
  }

  document.addEventListener('DOMContentLoaded', loadProfile);
})();
