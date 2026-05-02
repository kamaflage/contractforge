// ═══════════════════════════════════════════════════════════════
// SAVE / LOAD
// ═══════════════════════════════════════════════════════════════
function buildSaveData() {
  const company = {
    name:document.getElementById('co-name').value,
    rep:document.getElementById('co-rep').value,
    address:document.getElementById('co-address').value,
    phone:document.getElementById('co-phone').value,
    email:document.getElementById('co-email').value,
    website:document.getElementById('co-website').value,
    logo:logoData||null
  };
  const matConfig = loadMatConfig();
  // UPDATED: Added the two new rates to the save object
  const labourRates = {
    lf:document.getElementById('rate-lf').value||'',
    matLf:document.getElementById('rate-mat-lf').value||'',
    gate:document.getElementById('rate-gate').value||'',
    post:document.getElementById('rate-post').value||'',
    deckSf:document.getElementById('rate-deck-sf').value||'',
    footing:document.getElementById('rate-footing').value||'',
    rail:document.getElementById('rate-rail').value||'',
    stair:document.getElementById('rate-stair').value||'',
    cleanup:document.getElementById('rate-cleanup').value||'',
    demo:document.getElementById('rate-demo').value||''
  };
  return {
    projName:document.getElementById('proj-name').value,
    projAddress:document.getElementById('proj-address').value,
    projType:document.getElementById('proj-type').value,
    projDate:document.getElementById('proj-date').value,
    projStart:document.getElementById('proj-start').value,
    projNotes:document.getElementById('proj-notes').value,
    payOverride:document.getElementById('pay-override').value,
    includeHst:document.getElementById('include-hst').checked,
    clients, stages, scopeItems, mode, wizAnswers, wizStep, matItems,
    company, matConfig, labourRates
  };
}

function saveProject() {
  const data = buildSaveData();
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = (data.projName||'project').replace(/\s+/g,'-') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function loadProject() { document.getElementById('load-input').click(); }

function handleLoad(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const d = JSON.parse(ev.target.result);
      document.getElementById('proj-name').value = d.projName || '';
      document.getElementById('proj-address').value = d.projAddress || '';
      document.getElementById('proj-type').value = d.projType || 'fence';
      document.getElementById('proj-date').value = d.projDate || '';
      document.getElementById('proj-start').value = d.projStart || '';
      document.getElementById('proj-notes').value = d.projNotes || '';
      document.getElementById('pay-override').value = d.payOverride || '';
      document.getElementById('include-hst').checked = d.includeHst || false;
      clients = d.clients || [];
      stages = d.stages || [];
      scopeItems = d.scopeItems || [];
      if (d.mode) setMode(d.mode);
      if (d.wizAnswers) wizAnswers = d.wizAnswers;
      if (typeof d.wizStep === 'number') wizStep = d.wizStep;
      if (d.matItems) matItems = d.matItems;

      const existingBanner = document.getElementById('co-legacy-banner');
      if (existingBanner) existingBanner.remove();

      if (d.company && d.company.name) {
        const apply = confirm(`This file includes company info for "${d.company.name}".\n\nApply it to your profile? (Click Cancel to keep your current company settings.)`);
        if (apply) {
          ['name','rep','address','phone','email','website'].forEach(k => {
            const el = document.getElementById('co-'+k);
            if (el) el.value = d.company[k] || '';
          });
          if (d.company.logo) {
            logoData = d.company.logo;
            showLogo(logoData);
            localStorage.setItem('cf-logo', logoData);
          } else { removeLogo(); }
          saveCompany(); updateHeader();
        }
      } else {
        const banner = document.createElement('div');
        banner.id = 'co-legacy-banner';
        banner.style.cssText = 'background:#fff3cd;color:#856404;border:1px solid #ffc107;border-radius:8px;padding:10px 14px;font-size:12px;margin-bottom:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;';
        banner.innerHTML = `⚠️ This file was saved before v2.2 — company info was loaded from your saved profile. <button onclick="saveProject()" style="background:#856404;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:11px;">Re-save to embed company info</button> <button onclick="this.parentElement.remove()" style="background:transparent;border:1px solid #856404;color:#856404;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:11px;">Dismiss</button>`;
        const sb = document.querySelector('#sec-company .section-body');
        if (sb) sb.insertBefore(banner, sb.firstChild);
        const coCard = document.getElementById('sec-company');
        if (coCard) coCard.classList.remove('collapsed');
      }

      // UPDATED: Added the two new rates to the lookup map so they load from the JSON file
      if (d.labourRates) {
        const rfMap = {
          lf:'rate-lf',
          matLf:'rate-mat-lf',
          gate:'rate-gate',
          post:'rate-post',
          deckSf:'rate-deck-sf',
          footing:'rate-footing',
          rail:'rate-rail',
          stair:'rate-stair',
          cleanup:'rate-cleanup',
          demo:'rate-demo'
        };
        Object.entries(rfMap).forEach(([k,id]) => { if (d.labourRates[k]) document.getElementById(id).value = d.labourRates[k]; });
      }
      
      scopeItems.forEach(item => {
        if ((!item.price || item.price === 0) && item.rateKey) {
          const r = getRate(item.rateKey);
          if (r > 0) item.price = r;
        }
      });
      if (d.matConfig || d.labourRates) runPricingMerge(d.matConfig || [], d.labourRates || {});
      wizRender(); renderClients(); renderScope(); renderStages(); update();
    } catch(err) { alert('Could not load file: ' + err.message); }
  };
  reader.readAsText(file);
}

function clearProject() {
  if (!confirm('Clear this project? Company profile and rates are kept.')) return;
  clients = []; stages = []; scopeItems = []; wizAnswers = {}; matItems = [];
  ['proj-name','proj-address','proj-date','proj-start','proj-notes','pay-override'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('proj-type').value = 'fence';
  document.getElementById('include-hst').checked = false;
  addClient();
  loadScopeDefaults();
  addStage('Deposit', 40, false);
  addStage('Materials Delivered / Work Begun', 30, false);
  addStage('Completion', 30, false);
  wizStep = 0;
  wizRender();
  update();
}