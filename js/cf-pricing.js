// ═══════════════════════════════════════════════════════════════
// MATERIALS CONFIG
// ═══════════════════════════════════════════════════════════════
function getDefaultMatConfig() {
  return [
    {id:'mc-1',  name:'Fence board (6 ft, 6" wide, pressure treated)', unit:'each', cost:0},
    {id:'mc-2',  name:'Fence board (8 ft, 6" wide, pressure treated)', unit:'each', cost:0},
    {id:'mc-3',  name:'4×4 Post (8 ft)',                               unit:'each', cost:0},
    {id:'mc-4',  name:'4×4 Post (10 ft)',                              unit:'each', cost:0},
    {id:'mc-5',  name:'5×5 Post (8 ft)',                               unit:'each', cost:0},
    {id:'mc-6',  name:'5×5 Post (10 ft)',                              unit:'each', cost:0},
    {id:'mc-7',  name:'6×6 Post (8 ft)',                               unit:'each', cost:0},
    {id:'mc-8',  name:'2×4 Rail (8 ft)',                               unit:'each', cost:0},
    {id:'mc-9',  name:'2×4 Rail (16 ft)',                              unit:'each', cost:0},
    {id:'mc-10', name:'Fast-Set Concrete (80 lb bag)',                 unit:'bag',  cost:0},
    {id:'mc-11', name:'Gate hinges (heavy duty pair)',                 unit:'pair', cost:0},
    {id:'mc-12', name:'Gate latch',                                    unit:'each', cost:0},
    {id:'mc-13', name:'Galvanized screws (1 lb box)',                  unit:'box',  cost:0},
    {id:'mc-14', name:'Welded wire mesh (50 ft roll)',                 unit:'roll', cost:0},
    {id:'mc-15', name:'1×4 Trim board (8 ft)',                        unit:'each', cost:0},
    {id:'mc-16', name:'Lattice panel (4×8 ft)',                       unit:'each', cost:0},
    {id:'mc-17', name:'Kickboard / rot board (2×6, 8 ft)',            unit:'each', cost:0},
    {id:'mc-18', name:'Post cap',                                      unit:'each', cost:0},
  ];
}

function loadMatConfig() {
  try {
    const stored = localStorage.getItem('cf-matconfig');
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  return getDefaultMatConfig();
}

function saveMatConfig(cfg) {
  localStorage.setItem('cf-matconfig', JSON.stringify(cfg));
}

function renderMatConfig() {
  const cfg = loadMatConfig();
  const tbody = document.getElementById('matconfig-body');
  if (!tbody) return;
  tbody.innerHTML = cfg.map((m, i) => `
    <tr class="mat-row">
      <td><input class="matcfg-name-input" value="${esc(m.name)}" oninput="matcfgUpdate(${i},'name',this.value)" style="width:100%;"></td>
      <td><input class="matcfg-unit-input" value="${esc(m.unit)}" oninput="matcfgUpdate(${i},'unit',this.value)"></td>
      <td><input class="mat-price-input" type="number" placeholder="0.00" value="${m.cost||''}" oninput="matcfgUpdate(${i},'cost',parseFloat(this.value)||0)"></td>
      <td><button class="btn btn-red" style="font-size:10px;padding:4px 8px;" onclick="removeMatConfigItem(${i})">×</button></td>
    </tr>`).join('');
}

function matcfgUpdate(idx, field, val) {
  const cfg = loadMatConfig();
  if (cfg[idx]) { cfg[idx][field] = val; saveMatConfig(cfg); }
}

function addMatConfigItem() {
  const cfg = loadMatConfig();
  cfg.push({id:'mc-custom-'+Date.now(), name:'', unit:'each', cost:0});
  saveMatConfig(cfg);
  renderMatConfig();
  const rows = document.querySelectorAll('#matconfig-body tr');
  if (rows.length) rows[rows.length-1].querySelector('input').focus();
}

function removeMatConfigItem(idx) {
  const cfg = loadMatConfig();
  cfg.splice(idx, 1);
  saveMatConfig(cfg);
  renderMatConfig();
}

// ═══════════════════════════════════════════════════════════════
// PRICING MERGE
// ═══════════════════════════════════════════════════════════════
function normalizeName(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[""'']/g, '"')
    .replace(/\s+/g, ' ')
    .replace(/×/g, 'x');
}

function runPricingMerge(incomingMat, incomingRates) {
  const localMat = loadMatConfig();
  const rateFields = {lf:'rate-lf', matLf:'rate-mat-lf', gate:'rate-gate', post:'rate-post', deckSf:'rate-deck-sf', footing:'rate-footing', rail:'rate-rail', stair:'rate-stair'};
  const rateLabels = {lf:'Labour / Linear Ft', matLf:'Materials / Linear Ft', gate:'Per Gate', post:'Post Install', deckSf:'Labour / Sq Ft Deck', footing:'Footing / Post', rail:'Railing / Linear Ft', stair:'Stair / Step'};

  // Fast path: local config is entirely blank — apply everything directly, no conflict check
  const localIsBlank = localMat.every(item => !item.cost || item.cost === 0);
  const incomingHasPrices = incomingMat.some(item => item.cost > 0);

  if (localIsBlank && incomingHasPrices) {
    incomingMat.forEach(incoming => {
      const localMatch = localMat.find(l => normalizeName(l.name) === normalizeName(incoming.name));
      if (localMatch) {
        localMatch.cost = incoming.cost;
      } else if (incoming.cost > 0) {
        localMat.push({id:'mc-import-'+Date.now()+Math.random(), name:incoming.name, unit:incoming.unit, cost:incoming.cost});
      }
    });
    Object.entries(rateFields).forEach(([key, elId]) => {
      const localVal = parseFloat(document.getElementById(elId).value) || 0;
      const fileVal  = parseFloat(incomingRates[key]) || 0;
      if (localVal === 0 && fileVal > 0) document.getElementById(elId).value = fileVal;
    });
    saveRates();
    saveMatConfig(localMat);
    renderMatConfig();
    showMergeToast([], incomingMat.filter(m => m.cost > 0).map(m => ({name:m.name, newCost:m.cost})));
    return;
  }

  // Non-blank local: run conflict resolution
  const autoAdded = [], autoFilled = [], conflicts = [];

  incomingMat.forEach(incoming => {
    if (!incoming.cost || incoming.cost <= 0) return;
    const localMatch = localMat.find(l => normalizeName(l.name) === normalizeName(incoming.name));
    if (!localMatch) {
      autoAdded.push({...incoming, _action:'added'});
    } else if (!localMatch.cost || localMatch.cost === 0) {
      localMatch.cost = incoming.cost;
      autoFilled.push({name:incoming.name, newCost:incoming.cost});
    } else if (localMatch.cost !== incoming.cost) {
      conflicts.push({id:localMatch.id, name:incoming.name, unit:incoming.unit, localCost:localMatch.cost, fileCost:incoming.cost});
    }
  });

  autoAdded.forEach(item => localMat.push({id:'mc-import-'+Date.now()+Math.random(), name:item.name, unit:item.unit, cost:item.cost}));

  const rateConflicts = [];
  Object.entries(rateFields).forEach(([key, elId]) => {
    const localVal = parseFloat(document.getElementById(elId).value) || 0;
    const fileVal  = parseFloat(incomingRates[key]) || 0;
    if (fileVal <= 0) return;
    if (localVal === 0) { document.getElementById(elId).value = fileVal; }
    else if (localVal !== fileVal) { rateConflicts.push({key, elId, label:rateLabels[key], localVal, fileVal}); }
  });

  saveMatConfig(localMat);
  renderMatConfig();

  if (conflicts.length > 0 || rateConflicts.length > 0) {
    showMergeModal(conflicts, rateConflicts, autoAdded, autoFilled, localMat);
  } else {
    showMergeToast(autoAdded, autoFilled);
  }
}

function showMergeModal(matConflicts, rateConflicts, autoAdded, autoFilled, localMat) {
  let html = '';

  if (autoAdded.length > 0 || autoFilled.length > 0) {
    html += `<div style="background:var(--pale);border:1px solid var(--border);border-radius:8px;padding:12px 14px;margin-bottom:16px;font-size:12px;color:var(--ink);"><strong>Already applied automatically:</strong><br>`;
    autoAdded.forEach(m  => { html += `<span style="color:var(--green);">✅ Added: ${esc(m.name)} @ ${fmt(m.cost)}</span><br>`; });
    autoFilled.forEach(m => { html += `<span style="color:var(--steel);">📥 Filled: ${esc(m.name)} → ${fmt(m.newCost)}</span><br>`; });
    html += `</div>`;
  }

  if (matConflicts.length > 0) {
    html += `<p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--navy);font-family:'DM Mono',monospace;margin-bottom:8px;">Material Price Conflicts</p>`;
    html += `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;"><tr style="background:var(--navy);color:#fff;"><th style="padding:6px 10px;text-align:left;font-family:'DM Mono',monospace;font-size:10px;">Material</th><th style="padding:6px 10px;text-align:right;font-family:'DM Mono',monospace;font-size:10px;">Your Price</th><th style="padding:6px 10px;text-align:right;font-family:'DM Mono',monospace;font-size:10px;">File Price</th><th style="padding:6px 10px;text-align:center;font-family:'DM Mono',monospace;font-size:10px;">Keep</th></tr>`;
    matConflicts.forEach((c, i) => {
      html += `<tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 10px;">${esc(c.name)}</td><td style="padding:8px 10px;text-align:right;font-family:'DM Mono',monospace;">${fmt(c.localCost)}</td><td style="padding:8px 10px;text-align:right;font-family:'DM Mono',monospace;">${fmt(c.fileCost)}</td><td style="padding:8px 10px;text-align:center;"><label style="display:inline-flex;align-items:center;gap:5px;cursor:pointer;margin-right:10px;"><input type="radio" name="mat-conflict-${i}" value="keep" checked onchange="matConflictChoices[${i}]='keep'"> Mine</label><label style="display:inline-flex;align-items:center;gap:5px;cursor:pointer;"><input type="radio" name="mat-conflict-${i}" value="file" onchange="matConflictChoices[${i}]='file'"> File</label></td></tr>`;
    });
    html += `</table>`;
  }

  if (rateConflicts.length > 0) {
    html += `<p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--navy);font-family:'DM Mono',monospace;margin-bottom:8px;">Labour Rate Conflicts</p>`;
    html += `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px;"><tr style="background:var(--navy);color:#fff;"><th style="padding:6px 10px;text-align:left;font-family:'DM Mono',monospace;font-size:10px;">Rate</th><th style="padding:6px 10px;text-align:right;font-family:'DM Mono',monospace;font-size:10px;">Your Rate</th><th style="padding:6px 10px;text-align:right;font-family:'DM Mono',monospace;font-size:10px;">File Rate</th><th style="padding:6px 10px;text-align:center;font-family:'DM Mono',monospace;font-size:10px;">Keep</th></tr>`;
    rateConflicts.forEach((r, i) => {
      html += `<tr style="border-bottom:1px solid var(--border);"><td style="padding:8px 10px;">${esc(r.label)}</td><td style="padding:8px 10px;text-align:right;font-family:'DM Mono',monospace;">${fmt(r.localVal)}</td><td style="padding:8px 10px;text-align:right;font-family:'DM Mono',monospace;">${fmt(r.fileVal)}</td><td style="padding:8px 10px;text-align:center;"><label style="display:inline-flex;align-items:center;gap:5px;cursor:pointer;margin-right:10px;"><input type="radio" name="rate-conflict-${i}" value="keep" checked onchange="rateConflictChoices[${i}]='keep'"> Mine</label><label style="display:inline-flex;align-items:center;gap:5px;cursor:pointer;"><input type="radio" name="rate-conflict-${i}" value="file" onchange="rateConflictChoices[${i}]='file'"> File</label></td></tr>`;
    });
    html += `</table>`;
  }

  html += `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;">
    <button class="btn btn-gold" onclick="applyMergeChoices()">✅ Apply My Selections</button>
    <button class="btn btn-navy" onclick="applyAllKeep()">🔒 Keep All Mine</button>
    <button class="btn btn-outline" style="color:var(--navy);border-color:var(--border);background:var(--pale);" onclick="applyAllFile()">📥 Use All From File</button>
  </div>`;

  document.getElementById('merge-modal-body').innerHTML = html;
  window._mergeMatConflicts  = matConflicts;
  window._mergeRateConflicts = rateConflicts;
  window._mergLocalMat       = localMat;
  window.matConflictChoices  = matConflicts.map(() => 'keep');
  window.rateConflictChoices = rateConflicts.map(() => 'keep');
  document.getElementById('merge-modal').classList.add('open');
}

function applyMergeChoices() {
  const localMat = window._mergLocalMat;
  window._mergeMatConflicts.forEach((c, i) => {
    if (window.matConflictChoices[i] === 'file') { const item = localMat.find(l => l.id === c.id); if (item) item.cost = c.fileCost; }
  });
  saveMatConfig(localMat); renderMatConfig();
  window._mergeRateConflicts.forEach((r, i) => {
    if (window.rateConflictChoices[i] === 'file') document.getElementById(r.elId).value = r.fileVal;
  });
  saveRates(); closeMergeModal(); showMergeToast([], [], true);
}

function applyAllKeep() { closeMergeModal(); renderMatConfig(); }

function applyAllFile() {
  const localMat = window._mergLocalMat;
  window._mergeMatConflicts.forEach(c => { const item = localMat.find(l => l.id === c.id); if (item) item.cost = c.fileCost; });
  saveMatConfig(localMat); renderMatConfig();
  window._mergeRateConflicts.forEach(r => { document.getElementById(r.elId).value = r.fileVal; });
  saveRates(); closeMergeModal(); showMergeToast([], [], true);
}

function closeMergeModal() { document.getElementById('merge-modal').classList.remove('open'); }

function showMergeToast(autoAdded, autoFilled, fromModal = false) {
  const addedCount  = Array.isArray(autoAdded)  ? autoAdded.length  : (autoAdded  || 0);
  const filledCount = Array.isArray(autoFilled) ? autoFilled.length : (autoFilled || 0);
  const parts = [];
  if (addedCount)  parts.push(`${addedCount} new material${addedCount>1?'s':''} added`);
  if (filledCount) parts.push(`${filledCount} price${filledCount>1?'s':''} filled in`);
  if (fromModal)   parts.push('selections applied');
  if (!parts.length) return;
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--navy);color:#fff;padding:10px 18px;border-radius:10px;font-size:13px;font-family:\'Source Sans 3\',sans-serif;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.3);white-space:nowrap;';
  toast.textContent = `✅ Pricing updated: ${parts.join(', ')}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
