// ═══════════════════════════════════════════════════════════════
// UI — orchestration, update, nav, init
// ═══════════════════════════════════════════════════════════════
function update() {
  const sub = getScopeSubtotal();
  const hst = document.getElementById('include-hst').checked ? Math.round(sub * HST_RATE * 100) / 100 : 0;
  const total = getProjectTotal();
  document.getElementById('scope-count').textContent = scopeItems.filter(s => s.checked).length;
  document.getElementById('scope-subtotal').textContent = fmt(sub);
  document.getElementById('scope-hst').textContent = fmt(hst);
  document.getElementById('scope-total').textContent = fmt(total);
  renderStages();
  renderClientSplit();
}

function toggleDark() {
  const d = document.body.classList.toggle('dark');
  document.getElementById('theme-btn').textContent = d ? '☀️ Light' : '🌙 Dark';
  safeSetItem('cf-dark', d ? '1' : '0');
}

function openGuide(tab) {
  document.getElementById('guide-modal').classList.add('open');
  showGuideTab(tab || 0);
}
function closeGuide() { document.getElementById('guide-modal').classList.remove('open'); }

function showGuideTab(n) {
  document.querySelectorAll('.gtab-panel').forEach((p, i) => p.style.display = i === n ? 'block' : 'none');
  document.querySelectorAll('.gtab').forEach((b, i) => b.classList.toggle('active', i === n));
}

function navTo(id, el) {
  const card = document.getElementById(id);
  if (card && card.classList.contains('collapsed')) toggleSection(id);
  card.scrollIntoView({behavior:'smooth'});
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
}

function toggleSection(id) {
  const card = document.getElementById(id);
  if (!card) return;
  const collapsed = card.classList.toggle('collapsed');
  const states = JSON.parse(localStorage.getItem('cf-collapsed') || '{}');
  states[id] = collapsed;
  safeSetItem('cf-collapsed', JSON.stringify(states));
}

function initSectionStates() {
  // All sections collapsed except wizard on first load
  const defaults = {'sec-company':true,'sec-matconfig':true,'sec-rates':true,'sec-project':true,'sec-clients':true,'sec-scope':true,'sec-payment':true};
  const stored = JSON.parse(localStorage.getItem('cf-collapsed') || '{}');
  const states = Object.assign({}, defaults, stored);
  Object.entries(states).forEach(([id, collapsed]) => {
    const card = document.getElementById(id);
    if (card && collapsed) card.classList.add('collapsed');
  });
}

function expandProjectSections() {
  ['sec-project','sec-clients','sec-scope','sec-payment'].forEach(id => {
    const card = document.getElementById(id);
    if (card) card.classList.remove('collapsed');
  });
}

function init() {
  loadCompany(); loadRates(); loadLogoFromStorage(); renderMatConfig(); initSectionStates();
  if (localStorage.getItem('cf-dark') === '1') {
    document.body.classList.add('dark');
    document.getElementById('theme-btn').textContent = '☀️ Light';
  }
  addClient();
  loadScopeDefaults();
  addStage('Deposit', 40, false);
  addStage('Materials Delivered / Work Begun', 30, false);
  addStage('Completion', 30, false);
  document.getElementById('proj-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('guide-modal').addEventListener('click', e => { if (e.target === document.getElementById('guide-modal')) closeGuide(); });
  document.getElementById('preview-modal').addEventListener('click', e => { if (e.target === document.getElementById('preview-modal')) closePreviewModal(); });
  document.getElementById('merge-modal').addEventListener('click', e => { if (e.target === document.getElementById('merge-modal')) closeMergeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closePreviewModal(); closeMergeModal(); } });
  wizRender();
  update();
}

init();
