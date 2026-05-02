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

function fmt(n) { return '$' + parseFloat(n || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function esc(s) { const d = document.createElement('div'); d.textContent = String(s || ''); return d.innerHTML; }
