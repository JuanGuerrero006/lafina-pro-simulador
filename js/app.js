/* =====================================================
   LA FINA PRO v7 — Final
   ===================================================== */
'use strict';

const HARINA = 12500;
const AGUA_MAX_GEN = 50;
const AGUA_MAX_PRO = 58;
const PIN_HASH = 'RklOQVBSTzIwMjY=';
const PROD = { europea:'Fina Europea', hojaldre:'Fina Hojaldre', industrial:'Fina Industrial' };

const TROPHY_MSGS = [
  'Con <em>La Fina PRO</em> siempre rinde más por moje',
  '<em>Más panes</em> con la misma harina = más ganancia',
  'Calidad <em>PRO</em>: resultados visibles desde el primer moje',
  '<em>8% más</em> de absorción de agua = más panes garantizados',
  '<em>La Fina PRO</em>: la fórmula de los panaderos exitosos',
  'Mismo proceso, <em>mejor resultado</em> con La Fina PRO',
  'Convierte <em>cada arroba</em> en mayor utilidad con PRO',
  '<em>Hojaldre · Europea · Industrial</em>: hay una PRO para tu negocio',
  '<em>Menos merma, más rendimiento</em> con La Fina PRO',
  'La diferencia se ve en <em>el mostrador</em> y en <em>la caja</em>',
  '<em>Pruébala una vez</em> y verás la diferencia desde el primer moje',
  'Con La Fina PRO, <em>cada peso invertido</em> rinde más',
  'Mayor absorción = <em>masa más rendidora</em>, panes más esponjosos',
  '<em>Más panes vendidos</em>, mismo costo de margarina',
  'La Fina PRO: <em>tecnología que convierte harina en utilidad</em>',
  'Tu negocio <em>crece</em> con La Fina PRO',
];

const DEFAULTS = {
  product: 'europea',
  margarina: 24, azucar: 18, sal: 2, levadura: 2,
  aguaGen: 40, aguaPro: 48,
  gramaje: 80,
  mojesDay: 3,
  precioGen: 120000, precioPro: 130000, precioPan: 500,
};

let S = { ...DEFAULTS, sidebarOpen: true };
let lastR = null;
let trophyIdx = 0, trophyTimer = null;
let lastConfettiTime = 0;
let particleInterval = null;

const $ = id => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {
  injectIcons();
  tickClock();
  setInterval(tickClock, 60000);
  $('pin-inp').addEventListener('keypress', e => e.key === 'Enter' && checkPin());
  registerSW();
  startPinParticles();
});

function tickClock() {
  const el = $('hdr-date'); if (!el) return;
  el.textContent = new Date().toLocaleDateString('es-CO',
    { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/* PIN PARTICLES */
function startPinParticles() {
  const container = $('pin-particles');
  if (!container) return;
  const spawn = () => {
    if (!document.getElementById('pin')) {
      if (particleInterval) clearInterval(particleInterval);
      return;
    }
    const p = document.createElement('div');
    p.className = 'pin-particle';
    p.style.left = Math.random() * 100 + '%';
    const size = 3 + Math.random() * 6;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.animationDuration = (5 + Math.random() * 6) + 's';
    container.appendChild(p);
    setTimeout(() => p.remove(), 12000);
  };
  // Spawn initial particles immediately
  for (let i = 0; i < 12; i++) {
    setTimeout(spawn, i * 400);
  }
  particleInterval = setInterval(spawn, 400);
}

/* PIN */
function toggleEye() {
  const i = $('pin-inp');
  i.type = i.type === 'password' ? 'text' : 'password';
  $('pin-eye').innerHTML = i.type === 'password' ? ICONS.eye : ICONS.eyeOff;
}

function checkPin() {
  const v = $('pin-inp').value.trim();
  const err = $('pin-err');
  err.textContent = '';
  if (!v) { err.textContent = 'Ingresa el código de acceso.'; return; }
  if (btoa(v) === PIN_HASH) {
    const ps = $('pin');
    ps.classList.add('hiding');
    if (particleInterval) { clearInterval(particleInterval); particleInterval = null; }
    setTimeout(() => { ps.remove(); launch(); }, 500);
  } else {
    err.textContent = 'Código incorrecto. Intenta de nuevo.';
    $('pin-inp').style.borderColor = 'var(--red)';
    setTimeout(() => { err.textContent = ''; $('pin-inp').style.borderColor = ''; }, 3500);
    $('pin-inp').select();
  }
}

/* LAUNCH */
function launch() {
  $('app').classList.add('visible');
  const isDesktop = window.innerWidth >= 1024;
  S.sidebarOpen = isDesktop;
  applySidebarState();
  syncAll();
  requestAnimationFrame(() => {
    recalc();
    startTrophyRotation();
    setTimeout(() => {
      document.querySelectorAll('.js-hidden').forEach((el, i) => {
        setTimeout(() => el.classList.add('js-visible'), 80 + i * 110);
      });
    }, 100);
  });
}

/* PRODUCT TABS */
function setProd(key, btn) {
  S.product = key;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const name = PROD[key];
  ['prod-leg', 'prod-bar', 'prod-gauge'].forEach(id => {
    const el = $(id); if (el) el.textContent = name;
  });
  recalc();
}

/* SIDEBAR */
function applySidebarState() {
  const sb = $('sidebar');
  const ov = $('overlay');
  const tog = $('hdr-toggle');
  const isDesktop = window.innerWidth >= 1024;
  if (S.sidebarOpen) {
    sb.classList.remove('collapsed');
    sb.classList.add('open');
    if (!isDesktop) ov.classList.add('show');
    tog.classList.add('active');
  } else {
    sb.classList.add('collapsed');
    sb.classList.remove('open');
    ov.classList.remove('show');
    tog.classList.remove('active');
  }
}
function toggleSidebar() { S.sidebarOpen = !S.sidebarOpen; applySidebarState(); }
function closeSidebar() { S.sidebarOpen = false; applySidebarState(); }

window.addEventListener('resize', () => {
  const isDesktop = window.innerWidth >= 1024;
  if (isDesktop) $('overlay').classList.remove('show');
});

/* PRESETS */
const PRESETS = {
  estandar:  { margarina:24, azucar:18, sal:2,   levadura:2,   aguaGen:40, aguaPro:48, gramaje:80 },
  dulce:     { margarina:28, azucar:25, sal:1.5, levadura:2.5, aguaGen:38, aguaPro:46, gramaje:80 },
  molde:     { margarina:20, azucar:12, sal:2.5, levadura:1.5, aguaGen:42, aguaPro:50, gramaje:100 },
  croissant: { margarina:35, azucar:10, sal:2,   levadura:1.5, aguaGen:36, aguaPro:44, gramaje:75 },
};
function applyPreset(k) {
  const p = PRESETS[k]; if (!p) return;
  Object.assign(S, p);
  syncAll();
  recalc();
}

function resetAll() {
  Object.assign(S, DEFAULTS);
  syncAll();
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });
  recalc();
}

function shareResult() {
  if (!lastR) { window.print(); return; }
  const r = lastR;
  const txt = `📊 Simulación La Fina PRO\n\n` +
    `${PROD[S.product]} vs Margarina Genérica:\n` +
    `🍞 Panes Genérica: ${num(r.panesGen)}\n` +
    `🍞 Panes PRO: ${num(r.panesPro)}\n` +
    `✅ +${num(r.extraPanes)} panes (+${r.pctMejPanes.toFixed(1)}%)\n\n` +
    `💰 Ganancia adicional por moje: ${cop(r.ingExtra)}\n` +
    `📈 Proyección mensual (${S.mojesDay} mojes/día × 26 días):\n` +
    `   ${cop(r.ingExtra * S.mojesDay * 26)} extra al mes\n\n` +
    `La Fina PRO · Calidad que da resultados`;
  if (navigator.share) {
    navigator.share({ title: 'La Fina PRO - Simulación', text: txt }).catch(() => {});
  } else {
    try {
      navigator.clipboard.writeText(txt).then(() => {
        alert('✓ Resultado copiado al portapapeles. Pégalo en WhatsApp o donde necesites.');
      }).catch(() => window.print());
    } catch { window.print(); }
  }
}

const CFG = {
  margarina: { min:10, max:35, step:.5 },
  azucar:    { min:5,  max:30, step:.5 },
  sal:       { min:.5, max:5,  step:.1 },
  levadura:  { min:.5, max:5,  step:.1 },
};

function syncAll() {
  Object.keys(CFG).forEach(n => syncIngr(n, S[n]));
  syncWater('gen', S.aguaGen);
  syncWater('pro', S.aguaPro);
  syncGramaje(S.gramaje);
  setVal('mojes-day', S.mojesDay);
  const map = { 'p-gen':'precioGen', 'p-pro':'precioPro', 'p-pan':'precioPan' };
  Object.keys(map).forEach(id => {
    const el = $(id); if (el) el.value = S[map[id]];
  });
}

function syncIngr(name, pct, skip) {
  const c = CFG[name];
  pct = clamp(parseFloat(pct) || c.min, c.min, c.max);
  S[name] = pct;
  const g = Math.round(HARINA * pct / 100);
  if (skip !== 'pct')   setVal(name + '-pct', pct);
  if (skip !== 'gram')  setVal(name + '-gram', g);
  if (skip !== 'range') setVal(name + '-range', pct);
  updateTrack(name + '-range', pct, c.min, c.max, false);
}
function onIngrPct(n)   { syncIngr(n, $(n+'-pct').value, 'pct'); recalc(); }
function onIngrGram(n)  { syncIngr(n, (parseFloat($(n+'-gram').value)||0)/HARINA*100, 'gram'); recalc(); }
function onIngrRange(n) { syncIngr(n, $(n+'-range').value, 'range'); recalc(); }

function syncWater(side, pct, skip) {
  const isGen = side === 'gen';
  const max = isGen ? 50 : 60;
  pct = clamp(parseFloat(pct) || 20, 20, max);
  S[isGen ? 'aguaGen' : 'aguaPro'] = pct;
  const g = Math.round(HARINA * pct / 100);
  const pfx = 'agua' + side;
  if (skip !== 'pct')   setVal(pfx + '-pct', pct);
  if (skip !== 'gram')  setVal(pfx + '-gram', g);
  if (skip !== 'range') setVal(pfx + '-range', pct);
  updateTrack(pfx + '-range', pct, 20, max, isGen);
  if (isGen) {
    const w = $('warn-gen'); if (!w) return;
    if (pct > AGUA_MAX_GEN) {
      w.textContent = 'Supera el máximo recomendado (50%) para margarinas genéricas.';
      w.className = 'water-alert danger show';
    } else { w.className = 'water-alert'; }
  } else {
    const ok = $('ok-pro'), wn = $('warn-pro');
    if (!ok || !wn) return;
    if (pct > AGUA_MAX_PRO) {
      wn.textContent = 'Excede el máximo garantizado (58%) de La Fina PRO.';
      wn.className = 'water-alert danger show'; ok.className = 'water-alert';
    } else if (pct > AGUA_MAX_GEN) {
      ok.className = 'water-alert ok show'; wn.className = 'water-alert';
    } else {
      ok.className = 'water-alert'; wn.className = 'water-alert';
    }
  }
}
function onWaterPct(s)   { syncWater(s, $('agua'+s+'-pct').value, 'pct'); recalc(); }
function onWaterGram(s)  { syncWater(s, (parseFloat($('agua'+s+'-gram').value)||0)/HARINA*100, 'gram'); recalc(); }
function onWaterRange(s) { syncWater(s, $('agua'+s+'-range').value, 'range'); recalc(); }

function updateTrack(id, val, min, max, isGen) {
  const el = $(id); if (!el) return;
  const pct = ((val - min) / (max - min)) * 100;
  el.style.setProperty('--track-p', pct + '%');
  el.style.setProperty('--track-c', isGen ? 'var(--gen)' : 'var(--gold-2)');
}

function syncGramaje(g) {
  S.gramaje = g;
  const el = $('gramaje-inp'); if (el) el.value = g;
  document.querySelectorAll('.g-pill').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.g) === g);
  });
}
function setGramaje(g) { syncGramaje(g); recalc(); }
function onGramajeInp() {
  const v = parseInt($('gramaje-inp').value);
  if (!isNaN(v) && v >= 10 && v <= 1000) {
    S.gramaje = v;
    document.querySelectorAll('.g-pill').forEach(b => b.classList.remove('active'));
    recalc();
  }
}

function onMojesDay() {
  const v = parseInt($('mojes-day').value);
  if (!isNaN(v) && v >= 1 && v <= 100) { S.mojesDay = v; recalc(); }
}

function onPrice(id) {
  const map = { 'p-gen':'precioGen', 'p-pro':'precioPro', 'p-pan':'precioPan' };
  if (map[id]) S[map[id]] = parseFloat($(id).value) || 0;
  recalc();
}

function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function setVal(id, v) { const e = $(id); if (e && String(parseFloat(e.value)) !== String(v)) e.value = v; }
function cop(n) { return '$ ' + Math.round(n).toLocaleString('es-CO'); }
function copShort(n) {
  n = Math.round(n);
  if (n >= 1000000) return '$ ' + (n/1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$ ' + (n/1000).toFixed(0) + 'K';
  return '$ ' + n.toLocaleString('es-CO');
}
function num(n) { return Math.round(n).toLocaleString('es-CO'); }
function pctFmt(n, dec=1) { return n.toFixed(dec) + '%'; }

function recalc() {
  const m = S;
  const gMarg = HARINA * m.margarina / 100;
  const gAzu = HARINA * m.azucar / 100;
  const gSal = HARINA * m.sal / 100;
  const gLev = HARINA * m.levadura / 100;
  const gAGen = HARINA * m.aguaGen / 100;
  const gAPro = HARINA * m.aguaPro / 100;
  const base = HARINA + gMarg + gAzu + gSal + gLev;
  const masaGen = base + gAGen;
  const masaPro = base + gAPro;
  const g = Math.max(10, m.gramaje);
  const panesGen = Math.max(0, Math.floor(masaGen / g));
  const panesPro = Math.max(0, Math.floor(masaPro / g));
  const extraPanes = panesPro - panesGen;
  const pctMejPanes = panesGen > 0 ? extraPanes / panesGen * 100 : 0;
  const ingGen = panesGen * m.precioPan;
  const ingPro = panesPro * m.precioPan;
  const ingExtra = ingPro - ingGen;

  // Gauge: panes with amplified visual scale (PRO always looks bigger)
  const minP = Math.min(panesGen, panesPro);
  const maxP = Math.max(panesGen, panesPro);
  const gaugeBase = minP * 0.82;
  const gaugeSpan = Math.max(maxP * 1.05 - gaugeBase, 1);
  const pctGaugeGen = Math.max(5, Math.min(95, ((panesGen - gaugeBase) / gaugeSpan) * 100));
  const pctGaugePro = Math.max(10, Math.min(100, ((panesPro - gaugeBase) / gaugeSpan) * 100));
  const projDay = ingExtra * m.mojesDay;
  const projWeek = projDay * 6;
  const projMonth = projDay * 26;
  const projYear = projMonth * 12;
  const r = {
    panesGen, panesPro, extraPanes, pctMejPanes,
    ingGen, ingPro, ingExtra,
    pctGaugeGen, pctGaugePro,
    projDay, projWeek, projMonth, projYear,
  };
  lastR = r;
  updateUI(r);
  updateGauges(r);

  // Confetti when PRO wins >3% (changed from 10%)
  if (pctMejPanes >= 3 && Date.now() - lastConfettiTime > 5000) {
    triggerConfetti();
    lastConfettiTime = Date.now();
  }

  const proBar = $('bar-shape-pro');
  if (proBar) {
    if (extraPanes > 0) proBar.classList.add('glowing');
    else proBar.classList.remove('glowing');
  }
}

function updateUI(r) {
  animateNum('bar-num-gen', r.panesGen);
  animateNum('bar-num-pro', r.panesPro);
  const minP = Math.min(r.panesGen, r.panesPro);
  const maxP = Math.max(r.panesGen, r.panesPro);
  const baseline = minP * 0.80;
  const span = Math.max(maxP - baseline, 1);
  const heightGen = ((r.panesGen - baseline) / span) * 100;
  const heightPro = ((r.panesPro - baseline) / span) * 100;
  const gEl = $('bar-shape-gen');
  const pEl = $('bar-shape-pro');
  if (gEl) gEl.style.height = Math.max(50, Math.min(95, heightGen)) + '%';
  if (pEl) pEl.style.height = Math.max(70, Math.min(100, heightPro)) + '%';

  setText('info-extra-panes', '+' + num(r.extraPanes));
  setText('info-extra-pct', '+' + pctFmt(r.pctMejPanes, 1));

  // Gauges: show pane count inside, ingreso bruto below
  setText('gauge-gen-pct', num(r.panesGen));
  setText('gauge-pro-pct', num(r.panesPro));
  setText('gauge-gen-amount', cop(r.ingGen));
  setText('gauge-pro-amount', cop(r.ingPro));

  setText('proj-day', '+' + copShort(r.projDay));
  setText('proj-month', '+' + copShort(r.projMonth));
  setText('proj-year', '+' + copShort(r.projYear));
}

function setText(id, t) { const e = $(id); if (e) e.textContent = t; }

function animateNum(id, to) {
  const el = $(id); if (!el) return;
  const from = parseFloat(el.dataset.v || '0');
  el.dataset.v = to;
  if (from === to) { el.textContent = num(to); return; }
  const dur = 700, start = performance.now();
  const tick = t => {
    const p = Math.min((t - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = num(Math.round(from + (to - from) * e));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function startTrophyRotation() {
  const el = $('trophy-msg'); if (!el) return;
  el.innerHTML = TROPHY_MSGS[0];
  el.classList.add('show');
  if (trophyTimer) clearInterval(trophyTimer);
  trophyTimer = setInterval(rotateTrophy, 45000);
}
function rotateTrophy() {
  const el = $('trophy-msg'); if (!el) return;
  el.classList.remove('show');
  setTimeout(() => {
    trophyIdx = (trophyIdx + 1) % TROPHY_MSGS.length;
    el.innerHTML = TROPHY_MSGS[trophyIdx];
    el.classList.add('show');
  }, 500);
}

function updateGauges(r) {
  const ARC_LEN = 251.3;
  const fillGen = $('gauge-fill-gen');
  const fillPro = $('gauge-fill-pro');
  if (fillGen) {
    const offset = ARC_LEN - (ARC_LEN * r.pctGaugeGen / 100);
    fillGen.style.strokeDashoffset = offset;
  }
  if (fillPro) {
    const offset = ARC_LEN - (ARC_LEN * r.pctGaugePro / 100);
    fillPro.style.strokeDashoffset = offset;
  }
}

function triggerConfetti() {
  const container = $('confetti'); if (!container) return;
  const colors = ['#FFD75A', '#F0B82E', '#D9A020', '#E8EFF7', '#94B2D2'];
  const count = 50;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = (Math.random() * 0.5) + 's';
    piece.style.animationDuration = (2.5 + Math.random() * 1.5) + 's';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.width = (5 + Math.random() * 5) + 'px';
    piece.style.height = (8 + Math.random() * 8) + 'px';
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

function registerSW() {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

const _svg = (d, sz=18) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="${sz}" height="${sz}">${d}</svg>`;

const ICONS = {
  print: _svg('<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'),
  share: _svg('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>'),
  reset: _svg('<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>'),
  menu: _svg('<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>'),
  x: _svg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
  eye: _svg('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
  eyeOff: _svg('<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'),
  lock: _svg('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
  settings: _svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
  trophy: _svg('<path d="M6 9H4a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1h3"/><path d="M18 9h2a2 2 0 0 0 2-2V5a1 1 0 0 0-1-1h-3"/><path d="M6 4h12v8a6 6 0 0 1-12 0V4z"/><path d="M9 22h6"/><path d="M12 17v5"/>'),
  crown: _svg('<path d="M2 18h20l-2-12-5 4-3-6-3 6-5-4z" fill="currentColor"/><line x1="2" y1="22" x2="22" y2="22"/>', 28),
  award: _svg('<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>'),
  trending: _svg('<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'),
  base: _svg('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', 12),
  zap: _svg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', 12),
  beaker: _svg('<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>', 12),
  drop: _svg('<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>', 12),
  scale: _svg('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>', 12),
  dollar: _svg('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', 12),
  calendar: _svg('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', 12),
  butter: _svg('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>', 14),
  sugar: _svg('<circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/>', 14),
  salt: _svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', 14),
  yeast: _svg('<path d="M8.56 2.9A7 7 0 0 1 19 9v3l1 1-1 1v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3l-1-1 1-1V9a7 7 0 0 1 .68-2.99"/>', 14),
  bread: _svg('<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>', 13),
  heart: _svg('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>', 13),
  box: _svg('<rect x="3" y="3" width="18" height="18" rx="2"/>', 13),
  croiss: _svg('<path d="M18 8c0 4-6 12-6 12S6 12 6 8a6 6 0 0 1 12 0z"/>', 13),
  arrow: _svg('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>', 16),
};

function injectIcons() {
  const set = (id, html) => { const e = $(id); if (e) e.innerHTML = html; };
  set('pin-lock-icon', ICONS.lock);
  set('pin-eye', ICONS.eye);
  set('hdr-toggle-icon', ICONS.menu);
  set('reset-btn', ICONS.reset);
  set('share-btn', ICONS.share);
  set('sb-ttl-icon', ICONS.settings);
  set('crown-icon', ICONS.crown);
  set('trophy-icon', ICONS.trophy);
  set('ib-icon-1', ICONS.bread);
  set('ib-icon-2', ICONS.trending);
  set('sec-base-icon', ICONS.base);
  set('sec-zap-icon', ICONS.zap);
  set('sec-beaker-icon', ICONS.beaker);
  set('sec-drop-icon', ICONS.drop);
  set('sec-scale-icon', ICONS.scale);
  set('sec-calendar-icon', ICONS.calendar);
  set('sec-dollar-icon', ICONS.dollar);
  set('ic-margarina', ICONS.butter);
  set('ic-azucar', ICONS.sugar);
  set('ic-sal', ICONS.salt);
  set('ic-levadura', ICONS.yeast);
  set('ic-aguagen', ICONS.drop);
  set('ic-aguapro', ICONS.drop);
  set('ic-preset-1', ICONS.bread);
  set('ic-preset-2', ICONS.heart);
  set('ic-preset-3', ICONS.box);
  set('ic-preset-4', ICONS.croiss);
  set('pin-arrow', ICONS.arrow);
}
