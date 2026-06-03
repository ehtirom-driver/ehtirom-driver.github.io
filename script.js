'use strict';

// ── Backend (o'zgarishsiz) ─────────────────────
const WEB_APP_URL        = 'https://script.google.com/macros/s/AKfycbzZDTc6AtIYdlHQnHIYEDXlg7K-Re1VzyWmmMQbCPo7GOWwTqFYEQ7gqGSDHoeI0ri8/exec';
const TELEGRAM_BOT_TOKEN = '8561049037:AAEbMoh0BTPRx5mUR99ui-uyg764vGO8spY';
const TELEGRAM_CHAT_ID   = ['7123672881','280926130'];

// ── Foydalanuvchilar ───────────────────────────
const users = {
  'eht.driver01': { fullName: "Po'latxo'jayev Sa'damxon", password: '111111' },
  'eht.driver02': { fullName: 'Nizomov Adxamjon',          password: '222222' },
  'eht.driver03': { fullName: 'Alixodjayev Abbosxon',      password: '333333' },
};

// ── DOM ────────────────────────────────────────
const $ = id => document.getElementById(id);

const loginScreen    = $('loginScreen');
const reportScreen   = $('reportScreen');
const loginForm      = $('loginForm');
const loginInput     = $('loginInput');
const passwordInput  = $('passwordInput');
const togglePw       = $('togglePw');
const eyeIcon        = $('eyeIcon');
const userNameEl     = $('userNameEl');
const avatarEl       = $('avatarEl');
const logoutBtn      = $('logoutBtn');
const reportForm     = $('reportForm');
const muddatHidden   = $('muddat');
const segErtalab     = $('segErtalab');
const segKechqurun   = $('segKechqurun');
const korsatkichInput= $('korsatkich');
const rasmInput      = $('rasmInput');
const openCamBtn     = $('openCamBtn');
const retakeBtn      = $('retakeBtn');
const camPlaceholder = $('camPlaceholder');
const camPreview     = $('camPreview');
const previewImg     = $('previewImg');
const submitBtn      = $('submitBtn');
const toastContainer = $('toastContainer');

let currentUser = null;

// ── Toast ──────────────────────────────────────
const T_ICONS = {
  success: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  warning: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

function toast(text, type = 'info', ms = 3500) {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<div class="t-icon">${T_ICONS[type]}</div><span>${text}</span>`;
  toastContainer.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, ms);
}

// ── Storage ────────────────────────────────────
const dayKey = (u, m) => `${u}_${m}_${new Date().toDateString()}`;
const hasSubmitted = (u, m) => localStorage.getItem(dayKey(u, m)) === 'ok';
const markSubmitted = (u, m) => localStorage.setItem(dayKey(u, m), 'ok');

// ── Helpers ────────────────────────────────────
function initials(name) {
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

// ── Password toggle ────────────────────────────
togglePw.addEventListener('click', () => {
  const show = passwordInput.type === 'password';
  passwordInput.type = show ? 'text' : 'password';
  eyeIcon.innerHTML = show
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
});

// ── Numbers only ───────────────────────────────
korsatkichInput.addEventListener('input', function () {
  this.value = this.value.replace(/[^0-9]/g, '');
});

// ── Segment ────────────────────────────────────
[segErtalab, segKechqurun].forEach(btn => {
  btn.addEventListener('click', () => {
    segErtalab.classList.remove('active');
    segKechqurun.classList.remove('active');
    btn.classList.add('active');
    muddatHidden.value = btn.dataset.value;
  });
});

// ── Camera — faqat kamera, fayl emas ──────────
openCamBtn.addEventListener('click', () => rasmInput.click());
retakeBtn.addEventListener('click', () => {
  rasmInput.value = '';
  previewImg.src = '';
  camPreview.style.display = 'none';
  camPlaceholder.style.display = 'flex';
  rasmInput.click();
});

rasmInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    toast('Faqat rasm fayli qabul qilinadi', 'error');
    rasmInput.value = '';
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    toast('Rasm hajmi 10MB dan oshmasligi kerak', 'error');
    rasmInput.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = ev => {
    previewImg.src = ev.target.result;
    camPlaceholder.style.display = 'none';
    camPreview.style.display = 'block';
  };
  reader.readAsDataURL(file);
});

// ── Screen transitions ─────────────────────────
function showScreen(show, hide) {
  hide.classList.remove('active', 'slide-in');
  hide.classList.add('slide-out');
  hide.addEventListener('animationend', () => {
    hide.style.display = 'none';
    hide.classList.remove('slide-out');
  }, { once: true });

  show.style.display = 'flex';
  show.classList.remove('slide-out');
  requestAnimationFrame(() => {
    show.classList.add('active', 'slide-in');
  });
}

function goLogin() {
  showScreen(loginScreen, reportScreen);
  loginForm.reset();
  passwordInput.type = 'password';
}

function goReport(user) {
  userNameEl.textContent = user.fullName;
  avatarEl.textContent   = initials(user.fullName);
  resetForm();
  showScreen(reportScreen, loginScreen);
}

function resetForm() {
  reportForm.reset();
  muddatHidden.value = '';
  segErtalab.classList.remove('active');
  segKechqurun.classList.remove('active');
  rasmInput.value = '';
  previewImg.src = '';
  camPreview.style.display = 'none';
  camPlaceholder.style.display = 'flex';
}

// ── Login ──────────────────────────────────────
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const login    = loginInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (users[login] && users[login].password === password) {
    currentUser = { username: login, fullName: users[login].fullName };
    sessionStorage.setItem('cu', JSON.stringify(currentUser));
    goReport(currentUser);
  } else {
    toast('Login yoki parol noto\'g\'ri', 'error');
    passwordInput.value = '';
    passwordInput.focus();
  }
});

// ── Logout ─────────────────────────────────────
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  sessionStorage.removeItem('cu');
  goLogin();
});

// ── APIs ───────────────────────────────────────
async function sendToTelegram(file, caption) {
  try {
    const fd = new FormData();
    fd.append('chat_id', TELEGRAM_CHAT_ID);
    fd.append('photo', file, 'spidometr.jpg');
    fd.append('caption', caption);
    const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, { method: 'POST', body: fd });
    const d = await r.json();
    return d.ok === true;
  } catch { return false; }
}

async function sendToGoogleSheet(data) {
  try {
    await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return true;
  } catch { return false; }
}

// ── Submit ─────────────────────────────────────
reportForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!currentUser) { toast('Sessiya tugagan, qayta kiring', 'warning'); goLogin(); return; }

  const muddat     = muddatHidden.value;
  const korsatkich = korsatkichInput.value.trim();
  const file       = rasmInput.files[0];

  if (!muddat)     { toast('Muddatni tanlang', 'warning'); return; }
  if (!korsatkich) { toast('Ko\'rsatkichni kiriting', 'warning'); return; }
  if (!file)       { toast('Spidometr rasmini oling', 'warning'); return; }

  if (hasSubmitted(currentUser.username, muddat)) {
    const lbl = muddat === 'ertalab' ? 'ertalabki' : 'kechqurungi';
    toast(`Bugungi ${lbl} hisobot allaqachon yuborilgan`, 'warning', 4500);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner"></span><span>Yuborilmoqda...</span>`;
  toast('Yuborilmoqda, kuting...', 'info', 7000);

  try {
    const sheetData = {
      ism: currentUser.fullName,
      username: currentUser.username,
      muddat,
      korsatkich: parseInt(korsatkich),
    };
    const caption =
      `🛻 Haydovchi: ${currentUser.fullName}\n🔑 Login: ${currentUser.username}\n` +
      `📆 Muddat: ${muddat === 'ertalab' ? '☀️ Ertalab' : '🌙 Kechqurun'}\n` +
      `📊 Ko'rsatkich: ${korsatkich} km\n⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}`;

    const [gOk, tOk] = await Promise.all([sendToGoogleSheet(sheetData), sendToTelegram(file, caption)]);

    if (gOk && tOk)       { markSubmitted(currentUser.username, muddat); toast('Hisobot muvaffaqiyatli yuborildi', 'success', 4000); resetForm(); }
    else if (!gOk && tOk) { toast('Telegramga yuborildi, lekin Google Sheetga yozilmadi', 'warning', 5000); }
    else if (gOk && !tOk) { toast('Google Sheetga yozildi, lekin Telegramga yuborilmadi', 'warning', 5000); }
    else                  { toast('Xatolik yuz berdi. Qaytadan urinib ko\'ring', 'error', 5000); }
  } catch (err) {
    console.error(err);
    toast('Ulanishda xatolik. Internetni tekshiring', 'error', 5000);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Hisobotni yuborish</span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
  }
});

// ── Init ───────────────────────────────────────
(function init() {
  try {
    const saved = sessionStorage.getItem('cu');
    if (saved) {
      const u = JSON.parse(saved);
      if (users[u.username]) { currentUser = u; goReport(u); return; }
    }
  } catch { /* ignore */ }
  sessionStorage.removeItem('cu');
})();

window.addEventListener('beforeunload', () => sessionStorage.removeItem('cu'));
