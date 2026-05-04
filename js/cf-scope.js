// ═══════════════════════════════════════════════════════════════
// SCOPE DEFAULTS
// ═══════════════════════════════════════════════════════════════
const FENCE_DEFAULTS = [
  {cat:'Fence Style',name:'Shadow box fence (6 ft)',unit:'linear ft',rateKey:'lf',qty:0},
  {cat:'Fence Style',name:'Shadow box fence (4 ft)',unit:'linear ft',rateKey:'lf',qty:0},
  {cat:'Fence Style',name:'Frame with mesh wire (4 ft)',unit:'linear ft',rateKey:'lf',qty:0},
  {cat:'Posts',name:'5×5 post installation',unit:'each',rateKey:'post',qty:0},
  {cat:'Posts',name:'4×4 post installation',unit:'each',rateKey:'post',qty:0},
  {cat:'Posts',name:'Post caps',unit:'each',rateKey:'',qty:0},
  {cat:'Finishing',name:'Trim (both sides, top)',unit:'linear ft',rateKey:'',qty:0},
  {cat:'Gates',name:'Gate (with header)',unit:'each',rateKey:'gate',qty:0},
  {cat:'Gates',name:'Gate (no header)',unit:'each',rateKey:'gate',qty:0},
  {cat:'Materials',name:'Fence boards & materials',unit:'linear ft',rateKey:'mat-lf',qty:0},
  {cat:'Labour',name:'General labour',unit:'hrs',rateKey:'',qty:0},
  {cat:'Other',name:'Site cleanup',unit:'lot',rateKey:'cleanup',qty:0},
];
const DECK_DEFAULTS = [
  {cat:'Structure',name:'Deck framing & joists',unit:'sq ft',rateKey:'deck-sf',qty:0},
  {cat:'Structure',name:'Ledger board (attached)',unit:'linear ft',rateKey:'',qty:0},
  {cat:'Structure',name:'Posts & footings',unit:'each',rateKey:'footing',qty:0},
  {cat:'Decking',name:'Pressure treated decking',unit:'sq ft',rateKey:'deck-sf',qty:0},
  {cat:'Decking',name:'Composite decking',unit:'sq ft',rateKey:'deck-sf',qty:0},
  {cat:'Decking',name:'Cedar decking',unit:'sq ft',rateKey:'deck-sf',qty:0},
  {cat:'Railings',name:'Railing / guard installation',unit:'linear ft',rateKey:'rail',qty:0},
  {cat:'Stairs',name:'Stair construction',unit:'per step',rateKey:'stair',qty:0},
  {cat:'Finishing',name:'Fascia & trim boards',unit:'linear ft',rateKey:'',qty:0},
  {cat:'Labour',name:'General labour',unit:'hrs',rateKey:'',qty:0},
  {cat:'Other',name:'Permit acquisition',unit:'lot',rateKey:'',qty:0},
  {cat:'Other',name:'Site cleanup',unit:'lot',rateKey:'cleanup',qty:0},
];

function loadScopeDefaults() {
  const type = document.getElementById('proj-type').value;
  let defaults = type==='fence' ? FENCE_DEFAULTS : type==='deck' ? DECK_DEFAULTS : type==='both' ? [...FENCE_DEFAULTS,...DECK_DEFAULTS] : [];
  scopeItems = defaults.map((d,i) => ({
    id:'def-'+i, cat:d.cat, name:d.name, unit:d.unit, rateKey:d.rateKey,
    qty:d.qty, price:getRate(d.rateKey), checked:false, custom:false
  }));
  renderScope(); update();
}

function addCustomItem() {
  const name = document.getElementById('custom-item-name').value.trim();
  const unit = document.getElementById('custom-item-unit').value;
  if (!name) { alert('Enter a custom item name.'); return; }
  scopeItems.push({id:'cust-'+Date.now(),cat:'Custom',name,unit,rateKey:'',qty:1,price:0,checked:true,custom:true});
  document.getElementById('custom-item-name').value='';
  renderScope(); update();
}

function renderScope() {
  const list = document.getElementById('scope-list');
  const cats = [...new Set(scopeItems.map(s=>s.cat))];
  list.innerHTML = cats.map(cat => {
    const items = scopeItems.filter(s=>s.cat===cat);
    return `<div class="scope-category">
      <div class="scope-cat-title">${cat}</div>
      <div>${items.map(item=>`
        <div class="scope-item-row" id="row-${item.id}" style="opacity:${item.checked?1:.55}">
          <input type="checkbox" class="scope-item-check" ${item.checked?'checked':''} onchange="toggleScope('${item.id}',this.checked)">
          <span class="scope-item-name">${item.name}</span>
          <input class="scope-item-qty" type="number" value="${item.qty}" min="0" onchange="updateScopeItem('${item.id}','qty',this.value)">
          <span class="scope-item-unit">${item.unit}</span>
          <input class="scope-item-price" type="number" value="${item.price||''}" placeholder="$/unit" onchange="updateScopeItem('${item.id}','price',this.value)">
          <span class="scope-item-total" id="total-${item.id}">${fmtScope(item)}</span>
          ${item.custom?`<button class="remove-btn" onclick="removeScope('${item.id}')">×</button>`:'<span></span>'}
        </div>`).join('')}</div>
    </div>`;
  }).join('');
}

function toggleScope(id,checked){const item=scopeItems.find(s=>s.id===id);if(item){item.checked=checked;document.getElementById('row-'+id).style.opacity=checked?1:.55;}update();}
function updateScopeItem(id,field,val){const item=scopeItems.find(s=>s.id===id);if(item){item[field]=Math.max(0,parseFloat(val)||0);document.getElementById('total-'+id).textContent=fmtScope(item);}update();}
function removeScope(id){scopeItems=scopeItems.filter(s=>s.id!==id);renderScope();update();}
function fmtScope(item){if(!item.checked)return'';return fmt((item.qty||0)*(item.price||0));}

// ═══════════════════════════════════════════════════════════════
// CLIENTS
// ═══════════════════════════════════════════════════════════════
function addClient(name='',address='',amount=''){
  clients.push({id:Date.now()+Math.random(),name,address,amount});
  renderClients();update();
}
function removeClient(id){clients=clients.filter(c=>c.id!==id);renderClients();update();}
function updateClient(id,field,val){const c=clients.find(c=>c.id===id);if(c){c[field]=field==='amount'?(parseFloat(val)||0):val;update();}}
function renderClients(){
  const list=document.getElementById('clients-list');
  list.innerHTML=clients.map((c,i)=>`
    <div class="client-row">
      <div class="client-row-header"><span class="client-tag">Client ${i+1}</span>${clients.length>1?`<button class="remove-btn" onclick="removeClient(${c.id})">×</button>`:''}</div>
      <div class="client-fields">
        <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" value="${esc(c.name)}" placeholder="e.g. Jane Smith" onchange="updateClient(${c.id},'name',this.value)"></div>
        <div class="form-group"><label class="form-label">Address</label><input class="form-input" value="${esc(c.address)}" placeholder="e.g. 456 Maple St" onchange="updateClient(${c.id},'address',this.value)"></div>
        <div class="form-group"><label class="form-label">Share ($)</label><input class="form-input mono" type="number" value="${c.amount}" placeholder="0.00" onchange="updateClient(${c.id},'amount',this.value)"></div>
      </div>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════════════
// STAGES
// ═══════════════════════════════════════════════════════════════
function addStage(name='',pct=0,paid=false){
  stages.push({id:Date.now()+Math.random(),name,pct,paid});
  renderStages();update();
}
function removeStage(id){stages=stages.filter(s=>s.id!==id);renderStages();update();}
function updateStage(id,field,val){const s=stages.find(s=>s.id===id);if(s){if(field==='pct')s.pct=parseFloat(val)||0;else if(field==='paid')s.paid=val;else s[field]=val;update();}}
function applyPayTemplate(){
  const t=document.getElementById('pay-template').value;
  stages=[];
  if(t==='5050'){addStage('Deposit',50,false);addStage('Completion',50,false);}
  else if(t==='403030'){addStage('Deposit',40,false);addStage('Materials Delivered / Work Begun',30,false);addStage('Completion',30,false);}
  else if(t==='334033'){addStage('Stage 1',33,false);addStage('Stage 2',34,false);addStage('Stage 3',33,false);}
  else addStage('Payment 1',100,false);
}
function renderStages(){
  const total=getProjectTotal();
  const list=document.getElementById('stages-list');
  list.innerHTML=stages.map((s,i)=>{
    const amt=total*(s.pct/100);
    return`<div class="stage-row">
      <div class="form-group"><label class="form-label">Stage Name</label><input class="form-input" value="${esc(s.name)}" onchange="updateStage(${s.id},'name',this.value)"></div>
      <div class="form-group"><label class="form-label">% of Total</label><input class="form-input mono" type="number" value="${s.pct}" min="0" max="100" onchange="updateStage(${s.id},'pct',this.value)"></div>
      <div class="form-group"><label class="form-label">Amount</label><div class="form-input mono" style="background:var(--pale);cursor:default;">${fmt(amt)}</div></div>
      <div class="form-group" style="justify-content:flex-end;"><label class="form-label">Paid?</label><label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer;margin-top:4px;"><input type="checkbox" ${s.paid?'checked':''} onchange="updateStage(${s.id},'paid',this.checked)"> ✓</label></div>
      <button class="remove-btn" onclick="removeStage(${s.id})" style="align-self:flex-end;margin-bottom:2px;">×</button>
    </div>`;
  }).join('');
  if(stages.length){const pctSum=stages.reduce((s,st)=>s+st.pct,0);if(Math.round(pctSum)!==100)list.innerHTML+=`<div style="margin-top:8px;padding:8px 12px;background:#fff3cd;border:1px solid #ffc107;border-radius:8px;font-size:12px;color:#856404;">⚠️ Stages total ${pctSum}% — should equal 100%</div>`;}
}

// ═══════════════════════════════════════════════════════════════
// TOTALS
// ═══════════════════════════════════════════════════════════════
function getScopeSubtotal(){return Math.round(scopeItems.filter(s=>s.checked).reduce((sum,s)=>sum+(s.qty||0)*(s.price||0),0)*100)/100;}
function getProjectTotal(){
  const override=parseFloat(document.getElementById('pay-override').value);
  if(override>0)return override;
  const sub=getScopeSubtotal();
  const hst=document.getElementById('include-hst').checked?Math.round(sub*HST_RATE*100)/100:0;
  return Math.round((sub+hst)*100)/100;
}

function renderClientSplit(){
  const total=getProjectTotal();
  const el=document.getElementById('client-split-summary');
  if(!clients.length||!stages.length){el.innerHTML='';return;}
  const unpaid=stages.filter(s=>!s.paid);
  const rows=clients.map(c=>{
    const ratio=total?(parseFloat(c.amount)||0)/total:1/clients.length;
    const rem=unpaid.reduce((s,st)=>s+total*(st.pct/100)*ratio,0);
    return`<tr><td>${esc(c.name)||'(unnamed)'}</td><td style="text-align:right">${fmt(c.amount)}</td><td style="text-align:right">${fmt(rem)}</td></tr>`;
  }).join('');
  el.innerHTML=`<p style="font-size:11px;font-weight:700;color:var(--navy);margin-bottom:6px;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.08em;">Per-Client Split</p>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <tr style="background:var(--navy);color:#fff;"><th style="padding:5px 9px;text-align:left;font-family:'DM Mono',monospace;font-size:9px;">Client</th><th style="padding:5px 9px;text-align:right;font-family:'DM Mono',monospace;font-size:9px;">Total Share</th><th style="padding:5px 9px;text-align:right;font-family:'DM Mono',monospace;font-size:9px;">Still Owing</th></tr>
      ${rows}
    </table>`;
}

// ═══════════════════════════════════════════════════════════════
// COMPANY / LOGO / RATES
// ═══════════════════════════════════════════════════════════════
function saveCompany(){['co-name','co-rep','co-address','co-phone','co-email','co-website'].forEach(id=>safeSetItem('cf-'+id,document.getElementById(id).value));update();}
function loadCompany(){['co-name','co-rep','co-address','co-phone','co-email','co-website'].forEach(id=>{const v=localStorage.getItem('cf-'+id);if(v)document.getElementById(id).value=v;});updateHeader();}
function updateHeader(){const n=document.getElementById('co-name').value;document.getElementById('header-company-name').textContent=n||'ContractForge';}
function handleLogo(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{logoData=ev.target.result;safeSetItem('cf-logo',logoData);showLogo(logoData);update();};reader.onerror=()=>{alert('Could not read logo file.');};reader.readAsDataURL(file);}
function showLogo(data){const img=document.getElementById('logo-preview');img.src=data;img.style.display='block';document.getElementById('logo-upload-text').textContent='Click to change logo';document.getElementById('header-icon-wrap').innerHTML=`<img src="${data}" class="logo-img">`;}
function removeLogo(){logoData=null;localStorage.removeItem('cf-logo');document.getElementById('logo-preview').style.display='none';document.getElementById('logo-upload-text').textContent='Click or tap to upload logo';document.getElementById('header-icon-wrap').innerHTML='🏗️';update();}
function loadLogoFromStorage(){const s=localStorage.getItem('cf-logo');if(s){logoData=s;showLogo(s);}}

// UPDATED: Added the two new rates below
function saveRates(){['rate-lf','rate-mat-lf','rate-gate','rate-post','rate-deck-sf','rate-footing','rate-rail','rate-stair','rate-cleanup','rate-demo'].forEach(id=>safeSetItem('cf-'+id,document.getElementById(id).value));}
function loadRates(){['rate-lf','rate-mat-lf','rate-gate','rate-post','rate-deck-sf','rate-footing','rate-rail','rate-stair','rate-cleanup','rate-demo'].forEach(id=>{const v=localStorage.getItem('cf-'+id);if(v)document.getElementById(id).value=v;});}
function getRate(key){
  const map={
    'lf':'rate-lf',
    'mat-lf':'rate-mat-lf',
    'gate':'rate-gate',
    'post':'rate-post',
    'deck-sf':'rate-deck-sf',
    'footing':'rate-footing',
    'rail':'rate-rail',
    'stair':'rate-stair',
    'cleanup':'rate-cleanup',
    'demo':'rate-demo'
  };
  if(!key||!map[key])return 0;
  return parseFloat(document.getElementById(map[key]).value)||0;
}