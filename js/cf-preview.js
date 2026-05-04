// ═══════════════════════════════════════════════════════════════
// PREVIEW MODAL
// ═══════════════════════════════════════════════════════════════
function openPreviewModal(m) {
  mode = m; currentPreviewMode = m;
  const titles = {quote:'📋 Quote Preview', contract:'📝 Contract Preview', receipt:'🧾 Receipts Preview'};
  document.getElementById('preview-modal-title').textContent = titles[m] || 'Preview';
  const ctrl = document.getElementById('mat-display-ctrl');
  const showMatCtrl = (m === 'quote' || m === 'contract') && matItems && matItems.length > 0;
  ctrl.style.display = showMatCtrl ? 'flex' : 'none';
  const noCosts = showMatCtrl && matItems.every(it => !it.unitCost || it.unitCost === 0);
  let hint = document.getElementById('mat-display-hint');
  if (noCosts) {
    if (!hint) {
      hint = document.createElement('span');
      hint.id = 'mat-display-hint';
      hint.style.cssText = 'font-size:10px;color:rgba(255,255,255,.5);';
      hint.textContent = 'Run wizard to add costs';
      ctrl.appendChild(hint);
    }
  } else if (hint) { hint.remove(); }
  const content = document.getElementById('preview-modal-content');
  content.innerHTML = '';
  renderPreviewInto(content, m);
  const overlay = document.getElementById('preview-modal');
  overlay.classList.add('open');
  requestAnimationFrame(() => { overlay.scrollTop = 0; });
}

function closePreviewModal() { document.getElementById('preview-modal').classList.remove('open'); }
function printPreview() { window.print(); }
function printDoc() { window.print(); }

function setMatDisplay(displayMode, btn) {
  matDisplayMode = displayMode;
  document.querySelectorAll('.mat-toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const content = document.getElementById('preview-modal-content');
  content.innerHTML = '';
  renderPreviewInto(content, currentPreviewMode);
}

// ═══════════════════════════════════════════════════════════════
// PREVIEW RENDERER
// ═══════════════════════════════════════════════════════════════
function renderPreviewInto(container, m) {
  const co = {
    name:esc(document.getElementById('co-name').value||'Company Name'),
    rep:esc(document.getElementById('co-rep').value||''),
    addr:esc(document.getElementById('co-address').value||''),
    phone:esc(document.getElementById('co-phone').value||''),
    email:esc(document.getElementById('co-email').value||'')
  };
  const proj = {
    name:esc(document.getElementById('proj-name').value||'Project'),
    address:esc(document.getElementById('proj-address').value||''),
    date:document.getElementById('proj-date').value ? new Date(document.getElementById('proj-date').value+'T00:00:00').toLocaleDateString('en-CA',{year:'numeric',month:'long',day:'numeric'}) : '',
    start:document.getElementById('proj-start').value ? new Date(document.getElementById('proj-start').value+'T00:00:00').toLocaleDateString('en-CA',{year:'numeric',month:'long',day:'numeric'}) : '',
    notes:esc(document.getElementById('proj-notes').value||'')
  };
  const total = getProjectTotal();
  const isContract = (m === 'contract');
  const docTitle = m === 'quote' ? 'PROJECT QUOTE' : m === 'contract' ? 'CONSTRUCTION CONTRACT' : 'PAYMENT SCHEDULE';

  if (m !== 'receipt') {
    const checked = scopeItems.filter(s => s.checked);
    const sub = getScopeSubtotal();
    const hst = document.getElementById('include-hst').checked ? Math.round(sub * HST_RATE * 100) / 100 : 0;
    const clientList = clients.map(c => `${esc(c.name)}${c.address?' ('+esc(c.address)+')':''}`).join(' and ');
    container.innerHTML = `<div class="preview-wrap">
      <div class="pv-header">
        ${logoData ? `<img src="${logoData}" class="pv-logo">` : ''}
        <div class="pv-company">${co.name}</div>
        <div class="pv-company-sub">${[co.addr,co.phone,co.email].filter(Boolean).join(' | ')}</div>
        <div class="pv-doc-title">${docTitle}</div>
        ${proj.date ? `<div style="font-size:11px;color:var(--muted);margin-top:3px;">Date: ${proj.date}</div>` : ''}
      </div>
      <div class="pv-section-title">Parties</div>
      <p style="font-size:12px;line-height:1.7;"><strong>Constructor:</strong> ${co.name}${co.rep?' — '+co.rep:''}, ${co.addr}<br>
      <strong>Client${clients.length>1?'s':''}:</strong> ${clientList||'—'}<br>
      <strong>Property:</strong> ${proj.address||'—'}${proj.start?'<br><strong>Est. Start:</strong> '+proj.start:''}</p>
      <div class="pv-section-title">Scope of Work</div>
      ${checked.length ? `<table class="pv-scope-table">
        <tr><th colspan="2">Items Included</th></tr>
        ${checked.map(s=>`<tr><td colspan="2">${esc(s.name)}</td></tr>`).join('')}
        ${hst>0?`<tr><td style="font-style:italic;padding-top:6px;">HST (13%)</td><td style="text-align:right;padding-top:6px;">${fmt(hst)}</td></tr>`:''}
        <tr class="tr-total"><td><strong>TOTAL</strong></td><td style="text-align:right"><strong>${fmt(total)}</strong></td></tr>
      </table>` : '<p style="font-size:12px;color:var(--muted);">No scope items selected.</p>'}
      ${proj.notes ? `<div class="pv-section-title">Notes</div><p style="font-size:12px;line-height:1.6;">${proj.notes}</p>` : ''}
      ${(()=>{
        if (matDisplayMode === 'hidden' || !matItems.length) return '';
        if (matDisplayMode === 'names') {
          return `<div class="pv-section-title">Materials List</div><table class="pv-scope-table"><tr><th>Material</th><th>Qty</th><th>Unit</th></tr>${matItems.map(it=>`<tr><td>${esc(it.name)}</td><td style="text-align:center">${it.qty}</td><td style="text-align:center">${esc(it.unit)}</td></tr>`).join('')}</table>`;
        }
        const matTotal = matItems.reduce((s,it)=>s+(it.qty||0)*(it.unitCost||0),0);
        return `<div class="pv-section-title">Materials List</div><table class="pv-scope-table"><tr><th>Material</th><th>Qty</th><th>Unit</th><th style="text-align:right">Unit Cost</th><th style="text-align:right">Total</th></tr>${matItems.map(it=>{const lt=(it.qty||0)*(it.unitCost||0);return`<tr><td>${esc(it.name)}</td><td style="text-align:center">${it.qty}</td><td style="text-align:center">${esc(it.unit)}</td><td style="text-align:right">${it.unitCost?fmt(it.unitCost):'—'}</td><td style="text-align:right">${lt?fmt(lt):'—'}</td></tr>`;}).join('')}${matTotal?`<tr class="tr-total"><td colspan="4"><strong>Material Total</strong></td><td style="text-align:right"><strong>${fmt(matTotal)}</strong></td></tr>`:''}</table>`;
      })()}
      <div class="pv-section-title">Payment Schedule</div>
      ${stages.length ? `<table class="pv-payment-table">
        <tr><th style="text-align:left;padding:5px 7px;">Stage</th><th>%</th><th style="text-align:right;padding:5px 7px;">Amount</th></tr>
        ${stages.map(s=>`<tr><td style="text-align:left;padding:5px 7px;">${esc(s.name)}</td><td>${s.pct}%</td><td style="text-align:right;padding:5px 7px;">${fmt(total*(s.pct/100))}</td></tr>`).join('')}
      </table>` : '<p style="font-size:12px;color:var(--muted);">No stages defined.</p>'}
      ${isContract ? `<div class="pv-section-title">Terms &amp; Conditions</div>
      <p style="font-size:11px;line-height:1.7;color:var(--ink);">This Agreement is effective on the date of signing and will end upon completion of construction services. The term may be extended upon written consent from both Parties. This Agreement will automatically terminate when both Parties fulfil their obligations.</p>
      <div class="pv-section-title">Signatures</div>
      <div class="pv-sig-block">
        <div class="pv-sig">Constructor: ${co.rep||co.name}<br>Signature: _________________________ &nbsp; Date: _____________</div>
        ${clients.map(c=>`<div class="pv-sig">Client: ${esc(c.name)||'_____________'}<br>Signature: _________________________ &nbsp; Date: _____________</div>`).join('')}
      </div>` : `<div style="margin-top:14px;padding:9px 13px;background:var(--pale);border-radius:8px;font-size:11px;color:var(--muted);border-left:3px solid var(--gold);">This is a quote only and is not a binding contract until signed by both parties. Valid for 30 days.</div>`}
    </div>`;
  } else {
    const unpaid = stages.filter(s => !s.paid);
    let html = ''; let n = 1;
    clients.forEach(client => {
      const clientTotal = parseFloat(client.amount) || (total / Math.max(clients.length, 1));
      const ratio = total ? clientTotal / total : 1 / clients.length;
      const rem = unpaid.reduce((s,st) => s + total*(st.pct/100)*ratio, 0);
      let rBlocks = '';
      unpaid.forEach(stage => {
        const amt = total * (stage.pct / 100) * ratio;
        rBlocks += `<div class="receipt-block">
          <div class="receipt-block-title">RECEIPT #${n++} — ${esc(stage.name)}</div>
          <div class="receipt-field"><span class="lbl">Client:</span><span>${esc(client.name)||'—'}</span></div>
          <div class="receipt-field"><span class="lbl">Amount:</span><span>${fmt(amt)}</span></div>
          <div style="font-size:11px;margin-bottom:4px;">Payment Method: ☐ Cash &nbsp; ☐ Cheque &nbsp; ☐ E-Transfer</div>
          <div class="receipt-field"><span class="lbl">Date of Payment:</span><span>_______________________________</span></div>
          <div class="note-text">Note: ${esc(client.name)||'Client'}'s share of ${fmt(total*(stage.pct/100))} stage payment</div>
          <div class="receipt-sig">Received by: _________________________ &nbsp;&nbsp; Date: _____________<br>Print Name: ${co.rep||co.name}</div>
        </div>`;
      });
      html += `<div class="preview-wrap" style="margin-bottom:18px;">
        <div class="pv-header">
          ${logoData ? `<img src="${logoData}" class="pv-logo">` : ''}
          <div class="pv-company">${co.name}</div>
          <div class="pv-company-sub">${[co.addr,co.phone,co.email].filter(Boolean).join(' | ')}</div>
          <div class="pv-doc-title">PAYMENT RECEIPT LOG</div>
          <div style="font-size:11px;color:var(--muted);margin-top:3px;font-weight:600;">${esc(client.name)||'Client'}${client.address?' — '+esc(client.address):''}</div>
          <div style="font-size:11px;color:var(--muted);">Project: ${proj.name} — ${proj.address}</div>
        </div>
        ${rBlocks || '<p style="font-size:12px;color:var(--muted);">No unpaid stages.</p>'}
        <div style="margin-top:10px;font-size:13px;"><strong>Total remaining for ${esc(client.name)||'client'}:</strong> ${fmt(rem)}</div>
      </div>`;
    });
    container.innerHTML = html || '<p style="color:var(--muted);font-size:13px;">Add clients and stages to generate receipts.</p>';
  }
}
