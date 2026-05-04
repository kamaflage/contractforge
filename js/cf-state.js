// ═══════════════════════════════════════════════════════════════
// STATE — global variables, shared helpers
// ═══════════════════════════════════════════════════════════════
let mode = 'quote';
let clients = [];
let stages = [];
let scopeItems = [];
let logoData = null;

// Wizard state
let wizStep = 0;
let wizAnswers = {};
let matItems = []; // material list from wizard
let wizMatWarningDismissed = false;

// Preview state
let currentPreviewMode = 'quote';
let matDisplayMode = 'hidden';

// Wizard quote range selection — 'low' | 'mid' | 'high'
let selectedQuoteRange = 'mid';

function setMode(m) { mode = m; }

// Single source of truth for tax rate
const HST_RATE = 0.13;

function fmt(n) { return '$' + parseFloat(n || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function esc(s) { const d = document.createElement('div'); d.textContent = String(s || ''); return d.innerHTML; }

// localStorage wrapper — silently fails on quota exceeded, warns user for critical data
function safeSetItem(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch(e) {
    console.warn('localStorage quota exceeded for key:', key);
    if (key === 'cf-logo') {
      const t = document.createElement('div');
      t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#c0392b;color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;pointer-events:none;';
      t.textContent = '⚠️ Storage full — logo could not be saved. Try a smaller image.';
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 4000);
    }
  }
}
