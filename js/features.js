/* ==========================================================================
   features.js — NEW features for Sumu's birthday site
   Load this AFTER script.js (it reuses: CONFIG, sound, fx, doAnimate,
   getStagger, vibrateDevice, letterModal).
   1) "First consultation" line on the prescription
   2) Blooming flower (used by the flower memory polaroid)
   3) Secret memory lock + encrypted private note
   4) Reaction bar -> pre-filled WhatsApp message
   ========================================================================== */

/* ---------- 1) First consultation (prescription card) ---------- */
(function fillFirstVisit() {
  const el = document.getElementById('rxFirstVisit');
  if (el && CONFIG.metDateLabel) el.textContent = CONFIG.metDateLabel;
})();

/* ---------- 2) Blooming flower (SVG) ---------- */
function flowerSVG() {
  const petals = Array.from({ length: 8 }, (_, i) =>
    `<g transform="rotate(${i * 45} 50 50)"><ellipse class="petal" cx="50" cy="27" rx="9" ry="20"/></g>`
  ).join('');
  return `<svg class="bloom" viewBox="0 0 100 100" aria-hidden="true">${petals}<circle class="core" cx="50" cy="50" r="9"/></svg>`;
}

function bloomFlower(card) {
  if (!card) return;
  const img = card.querySelector('.photo-img');
  if (img) {                                   // your own picture: soft watercolor "bloom" reveal
    doAnimate(img, {
      opacity: [0, 1], scale: [1.18, 1],
      filter: ['blur(12px)', 'blur(0px)'],
      duration: 1500, ease: 'outCubic'
    });
    setTimeout(() => sound.playSparkle(), 500);
    return;
  }
  const petals = card.querySelectorAll('.petal');
  const core = card.querySelector('.core');
  doAnimate(petals, {
    scale: [0, 1], opacity: [0, 1], duration: 900,
    delay: getStagger(90), ease: 'outBack(1.6)'
  });
  if (core) doAnimate(core, { scale: [0, 1], duration: 600, delay: 700, ease: 'outBack(2)' });
  setTimeout(() => sound.playSparkle(), 500);
}

/* ---------- 3) Secret lock: Web Crypto (PBKDF2 + AES-GCM) ---------- */
const b64 = (u8) => btoa(String.fromCharCode(...u8));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveKey(pass, salt) {
  const base = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

/* Used ONLY on your own computer to create CONFIG.secret.pack (see the .md) */
async function encryptNote(pass, text) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pass, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, new TextEncoder().encode(text)));
  return JSON.stringify({ s: b64(salt), i: b64(iv), c: b64(ct) });
}

async function decryptNote(pass, pack) {
  const { s, i, c } = typeof pack === 'string' ? JSON.parse(pack) : pack;
  const key = await deriveKey(pass, unb64(s));
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(i) }, key, unb64(c));
  return new TextDecoder().decode(pt);
}

(function secretLock() {
  const $ = (id) => document.getElementById(id);
  const lock = $('secretLock'), dots = $('lockDots'), keypad = $('lockKeypad');
  const hint = $('lockHint'), keyArea = $('lockKeyArea');
  const noteBox = $('secretNote'), noteText = $('secretNoteText');
  const flowerBtn = $('secretFlower');
  if (!lock || !flowerBtn || !CONFIG.secret) return;

  const LEN = CONFIG.secret.length;
  let entered = '';
  let busy = false;

  hint.textContent = CONFIG.secret.hint;
  dots.innerHTML = '<i></i>'.repeat(LEN);
  keypad.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✕']
    .map((k) => `<button type="button" class="key" data-k="${k}">${k}</button>`).join('');

  const paint = () =>
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i < entered.length));

  function openLock() {
    entered = ''; busy = false; paint();
    noteBox.classList.remove('show'); noteText.textContent = '';
    keyArea.style.display = '';
    lock.classList.add('open');
  }
  function closeLock() { lock.classList.remove('open'); }
  window.closeSecretLock = closeLock; // used by the observer below

  function wrong() {
    vibrateDevice([80, 40, 80]);
    doAnimate(dots, { translateX: [0, -10, 10, -8, 8, 0], duration: 420 });
    hint.textContent = 'Not quite… try again 🌸';
    setTimeout(() => { hint.textContent = CONFIG.secret.hint; }, 1800);
    entered = ''; busy = false; paint();
  }

  function showNote(text) {
    keyArea.style.display = 'none';
    noteBox.classList.add('show');
    sound.playSparkle();
    vibrateDevice([60, 40, 60]);
    fx.burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 40);
    let i = 0;
    (function typeNext() {
      noteText.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(typeNext, 38);
    })();
  }

  async function tryUnlock() {
    busy = true;
    try { showNote(await decryptNote(entered, CONFIG.secret.pack)); }
    catch (err) { wrong(); }
  }

  keypad.addEventListener('click', (e) => {
    const b = e.target.closest('.key');
    if (!b || busy) return;
    e.stopPropagation();
    const k = b.dataset.k;
    sound.playPop(); vibrateDevice(15);
    if (k === '✕') return closeLock();
    if (k === '⌫') entered = entered.slice(0, -1);
    else if (entered.length < LEN) entered += k;
    paint();
    if (entered.length === LEN) tryUnlock();
  });
  $('secretClose').addEventListener('click', (e) => { e.stopPropagation(); closeLock(); });
  flowerBtn.addEventListener('click', (e) => { e.stopPropagation(); sound.playPop(); openLock(); });
})();

/* ---------- 4) Show the secret flower only after the gift reveal ---------- */
(function giftSceneSecret() {
  const $ = (id) => document.getElementById(id);
  const flowerBtn = $('secretFlower');
  if (!flowerBtn) return;

  function setGiftSceneActionsVisible(show) {
    if (show) {
      flowerBtn.classList.add('show');
    } else {
      flowerBtn.classList.remove('show');
      if (window.closeSecretLock) window.closeSecretLock();
    }
  }

  function syncGiftSceneUi(sceneIndex) {
    // Re-entering the chat begins a fresh conversation. Its controls appear
    // only after the flower is revealed at the end of the sequence.
    if (sceneIndex !== 6) setGiftSceneActionsVisible(false);
  }

  window.setGiftSceneActionsVisible = setGiftSceneActionsVisible;
  window.syncGiftSceneUi = syncGiftSceneUi;
  if (typeof currentScene !== 'undefined') syncGiftSceneUi(currentScene);
})();
