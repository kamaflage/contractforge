// ═══════════════════════════════════════════════════════════════
// WIZARD DEFINITION
// ═══════════════════════════════════════════════════════════════
const WIZ_STEPS = [
  // ── Common ──────────────────────────────────────────────────
  { id:'projType', type:'choice', question:'What type of project is this?', sub:'Select the primary work to be done.',
    options:[{icon:'🪵',label:'Fence'},{icon:'🏗️',label:'Deck'},{icon:'🔧',label:'Fence & Deck'}] },
  { id:'clientName', type:'text', question:"What is the client's name?", sub:'Enter first and last name.', placeholder:'e.g. Alex Johnson', inputmode:'text' },
  { id:'clientAddress', type:'text', question:'What is the property address?', sub:'Street address where work will be done.', placeholder:'e.g. 456 Maple Ave, Anytown ON', inputmode:'text' },

  // ── Fence steps (skip for Deck-only) ────────────────────────
  { id:'linearFt', type:'number', skip:(a)=>a.projType==='Deck',
    question:'Total linear footage?', sub:'Total length of fence to be installed in linear feet.', placeholder:'200', unit:'linear feet', min:1 },
  { id:'fenceStyle', type:'choice', skip:(a)=>a.projType==='Deck',
    question:'What fence style?', sub:'Select the primary style. You can add sections in scope.',
    customPlaceholder:'e.g. Split Rail',
    options:[
      {icon:'🟫',label:'Shadow Box',desc:'Alternating boards each side, semi-private, finished both sides'},
      {icon:'🪵',label:'Board on Board',desc:'Overlapping boards both sides, full privacy, good neighbour style'},
      {icon:'🔲',label:'Stockade / Dog Ear',desc:'Side-by-side pickets, pointed or dog-ear tops, full privacy'},
      {icon:'↔️',label:'Horizontal',desc:'Modern look, boards running lengthwise'},
      {icon:'⬛',label:'Frame + Mesh Wire',desc:'Open frame with welded wire, functional/garden use'},
      {icon:'🏡',label:'Picket',desc:'Traditional spaced pickets, decorative, lower privacy'},
    ]},
  { id:'fenceHeight', type:'choice', skip:(a)=>a.projType==='Deck',
    question:'What height?', sub:'Select fence height. Ontario max between neighbours is 8 ft.',
    customPlaceholder:'e.g. 4.5 ft',
    options:[
      {icon:'▪',label:'3 ft'},{icon:'▪',label:'4 ft'},{icon:'▪',label:'5 ft'},
      {icon:'▪',label:'6 ft'},{icon:'▪',label:'7 ft'},{icon:'▪',label:'8 ft'},
      {icon:'✏️',label:'Custom'},
    ]},
  { id:'postSize', type:'choice', skip:(a)=>a.projType==='Deck',
    question:'Post size?', sub:'Select the post size to be used.',
    customPlaceholder:'e.g. 6×6',
    options:[
      {icon:'📦',label:'4×4',desc:'Standard residential'},
      {icon:'📦',label:'4×6',desc:'Heavier residential'},
      {icon:'📦',label:'5×5',desc:'Most common for privacy fences'},
      {icon:'📦',label:'6×6',desc:'Commercial / heavy duty'},
      {icon:'✏️',label:'Custom'},
    ]},
  { id:'burialDepth', type:'choice', skip:(a)=>a.projType==='Deck',
    question:'Post burial depth?', sub:'How deep will posts be set? This determines the lumber length to purchase.',
    customPlaceholder:'e.g. 3.5 ft',
    options:[
      {icon:'📏',label:'2 ft',    desc:'Lighter fences, firm soil'},
      {icon:'📏',label:'2.5 ft',  desc:'Standard residential'},
      {icon:'📏',label:'3 ft',    desc:'Heavy fences, loose soil, Ontario frost line'},
      {icon:'✏️',label:'Custom'},
    ]},
  { id:'postSpacing', type:'stepper', skip:(a)=>a.projType==='Deck',
    question:'Post spacing?', sub:'Standard is 8 ft on centre. Adjust if needed.', default:8, min:4, max:16, unit:'ft on centre' },
  { id:'gates', type:'stepper', skip:(a)=>a.projType==='Deck',
    question:'How many gates?', sub:'Total number of gates to be installed on this project.', default:0, min:0, max:20, unit:'gates' },
  { id:'gateWidth', type:'choice', skip:(a)=>a.projType==='Deck'||a.gates===0,
    question:'Gate width?', sub:'Standard sizes shown. Single = one door, Double = two doors.',
    customPlaceholder:'e.g. 5 ft wide',
    options:[
      {icon:'🚪',label:'4 ft — Single'},{icon:'🚪',label:'6 ft — Single'},
      {icon:'🚪',label:'8 ft — Double'},{icon:'✏️',label:'Custom width'},
    ]},
  { id:'gateStyle', type:'choice', skip:(a)=>a.projType==='Deck'||a.gates===0,
    question:'Gate style?', sub:'Match the fence or choose something different.',
    options:[
      {icon:'🔁',label:'Same as fence'},
      {icon:'🪵',label:'Shadow Box'},
      {icon:'⬛',label:'Frame + Mesh Wire'},
      {icon:'🪵',label:'Board on Board'},
      {icon:'✏️',label:'Custom — describe in notes'},
    ]},
  { id:'cornerPosts', type:'stepper', skip:(a)=>a.projType==='Deck',
    question:'How many corner posts?', sub:'Posts at 90° corners in the fence line.', default:0, min:0, max:20, unit:'corner posts' },
  { id:'features', type:'features', skip:(a)=>a.projType==='Deck',
    question:'Additional features?', sub:'Toggle on any extras that apply. Tap + Add Feature to include anything not listed.' },
  { id:'concrete', type:'choice', skip:(a)=>a.projType==='Deck',
    question:'Concrete method?', sub:'How will posts be set?',
    options:[{icon:'🪣',label:'Fast-Set Bags (Quikrete)'},{icon:'🔄',label:'Mix On Site'},{icon:'📐',label:'No Concrete (Driven)'}] },
  { id:'boardGap', type:'stepper', default:2, min:1, max:6, unit:'inches',
    question:(a)=>a.fenceStyle==='Board on Board'?'Board overlap (inches)?':'Board gap (inches)?',
    sub:(a)=>a.fenceStyle==='Board on Board'?'How many inches do boards overlap each other? Standard is 1 inch.':'Gap between fence boards in inches. Standard is 2 in.',
    skip:(a)=>a.projType==='Deck'||(a.fenceStyle!=='Shadow Box'&&a.fenceStyle!=='Board on Board') },

  // ── Deck steps (skip for Fence-only) ────────────────────────
  { id:'deckMaterial', type:'choice', skip:(a)=>a.projType==='Fence',
    question:'What decking material?', sub:'Select the surface material for the deck boards. Substructure is always pressure-treated.',
    options:[
      {icon:'🟫',label:'PT Softwood',    desc:'Most common — pressure-treated pine or spruce, budget-friendly'},
      {icon:'🌲',label:'Cedar',          desc:'Natural beauty, rot-resistant, premium wood option'},
      {icon:'🔷',label:'Composite',      desc:'Wood-fibre + plastic blend, low maintenance, 25+ yr lifespan'},
      {icon:'🛡️',label:'PVC / Capped',   desc:'Full PVC cap (Trex, AZEK), maximum durability and warranty'},
      {icon:'🌴',label:'Ipe / Hardwood', desc:'Brazilian hardwood — extremely dense, 40+ yr lifespan, high-end'},
    ]},
  { id:'deckLength', type:'number', skip:(a)=>a.projType==='Fence',
    question:'Deck length (along the house)?', sub:'Measure the side of the deck running parallel to the house wall.',
    placeholder:'16', unit:'feet', min:4 },
  { id:'deckWidth', type:'number', skip:(a)=>a.projType==='Fence',
    question:'Deck width (out from the house)?', sub:'How far does the deck extend away from the house.',
    placeholder:'12', unit:'feet', min:4 },
  { id:'deckHeight', type:'choice', skip:(a)=>a.projType==='Fence',
    question:'Height above grade?', sub:'How high will the deck surface be off the ground? Affects posts, railings, and stairs required.',
    options:[
      {icon:'⬛',label:'On Grade (0–12")', desc:'Very low — minimal framing, no stairs or railings needed'},
      {icon:'▪', label:'Low (13–30")',     desc:'One step or none needed — railings often optional'},
      {icon:'📦',label:'Mid (31–48")',     desc:'Railings required — 2 to 4 steps'},
      {icon:'🏗️',label:'Elevated (49"+)', desc:'Full railings and stair flight required, longer posts'},
    ]},
  { id:'boardOrientation', type:'choice', skip:(a)=>a.projType==='Fence',
    question:'Deck board layout?', sub:'How will the deck boards run across the frame?',
    options:[
      {icon:'━', label:'Straight',                desc:'Standard — boards run perpendicular to house, 10% waste factor'},
      {icon:'╲', label:'Diagonal',               desc:'45° angle, more visual interest, 15% extra waste'},
      {icon:'⬜',label:'Picture Frame + Straight',desc:'Mitered border around edge, straight boards inside'},
    ]},
  { id:'fascia', type:'choice', skip:(a)=>a.projType==='Fence',
    question:'Add fascia boards?', sub:'Fascia wraps the visible rim joists for a clean, finished look.',
    options:[
      {icon:'✅',label:'Yes',desc:'Recommended — covers framing, matches deck surface material'},
      {icon:'⬜',label:'No', desc:'Leave rim joists exposed'},
    ]},
  { id:'deckRailings', type:'choice', skip:(a)=>a.projType==='Fence',
    question:'Railing type?', sub:'Required at 24"+ above grade (42" min height in Ontario). Select style or None for low decks.',
    customPlaceholder:'e.g. Glass panels',
    options:[
      {icon:'⬜',label:'None',           desc:'On-grade or low deck — no railings needed'},
      {icon:'🪵',label:'PT Wood',        desc:'Pressure-treated posts, rails, and wood balusters'},
      {icon:'🌲',label:'Cedar',          desc:'Cedar posts and rails — matches cedar decking'},
      {icon:'🔷',label:'Composite',      desc:'Composite rail system, matches composite decking'},
      {icon:'🔩',label:'Aluminum',       desc:'Pre-fabricated metal panels, low-maintenance, modern'},
      {icon:'〰️',label:'Cable',          desc:'Stainless cable + metal posts, open view, contemporary'},
      {icon:'✏️',label:'Custom'},
    ]},
  { id:'deckStairs', type:'stepper', skip:(a)=>a.projType==='Fence',
    question:'Number of stair flights?', sub:'A flight is one full set of stairs from deck surface down to grade.',
    default:0, min:0, max:4, unit:'stair flights' },
  { id:'stairWidth', type:'choice', skip:(a)=>a.projType==='Fence'||a.deckStairs===0,
    question:'Stair width?', sub:'Width of each stair flight.',
    options:[
      {icon:'📏',label:'3 ft',desc:'Minimum code width'},
      {icon:'📏',label:'4 ft',desc:'Standard comfortable width'},
      {icon:'📏',label:'5 ft',desc:'Wide / grand entry'},
    ]},
  { id:'deckFeatures', type:'deckFeatures', skip:(a)=>a.projType==='Fence',
    question:'Additional deck features?', sub:'Toggle on any extras for this project. Add anything not listed.' },
];

// ═══════════════════════════════════════════════════════════════
// MATERIAL CALCULATORS
// ═══════════════════════════════════════════════════════════════
function calcMaterials(a) {
  const type = a.projType || 'Fence';
  if (type === 'Deck') return calcDeckMaterials(a);
  if (type === 'Fence & Deck') return [...calcFenceMaterials(a), ...calcDeckMaterials(a)];
  return calcFenceMaterials(a);
}

function calcFenceMaterials(a) {
  const lf = a.linearFt || 0;
  const spacing = a.postSpacing || 8;
  const gates = a.gates || 0;
  const corners = a.cornerPosts || 0;
  const style = a.fenceStyle || 'Shadow Box';
  const isMesh = style === 'Frame + Mesh Wire';
  const isBoardOnBoard = style === 'Board on Board';
  const isStockade = style === 'Stockade / Dog Ear';
  const isHorizontal = style === 'Horizontal';
  const isPicket = style === 'Picket';

  const rawH = a.fenceHeight || '6 ft';
  const fenceHeight = parseFloat(rawH) || 6;
  const rawBurial = a.burialDepth || '2.5 ft';
  const burialDepth = parseFloat(rawBurial) || 2.5;
  const totalPostLength = fenceHeight + burialDepth;
  const standardLengths = [8, 10, 12, 14, 16];
  const postLength = standardLengths.find(l => l >= totalPostLength) || Math.ceil(totalPostLength);

  const boardGap = a.boardGap || 2;
  const boardWidth = 6;

  const linePosts = Math.ceil(lf / spacing) + 1;
  const gatePosts = gates * 2;
  const totalPosts = linePosts + corners + gatePosts;

  let boardQty = 0, meshRollsQty = 0, frameRailQty = 0;
  if (isMesh) {
    frameRailQty = Math.ceil(lf * 3 / 16) * 16;
    meshRollsQty = Math.ceil(lf / 50);
  } else if (isBoardOnBoard) {
    boardQty = Math.ceil(lf * (12 / boardWidth) * 2 * 1.15);
  } else if (isStockade || isHorizontal) {
    boardQty = Math.ceil(lf * (12 / boardWidth) * 1.1);
  } else if (isPicket) {
    boardQty = Math.ceil(lf * (12 / boardWidth) * 0.5 * 1.1);
  } else {
    const effectiveWidth = boardWidth + boardGap;
    boardQty = Math.ceil(lf * (12 / effectiveWidth) * 2 * 1.1);
  }

  const concreteBags = totalPosts * 2;
  const screwLbs = Math.ceil((lf / 100) * 2 + gates);

  const feats = a.features || [];
  const feat = id => feats.some(f => f.id === id && f.enabled);
  const hasTrimTop  = feat('trim-top')    || a.hasTrim;
  const hasTrimBoth = feat('trim-both')   || a.trimBothSides;
  const hasPostCaps = feat('post-caps')   || a.postCaps;
  const hasCleanup  = feat('cleanup')     || a.cleanup;
  const hasLattice  = feat('lattice-top');
  const hasKickboard= feat('kickboard');
  const hasArbour   = feat('arbour');
  const trimLf = hasTrimTop ? Math.ceil(lf * (hasTrimBoth ? 2 : 1)) : 0;

  const postLabel = (a.postSize || '5×5').replace(/\s*Posts\s*/i,'').trim();

  const items = [];
  items.push({ name:`${postLabel} Posts (${postLength} ft — buy length)`, qty:totalPosts, unit:'each', note:`${fenceHeight}ft fence + ${burialDepth}ft burial = ${totalPostLength}ft needed → buy ${postLength}ft lumber. ${linePosts} line + ${corners} corner + ${gatePosts} gate posts` });
  if (!isMesh) {
    const styleNote = isBoardOnBoard ? ' — overlapping, both sides' : isStockade ? ' — side-by-side pickets' : isHorizontal ? ' — horizontal run' : isPicket ? ' — spaced pickets' : '';
    items.push({ name:`Fence Boards (${fenceHeight} ft, 6" wide)${styleNote}`, qty:boardQty, unit:'each', note:'Waste factor included' });
  }
  if (isMesh) {
    items.push({ name:'2×4 Frame Rails (16 ft)', qty:frameRailQty/16, unit:'each', note:'3 rails per section' });
    items.push({ name:'Welded Wire Mesh (50 ft roll)', qty:meshRollsQty, unit:'rolls', note:'' });
  }
  if (!isMesh) items.push({ name:'2×4 Horizontal Rails (16 ft)', qty:Math.ceil(lf*3/16), unit:'each', note:'Top, mid, bottom stringers' });
  if (a.concrete !== 'No Concrete (Driven)') items.push({ name:'Fast-Set Concrete (80 lb bag)', qty:concreteBags, unit:'bags', note:'2 bags per post' });
  if (gates > 0) {
    items.push({ name:'Gate Hinges (heavy duty)', qty:gates*2, unit:'each', note:'2 per gate' });
    items.push({ name:'Gate Latch', qty:gates, unit:'each', note:'1 per gate' });
    items.push({ name:'Gate Frame Lumber (2×4)', qty:gates*4, unit:'each', note:'Frame per gate' });
  }
  items.push({ name:'Exterior Screws / Nails (lbs)', qty:screwLbs, unit:'lbs', note:'Galvanized' });
  if (hasPostCaps) items.push({ name:'Post Caps', qty:totalPosts, unit:'each', note:'' });
  if (trimLf > 0) items.push({ name:'1×4 Trim Board (cap rail)', qty:Math.ceil(trimLf/16), unit:'each (16 ft)', note:hasTrimBoth?'Both sides':'One side' });
  if (hasLattice) items.push({ name:'Lattice Panel (4×8 ft)', qty:Math.ceil(lf/8), unit:'each', note:'1 ft lattice top' });
  if (hasKickboard) items.push({ name:'Kickboard / Rot Board (2×6, 8 ft)', qty:Math.ceil(lf/8), unit:'each', note:'Bottom rot board' });
  if (hasArbour) items.push({ name:'Arbour / Decorative Gate Header', qty:gates||1, unit:'each', note:'' });
  if (hasCleanup) items.push({ name:'Site Cleanup / Debris Disposal', qty:1, unit:'lot', note:'Included in quote' });

  return items;
}

function calcDeckMaterials(a) {
  const dL   = parseFloat(a.deckLength) || 0;
  const dW   = parseFloat(a.deckWidth)  || 0;
  const sqft = dL * dW;
  const perimeter = 2 * (dL + dW);
  const mat  = a.deckMaterial || 'PT Softwood';
  const orientation = a.boardOrientation || 'Straight';
  const hasFascia   = a.fascia === 'Yes';
  const railStyle   = a.deckRailings || 'None';
  const hasRailings = railStyle !== 'None';
  const stairs      = a.deckStairs || 0;
  const stairW      = parseFloat(a.stairWidth) || 4;
  const isElevated  = (a.deckHeight||'').includes('Mid') || (a.deckHeight||'').includes('Elevated');

  if (sqft === 0) return [];

  const beamRows     = Math.max(1, Math.ceil(dL / 8));
  const postsPerBeam = Math.ceil(dW / 8) + 1;
  const totalPosts   = beamRows * postsPerBeam;
  const postHeight   = isElevated ? '8 ft' : '4 ft';
  const concreteBags = totalPosts * 2;

  const beamBoardsPerRow = Math.ceil(dW / 16) * 2; // doubled
  const totalBeamBoards  = beamRows * beamBoardsPerRow;

  const ledgerBoards = Math.ceil(dL / 16);

  const joistSpacingFt = 16 / 12;
  const joistCount     = Math.ceil(dW / joistSpacingFt) + 1;
  const joistLengths   = [8, 10, 12, 14, 16, 20];
  const joistLength    = joistLengths.find(jl => jl >= dL) || Math.ceil(dL);

  const rimBoards = Math.ceil((2 * dL + dW) / 16);

  const blockingRows   = Math.max(0, Math.ceil(dW / 8) - 1);
  const blockingPieces = blockingRows * (joistCount - 1);
  const blockingBoards = Math.ceil(blockingPieces * (14.5 / 12) / 8);

  const joistHangers = joistCount * 2;

  const wasteFactor  = orientation === 'Diagonal' ? 1.15 : orientation === 'Picture Frame + Straight' ? 1.12 : 1.10;
  const boardWidthFt = 5.5 / 12; // 5/4×6 = 5.5" wide
  const deckBoardCount = Math.ceil((dW / boardWidthFt) * wasteFactor);
  const boardLengths = [8, 10, 12, 14, 16, 20];
  const boardLength  = boardLengths.find(bl => bl >= dL) || Math.ceil(dL);

  const matLabels = {
    'PT Softwood':   '5/4×6 PT Decking Board',
    'Cedar':         '5/4×6 Cedar Decking Board',
    'Composite':     'Composite Decking Board (16 ft)',
    'PVC / Capped':  'PVC Capped Composite Board (16 ft)',
    'Ipe / Hardwood':'5/4×6 Ipe Hardwood Decking Board',
  };
  const deckBoardLabel = (matLabels[mat] || '5/4×6 PT Decking Board') + ` (${boardLength} ft)`;

  const fasciaBoards = hasFascia ? Math.ceil(perimeter / 16) : 0;

  const railLF       = hasRailings ? Math.max(0, perimeter - stairs * (stairW + 2)) : 0;
  const railPosts    = hasRailings ? Math.ceil(railLF / 6) + 1 : 0;
  const balusters    = hasRailings && railStyle !== 'Cable' ? Math.ceil(railLF * 3) : 0;

  const stringersTotal = stairs * 3;
  const boardsPerTread = Math.ceil(stairW / boardWidthFt);
  const treadBoards    = stairs * 3 * boardsPerTread;

  const feats = a.deckFeatures || [];
  const feat  = id => feats.some(f => f.id === id && f.enabled);

  const items = [];

  items.push({ name:`6×6 PT Post (${postHeight})`, qty:totalPosts, unit:'each', note:`${postsPerBeam} posts × ${beamRows} beam rows` });
  items.push({ name:`Fast-Set Concrete (80 lb bag)`, qty:concreteBags, unit:'bags', note:'2 bags per post' });
  items.push({ name:`2×10 PT Ledger Board (16 ft)`, qty:ledgerBoards, unit:'each', note:'Lag-bolted to house rim joist' });
  items.push({ name:`2×10 PT Beam Board (16 ft)`, qty:totalBeamBoards, unit:'each', note:`Doubled — ${beamRows} beam rows × ${beamBoardsPerRow} boards each` });
  items.push({ name:`2×8 PT Joist (${joistLength} ft)`, qty:joistCount, unit:'each', note:`16" OC — spans ${dL} ft` });
  items.push({ name:`2×8 PT Rim / Header Joist (16 ft)`, qty:rimBoards, unit:'each', note:'Perimeter framing' });
  if (blockingBoards > 0) items.push({ name:`2×8 PT Blocking (cut from 8 ft boards)`, qty:blockingBoards, unit:'boards', note:`${blockingPieces} blocking pieces` });
  items.push({ name:`Joist Hangers (2×8)`, qty:joistHangers, unit:'each', note:'Both ends of each joist' });
  items.push({ name:`Post Caps / Standoff Bases`, qty:totalPosts, unit:'each', note:'' });
  items.push({ name:`Structural Screws / Lag Bolts (lbs)`, qty:Math.max(1, Math.ceil(sqft / 30)), unit:'lbs', note:'Galvanized' });

  items.push({ name:deckBoardLabel, qty:deckBoardCount, unit:'each', note:`${orientation} layout — ${Math.round((wasteFactor-1)*100)}% waste included` });
  if (hasFascia) items.push({ name:`Fascia Board — match surface material (16 ft)`, qty:fasciaBoards, unit:'each', note:'Perimeter wrap' });
  items.push({ name:`Deck Screws / Hidden Fasteners (lbs)`, qty:Math.max(1, Math.ceil(sqft / 50)), unit:'lbs', note:'' });

  if (hasRailings && railLF > 0) {
    const rm = railStyle === 'Composite' ? 'Composite' : railStyle === 'Aluminum' ? 'Aluminum' : railStyle === 'Cable' ? 'Metal' : railStyle === 'Cedar' ? 'Cedar' : 'PT';
    items.push({ name:`${rm} Railing Post 4×4 (42" — buy 4 ft)`, qty:railPosts, unit:'each', note:`6 ft spacing along ${railLF} LF` });
    items.push({ name:`${rm} Top Rail (16 ft)`, qty:Math.ceil(railLF / 16), unit:'each', note:'' });
    items.push({ name:`${rm} Bottom Rail (16 ft)`, qty:Math.ceil(railLF / 16), unit:'each', note:'' });
    if (railStyle === 'Cable') {
      items.push({ name:`Stainless Cable (100 ft roll)`, qty:Math.max(1, Math.ceil(railLF * 42 / 3 / 1200)), unit:'rolls', note:'42" height, 3" spacing estimate' });
      items.push({ name:`Cable Tensioners / End Fittings`, qty:railPosts * 4, unit:'each', note:'' });
    } else {
      items.push({ name:`${rm} Baluster (32")`, qty:balusters, unit:'each', note:'~3 per linear foot' });
    }
    items.push({ name:`Railing Post Bases`, qty:railPosts, unit:'each', note:'' });
  }

  if (stairs > 0) {
    items.push({ name:`2×12 Stair Stringer (8 ft)`, qty:stringersTotal, unit:'each', note:`3 stringers per flight` });
    items.push({ name:`2×6 Stair Tread (${stairW} ft cut to width)`, qty:treadBoards, unit:'each', note:`3 steps per flight × ${boardsPerTread} boards per tread` });
    if (hasRailings) items.push({ name:`Stair Railing — 2 sides per flight`, qty:stairs * 2, unit:'sides', note:'If height requires stair guards' });
  }

  if (feat('lighting')) items.push({ name:`Low-Voltage LED Deck Lights`, qty:Math.max(1, Math.ceil(sqft / 40)), unit:'each', note:'~1 per 40 sqft' });
  if (feat('bench'))    items.push({ name:`Built-in Bench (4 ft section)`, qty:Math.ceil(perimeter / 16), unit:'sections', note:'Framing + decking material' });
  if (feat('planters')) items.push({ name:`Planter Box (built-in)`, qty:2, unit:'each', note:'Adjust qty as needed' });
  if (feat('pergola'))  items.push({ name:`Pergola Post & Beam Kit`, qty:4, unit:'each', note:'Posts, beams, rafter hardware' });
  if (feat('privacy'))  items.push({ name:`Privacy Screen Panel (4×8 ft)`, qty:Math.ceil(perimeter / 8), unit:'each', note:'' });
  if (feat('cleanup'))  items.push({ name:`Site Cleanup / Debris Disposal`, qty:1, unit:'lot', note:'' });

  return items;
}

// ═══════════════════════════════════════════════════════════════
// WIZARD RENDER & NAVIGATION
// ═══════════════════════════════════════════════════════════════

function wizRender() {
  const body = document.getElementById('wiz-body');

  while (wizStep < WIZ_STEPS.length && WIZ_STEPS[wizStep].skip && WIZ_STEPS[wizStep].skip(wizAnswers)) {
    wizStep++;
  }

  if (wizStep >= WIZ_STEPS.length) {
    wizShowResults();
    return;
  }

  const step = WIZ_STEPS[wizStep];
  const total = WIZ_STEPS.filter(s => !s.skip || !s.skip(wizAnswers)).length;
  const current = WIZ_STEPS.slice(0, wizStep).filter(s => !s.skip || !s.skip(wizAnswers)).length + 1;
  const pct = Math.round((current / total) * 100);

  const question = typeof step.question === 'function' ? step.question(wizAnswers) : step.question;
  const sub      = typeof step.sub      === 'function' ? step.sub(wizAnswers)      : step.sub;

  let matWarnHtml = '';
  if (wizStep === 0 && !wizMatWarningDismissed) {
    const cfg = loadMatConfig();
    if (!cfg.some(c => c.cost > 0)) {
      matWarnHtml = `<div id="wiz-mat-warn" style="background:#fff3cd;color:#856404;border:1px solid #ffc107;border-radius:10px;padding:14px 16px;margin-bottom:16px;font-size:13px;line-height:1.6;">
        <strong>⚠️ Set your material prices first</strong><br>
        Your Materials Config has no prices entered yet. The Quote Wizard will calculate quantities automatically, but costs will be blank until you add supplier prices.
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
          <button onclick="wizMatWarningDismissed=true;document.getElementById('wiz-mat-warn').remove();navTo('sec-matconfig',document.querySelector('.nav-item:nth-child(3)'));"
            style="background:#856404;color:#fff;border:none;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:12px;font-weight:600;">Go to Materials Config</button>
          <button onclick="wizMatWarningDismissed=true;document.getElementById('wiz-mat-warn').remove();"
            style="background:transparent;border:1px solid #856404;color:#856404;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:12px;">Continue Anyway</button>
        </div>
      </div>`;
    }
  }

  let content = '';

  if (step.type === 'choice') {
    const curVal = wizAnswers[step.id] || '';
    const isCustomSelected = curVal && step.options && !step.options.find(o => o.label === curVal && !o.label.startsWith('Custom'));
    const showCustomInput = curVal && curVal.startsWith('Custom') || (isCustomSelected && !step.options.find(o=>o.label===curVal));
    content = `<div class="wiz-options">${step.options.map(o => {
      const isCustomOpt = o.label.startsWith('Custom');
      const sel = curVal === o.label || (isCustomOpt && curVal && !step.options.find(x=>x.label===curVal&&!x.label.startsWith('Custom')));
      return `<div class="wiz-option ${sel?'selected':''}" onclick="wizChoose('${step.id}','${o.label.replace(/'/g,"\\'").replace(/"/g,"&quot;")}')">
        <span class="wiz-option-icon">${o.icon}</span>
        <span style="display:flex;flex-direction:column;gap:2px;">
          <span>${o.label}</span>
          ${o.desc?`<span style="font-size:11px;font-weight:400;color:var(--muted);">${o.desc}</span>`:''}
        </span>
      </div>`;
    }).join('')}</div>
    ${showCustomInput ? `<div class="wiz-input-wrap" style="margin-top:12px;">
      <input class="wiz-big-input" id="wiz-custom-input" type="text"
        placeholder="${step.customPlaceholder||'Enter value...'}"
        value="${wizAnswers[step.id+'_val']||''}"
        onkeydown="if(event.key==='Enter')wizNext()">
    </div>` : ''}`;
  } else if (step.type === 'text') {
    content = `<div class="wiz-input-wrap">
      <input class="wiz-big-input" id="wiz-text-input" type="text" inputmode="${step.inputmode||'text'}"
        placeholder="${step.placeholder||''}" value="${wizAnswers[step.id]||''}"
        onkeydown="if(event.key==='Enter')wizNext()">
    </div>`;
  } else if (step.type === 'number') {
    content = `<div class="wiz-input-wrap">
      <input class="wiz-big-input" id="wiz-num-input" type="number" inputmode="decimal"
        placeholder="${step.placeholder||'0'}" value="${wizAnswers[step.id]||''}" min="${step.min||0}"
        onkeydown="if(event.key==='Enter')wizNext()">
      <div class="wiz-input-unit">${step.unit||''}</div>
    </div>`;
  } else if (step.type === 'stepper') {
    const val = wizAnswers[step.id] !== undefined ? wizAnswers[step.id] : step.default;
    content = `<div class="wiz-stepper">
      <button class="wiz-stepper-btn" onclick="wizStep_('${step.id}',${step.min||0},${step.max||100},-1)">−</button>
      <div class="wiz-stepper-val" id="step-val-${step.id}">${val}</div>
      <button class="wiz-stepper-btn" onclick="wizStep_('${step.id}',${step.min||0},${step.max||100},1)">+</button>
    </div>
    <div class="wiz-input-unit" style="margin-top:8px;">${step.unit||''}</div>`;
    if (wizAnswers[step.id] === undefined) wizAnswers[step.id] = step.default;
  } else if (step.type === 'features') {
    if (!wizAnswers.features) wizAnswers.features = getDefaultFeatures();
    content = `<div id="wiz-features-list">${wizAnswers.features.map((f,i)=>`
      <div class="wiz-toggle-row">
        <span class="wiz-toggle-label">${esc(f.label)}</span>
        <label class="wiz-toggle">
          <input type="checkbox" ${f.enabled?'checked':''} onchange="wizAnswers.features[${i}].enabled=this.checked">
          <span class="wiz-toggle-slider"></span>
        </label>
      </div>`).join('')}</div>
    <div style="margin-top:10px;display:flex;gap:8px;align-items:center;" id="wiz-feat-add-row">
      <input class="form-input" id="wiz-feat-input" placeholder="Custom feature name..." style="flex:1;font-size:13px;"
        onkeydown="if(event.key==='Enter'){event.preventDefault();wizAddFeature();}">
      <button class="btn btn-navy" onclick="wizAddFeature()">+ Add Feature</button>
    </div>`;
  } else if (step.type === 'deckFeatures') {
    if (!wizAnswers.deckFeatures) wizAnswers.deckFeatures = getDefaultDeckFeatures();
    content = `<div id="wiz-features-list">${wizAnswers.deckFeatures.map((f,i)=>`
      <div class="wiz-toggle-row">
        <span class="wiz-toggle-label">${esc(f.label)}</span>
        <label class="wiz-toggle">
          <input type="checkbox" ${f.enabled?'checked':''} onchange="wizAnswers.deckFeatures[${i}].enabled=this.checked">
          <span class="wiz-toggle-slider"></span>
        </label>
      </div>`).join('')}</div>
    <div style="margin-top:10px;display:flex;gap:8px;align-items:center;">
      <input class="form-input" id="wiz-feat-input" placeholder="Custom feature name..." style="flex:1;font-size:13px;"
        onkeydown="if(event.key==='Enter'){event.preventDefault();wizAddDeckFeature();}">
      <button class="btn btn-navy" onclick="wizAddDeckFeature()">+ Add Feature</button>
    </div>`;
  }

  const isCustomActive = step.type==='choice' && wizAnswers[step.id] && wizAnswers[step.id].startsWith('Custom');
  const showNextBtn = step.type !== 'choice' || isCustomActive;

  body.innerHTML = `
    ${matWarnHtml}
    <div class="wiz-step-label"><span>Step ${current} of ${total}</span><span>${pct}%</span></div>
    <div class="wiz-progress-bar"><div class="wiz-progress-fill" style="width:${pct}%"></div></div>
    <div class="wiz-card">
      <div class="wiz-question">${question}</div>
      <div class="wiz-sub">${sub}</div>
      ${content}
    </div>
    <div class="wiz-nav">
      ${wizStep > 0 ? `<button class="btn btn-navy" onclick="wizBack()">← Back</button>` : ''}
      ${showNextBtn ? `<button class="btn btn-gold" onclick="wizNext()">Next →</button>` : '<span style="flex:1"></span>'}
      <button class="btn btn-outline" style="background:rgba(0,0,0,.1);color:var(--muted);font-size:11px;" onclick="wizReset()">Start Over</button>
    </div>`;
  if(step.type==='text'){const el=document.getElementById('wiz-text-input');if(el)el.focus();}
  else if(step.type==='number'){const el=document.getElementById('wiz-num-input');if(el)el.focus();}
  else if(isCustomActive){const el=document.getElementById('wiz-custom-input');if(el)el.focus();}
}

function wizChoose(id, val) {
  wizAnswers[id] = val;
  if (val.startsWith('Custom')) {
    wizRender();
  } else {
    wizNext();
  }
}

function wizNext() {
  const step = WIZ_STEPS[wizStep];
  if (!step) return;

  if (step.type === 'text') {
    const el = document.getElementById('wiz-text-input');
    if (el) wizAnswers[step.id] = el.value.trim();
  } else if (step.type === 'number') {
    const el = document.getElementById('wiz-num-input');
    if (el) wizAnswers[step.id] = parseFloat(el.value) || 0;
  } else if (step.type === 'choice') {
    const customEl = document.getElementById('wiz-custom-input');
    if (customEl && customEl.value.trim()) wizAnswers[step.id] = customEl.value.trim();
  }
  
  wizStep++;
  
  while (wizStep < WIZ_STEPS.length && WIZ_STEPS[wizStep].skip && WIZ_STEPS[wizStep].skip(wizAnswers)) {
    wizStep++;
  }
  
  wizRender();
}

function wizBack() {
  if (wizStep === 0) return;
  
  wizStep--;
  
  while (wizStep > 0 && WIZ_STEPS[wizStep].skip && WIZ_STEPS[wizStep].skip(wizAnswers)) {
    wizStep--;
  }
  
  wizRender();
}

function wizAddFeature() {
  const el = document.getElementById('wiz-feat-input');
  if (!el || !el.value.trim()) return;
  if (!wizAnswers.features) wizAnswers.features = getDefaultFeatures();
  wizAnswers.features.push({ id:'custom-'+Date.now(), label:el.value.trim(), enabled:true });
  el.value = '';
  const list = document.getElementById('wiz-features-list');
  if (list) {
    list.innerHTML = wizAnswers.features.map((f,i)=>`
      <div class="wiz-toggle-row">
        <span class="wiz-toggle-label">${esc(f.label)}</span>
        <label class="wiz-toggle">
          <input type="checkbox" ${f.enabled?'checked':''} onchange="wizAnswers.features[${i}].enabled=this.checked">
          <span class="wiz-toggle-slider"></span>
        </label>
      </div>`).join('');
  }
}

function wizAddDeckFeature() {
  const el = document.getElementById('wiz-feat-input');
  if (!el || !el.value.trim()) return;
  if (!wizAnswers.deckFeatures) wizAnswers.deckFeatures = getDefaultDeckFeatures();
  wizAnswers.deckFeatures.push({ id:'custom-'+Date.now(), label:el.value.trim(), enabled:true });
  el.value = '';
  const list = document.getElementById('wiz-features-list');
  if (list) {
    list.innerHTML = wizAnswers.deckFeatures.map((f,i)=>`
      <div class="wiz-toggle-row">
        <span class="wiz-toggle-label">${esc(f.label)}</span>
        <label class="wiz-toggle">
          <input type="checkbox" ${f.enabled?'checked':''} onchange="wizAnswers.deckFeatures[${i}].enabled=this.checked">
          <span class="wiz-toggle-slider"></span>
        </label>
      </div>`).join('');
  }
}

function getDefaultFeatures() {
  return [
    {id:'trim-top',     label:'Trim top of sections',              enabled:false},
    {id:'trim-bottom',  label:'Trim bottom of sections',           enabled:false},
    {id:'trim-both',    label:'Trim both sides',                   enabled:false},
    {id:'post-caps',    label:'Post caps',                         enabled:false},
    {id:'lattice-top',  label:'Lattice top (1 ft)',                enabled:false},
    {id:'kickboard',    label:'Kickboard / rot board (bottom)',    enabled:false},
    {id:'arbour',       label:'Arbour / decorative header on gate',enabled:false},
    {id:'cleanup',      label:'Site cleanup included',             enabled:false},
  ];
}

function getDefaultDeckFeatures() {
  return [
    {id:'lighting', label:'Low-voltage deck lighting',     enabled:false},
    {id:'bench',    label:'Built-in bench seating',        enabled:false},
    {id:'planters', label:'Built-in planter boxes',        enabled:false},
    {id:'pergola',  label:'Pergola / shade structure',     enabled:false},
    {id:'privacy',  label:'Privacy screen panels',         enabled:false},
    {id:'cleanup',  label:'Site cleanup included',         enabled:false},
  ];
}

function wizStep_(id, min, max, dir) {
  let val = (wizAnswers[id] !== undefined ? wizAnswers[id] : 0) + dir;
  val = Math.max(min, Math.min(max, val));
  wizAnswers[id] = val;
  const el = document.getElementById('step-val-'+id);
  if (el) el.textContent = val;
}

function wizReset() {
  if (!confirm('Start the wizard over? Your answers will be cleared.')) return;
  wizStep = 0; wizAnswers = {}; matItems = []; wizMatWarningDismissed = false;
  wizRender();
}

function findMatConfigMatch(matName, cfg) {
  const name = normalizeName(matName);
  for (const item of cfg) {
    if (!item.cost || item.cost <= 0) continue;
    const cfgName = normalizeName(item.name);
    if (name.includes(cfgName) || cfgName.includes(name)) return item;
    const keywords = cfgName.replace(/[()"\/,]/g,' ').split(' ').filter(w=>w.length>3).slice(0,3);
    if (keywords.length > 0 && keywords.every(kw=>name.includes(kw))) return item;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// WIZARD RESULTS
// ═══════════════════════════════════════════════════════════════
function wizShowResults() {
  const a = wizAnswers;
  const type = a.projType || 'Fence';
  matItems = calcMaterials(a);

  const cfg = loadMatConfig();
  let missingCount = 0;

  matItems.forEach(m => {
    if (!m.unitCost || m.unitCost === 0) {
      const match = findMatConfigMatch(m.name, cfg);
      if (match) m.unitCost = match.cost;
    }
    if (!m.unitCost || m.unitCost === 0) missingCount++;
  });

  const matRows = matItems.map((m,i) => `
    <tr class="mat-row">
      <td>${m.name}</td>
      <td><input type="number" class="mat-price-input" style="width:70px;text-align:center;" value="${m.qty}" min="0"
        oninput="matItems[${i}].qty=parseFloat(this.value)||0;updateMatTotals()" id="mat-qty-${i}"></td>
      <td style="text-align:center;">${m.unit}</td>
      <td><input class="mat-price-input" type="number" placeholder="0.00" value="${m.unitCost||''}"
        oninput="matItems[${i}].unitCost=parseFloat(this.value)||0;updateMatTotals()" id="mat-cost-${i}"></td>
      <td class="mat-line-total" id="mat-total-${i}">${m.unitCost ? fmt(m.qty*(parseFloat(m.unitCost)||0)) : '—'}</td>
      <td style="font-size:10px;color:var(--muted);">${m.note||''}</td>
    </tr>`).join('');

  let titleParts = [];
  if (type !== 'Deck')  titleParts.push(`${a.linearFt||0} LF ${a.fenceStyle||'fence'}`);
  if (type !== 'Fence') {
    const sf = (parseFloat(a.deckLength)||0) * (parseFloat(a.deckWidth)||0);
    titleParts.push(`${sf} sqft ${a.deckMaterial||'deck'}`);
  }
  const wizTitle = `${a.clientName||'Quote'} — ${titleParts.join(' + ')}`;

  let labourEst = 0;
  let labourRows = '';
  if (type !== 'Deck') {
    const lf = a.linearFt || 0;
    const gates = a.gates || 0;
    const lfRate   = parseFloat(document.getElementById('rate-lf').value)   || 0;
    const gateRate = parseFloat(document.getElementById('rate-gate').value) || 0;
    const fenceLabour = lf * lfRate + gates * gateRate;
    if (fenceLabour > 0) {
      labourEst += fenceLabour;
      labourRows += `<tr class="mat-total-row"><td colspan="4">Fence Labour (from your rates)</td><td class="mat-line-total">${fmt(fenceLabour)}</td><td style="font-size:10px;color:var(--muted);">Based on saved rates</td></tr>`;
    }
  }
  if (type !== 'Fence') {
    const sqft = (parseFloat(a.deckLength)||0) * (parseFloat(a.deckWidth)||0);
    const stairs = a.deckStairs || 0;
    const deckSfRate  = parseFloat(document.getElementById('rate-deck-sf').value) || 0;
    const stairRate   = parseFloat(document.getElementById('rate-stair').value)   || 0;
    const footingRate = parseFloat(document.getElementById('rate-footing').value) || 0;
    const dL = parseFloat(a.deckLength)||0, dW = parseFloat(a.deckWidth)||0;
    const deckPosts = (Math.max(1, Math.ceil(dL/8))) * (Math.ceil(dW/8)+1);
    const deckLabour = sqft * deckSfRate + stairs * stairRate + deckPosts * footingRate;
    if (deckLabour > 0) {
      labourEst += deckLabour;
      labourRows += `<tr class="mat-total-row"><td colspan="4">Deck Labour (from your rates)</td><td class="mat-line-total">${fmt(deckLabour)}</td><td style="font-size:10px;color:var(--muted);">Based on saved rates</td></tr>`;
    }
  }

  let missingWarningHtml = '';
  if (missingCount > 0) {
    missingWarningHtml = `
      <div id="wiz-mat-save-banner" style="background:#fff3cd;color:#856404;border:1px solid #ffc107;border-radius:8px;padding:12px;margin-bottom:16px;font-size:12px;line-height:1.5;">
        <strong>⚠️ ${missingCount} item(s) missing prices</strong><br>
        Enter your supplier costs in the table below to fix the grand total.
        <div style="margin-top:10px;">
          <button class="btn btn-outline" style="background:#fff;border-color:#856404;color:#856404;padding:6px 12px;font-size:11px;font-weight:600;" onclick="wizSavePricesToConfig()">
            💾 Save typed prices to Global Config
          </button>
        </div>
      </div>
    `;
  }

  document.getElementById('wiz-body').innerHTML = `
    <div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <span style="font-family:'Playfair Display',serif;font-size:16px;font-weight:600;color:var(--navy);">
        📋 ${esc(wizTitle)}
      </span>
      <button class="btn btn-outline" style="background:var(--pale);color:var(--navy);border-color:var(--border);font-size:11px;" onclick="wizReset()">← Redo Interview</button>
    </div>

    <div class="wiz-progress-bar" style="margin-bottom:16px;"><div class="wiz-progress-fill" style="width:100%"></div></div>

    ${missingWarningHtml}

    <p class="hint" style="margin-bottom:10px;">Enter your current supplier prices below. Line totals calculate automatically.</p>
    <div style="overflow-x:auto;">
      <table class="mat-table">
        <thead><tr><th>Material</th><th>Qty</th><th>Unit</th><th>Unit Cost ($)</th><th>Line Total</th><th>Notes</th></tr></thead>
        <tbody>${matRows}</tbody>
        <tfoot>
          <tr class="mat-total-row">
            <td colspan="4"><strong>Material Subtotal</strong></td>
            <td class="mat-line-total" id="mat-grand-total">—</td>
            <td></td>
          </tr>
          ${labourRows}
        </tfoot>
      </table>
    </div>

    <div class="quote-result" id="quote-result-block" style="margin-top:14px;">
      <div class="quote-result-title">💰 Choose Your Quote Amount</div>
      <p style="font-size:11px;color:#7A9CC8;margin-bottom:10px;">Tap a card to select — then tap Use This Quote below.</p>
      <div class="quote-range">
        <div class="quote-range-item" id="qr-low" onclick="selectQuoteRange('low')" style="cursor:pointer;transition:all .15s;">
          <div class="quote-range-label">Conservative</div>
          <div class="quote-range-val" id="q-low">—</div>
          <div style="font-size:10px;margin-top:3px;opacity:.8;">−10%</div>
        </div>
        <div class="quote-range-item mid" id="qr-mid" onclick="selectQuoteRange('mid')" style="cursor:pointer;transition:all .15s;outline:2px solid var(--gold);">
          <div class="quote-range-label">✓ Standard</div>
          <div class="quote-range-val" id="q-mid">—</div>
          <div style="font-size:10px;margin-top:3px;opacity:.8;">Most common</div>
        </div>
        <div class="quote-range-item" id="qr-high" onclick="selectQuoteRange('high')" style="cursor:pointer;transition:all .15s;">
          <div class="quote-range-label">With Buffer</div>
          <div class="quote-range-val" id="q-high">—</div>
          <div style="font-size:10px;margin-top:3px;opacity:.8;">+10%</div>
        </div>
      </div>
    </div>

    <div style="margin-top:10px;padding:10px 13px;background:var(--pale);border-radius:8px;border-left:3px solid var(--gold);font-size:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
      <span>⚙️ <strong>Labour rates not set yet?</strong> That's why the totals show —</span>
      <button class="btn btn-outline" style="font-size:11px;padding:4px 10px;white-space:nowrap;" onclick="closePreviewModal();navTo('sec-rates')">Set Rates →</button>
    </div>

    <div class="share-panel" style="margin-top:12px;">
      <div class="share-panel-title">📤 What do you want to do?</div>
      <div class="share-btns">
        <button class="btn btn-green btn-full" onclick="wizUseQuote()">✅ Use This Quote → Fill Contract</button>
        <button class="btn btn-navy btn-full" onclick="wizShare()">💾 Save Project File</button>
        <button class="btn btn-outline" style="color:var(--navy);border-color:var(--border);background:var(--pale);" onclick="wizCopyText()">📋 Copy to Clipboard</button>
        <button class="btn btn-gold btn-full" onclick="printDoc()">🖨 Print Quote</button>
      </div>
    </div>
  `;

  updateMatTotals();
}

function selectQuoteRange(range) {
  selectedQuoteRange = range;
  ['low','mid','high'].forEach(r => {
    const card = document.getElementById('qr-' + r);
    if (!card) return;
    card.style.outline = r === range ? '2px solid var(--gold)' : '2px solid transparent';
    card.style.opacity  = r === range ? '1' : '0.65';
    const lbl = card.querySelector('.quote-range-label');
    if (lbl) lbl.textContent = r === range ? '✓ ' + {low:'Conservative',mid:'Standard',high:'With Buffer'}[r] : {low:'Conservative',mid:'Standard',high:'With Buffer'}[r];
  });
}

function updateMatTotals() {
  let grand = 0;
  matItems.forEach((m,i) => {
    const cost = parseFloat(m.unitCost) || 0;
    const total = m.qty * cost;
    const el = document.getElementById('mat-total-'+i);
    if (el) el.textContent = cost > 0 ? fmt(total) : '—';
    grand += total;
  });
  const grandEl = document.getElementById('mat-grand-total');
  if (grandEl) grandEl.textContent = grand > 0 ? fmt(grand) : '—';

  const a = wizAnswers;
  const type = a.projType || 'Fence';
  let labour = 0;
  if (type !== 'Deck') {
    const lf = a.linearFt || 0;
    const gates = a.gates || 0;
    labour += lf * (parseFloat(document.getElementById('rate-lf').value)||0);
    labour += gates * (parseFloat(document.getElementById('rate-gate').value)||0);
  }
  if (type !== 'Fence') {
    const sqft = (parseFloat(a.deckLength)||0) * (parseFloat(a.deckWidth)||0);
    const stairs = a.deckStairs || 0;
    labour += sqft  * (parseFloat(document.getElementById('rate-deck-sf').value)||0);
    labour += stairs * (parseFloat(document.getElementById('rate-stair').value)||0);
    const dL = parseFloat(a.deckLength)||0, dW = parseFloat(a.deckWidth)||0;
    const deckPosts = (Math.max(1, Math.ceil(dL/8))) * (Math.ceil(dW/8)+1);
    labour += deckPosts * (parseFloat(document.getElementById('rate-footing').value)||0);
  }
  const combined = grand + labour;

  const qLow = document.getElementById('q-low');
  const qMid = document.getElementById('q-mid');
  const qHigh = document.getElementById('q-high');
  if (qLow)  qLow.textContent  = combined > 0 ? fmt(combined * 0.90) : '—';
  if (qMid)  qMid.textContent  = combined > 0 ? fmt(combined)        : '—';
  if (qHigh) qHigh.textContent = combined > 0 ? fmt(combined * 1.10) : '—';
}

function wizUseQuote() {
  const a = wizAnswers;
  const type = a.projType || 'Fence';
  const projType = type === 'Deck' ? 'deck' : type === 'Fence & Deck' ? 'both' : 'fence';
  const projLabel = projType === 'deck' ? '— Deck Project' : projType === 'both' ? '— Fence & Deck Project' : '— Fence Project';

  if (a.clientName) document.getElementById('proj-name').value = a.clientName + ' ' + projLabel;
  if (a.clientAddress) document.getElementById('proj-address').value = a.clientAddress;
  document.getElementById('proj-type').value = projType;

  clients = [];
  if (a.clientName) addClient(a.clientName, a.clientAddress || '', '');

  scopeItems = [];

  if (projType !== 'deck') {
    const lf = a.linearFt || 0;
    const gates = a.gates || 0;
    const posts = Math.ceil(lf / (a.postSpacing||8)) + 1 + (a.cornerPosts||0) + gates*2;
    const lfRate   = parseFloat(document.getElementById('rate-lf').value)     || 0;
    const matRate  = parseFloat(document.getElementById('rate-mat-lf').value) || 0;
    const postRate = parseFloat(document.getElementById('rate-post').value)   || 0;
    const gateRate = parseFloat(document.getElementById('rate-gate').value)   || 0;

    scopeItems.push({ cat:'Fence', name:`${a.fenceStyle||'Fence'} — ${lf} linear ft`, unit:'linear ft', qty:lf, price:lfRate, checked:true, custom:false, id:'w1', rateKey:'lf' });
    scopeItems.push({ cat:'Materials', name:'Fence materials', unit:'linear ft', qty:lf, price:matRate, checked:true, custom:false, id:'w2', rateKey:'mat-lf' });
    scopeItems.push({ cat:'Posts', name:`${a.postSize||'5×5'} post installation`, unit:'each', qty:posts, price:postRate, checked:true, custom:false, id:'w3', rateKey:'post' });
    if (gates > 0) scopeItems.push({ cat:'Gates', name:`Gate installation (×${gates})`, unit:'each', qty:gates, price:gateRate, checked:true, custom:false, id:'w4', rateKey:'gate' });
  }

  if (projType !== 'fence') {
    const dL = parseFloat(a.deckLength) || 0;
    const dW = parseFloat(a.deckWidth)  || 0;
    const sqft = dL * dW;
    const perimeter = 2 * (dL + dW);
    const stairs = a.deckStairs || 0;
    const stairW = parseFloat(a.stairWidth) || 4;
    const railStyle = a.deckRailings || 'None';
    const deckSfRate  = parseFloat(document.getElementById('rate-deck-sf').value) || 0;
    const railRate    = parseFloat(document.getElementById('rate-rail').value)    || 0;
    const stairRate   = parseFloat(document.getElementById('rate-stair').value)   || 0;
    const footingRate = parseFloat(document.getElementById('rate-footing').value) || 0;
    const deckPosts   = (Math.max(1, Math.ceil(dL/8))) * (Math.ceil(dW/8)+1);

    if (sqft > 0) scopeItems.push({ cat:'Deck', name:`${a.deckMaterial||'PT'} deck (${dL}×${dW} ft — ${sqft} sqft)`, unit:'sq ft', qty:sqft, price:deckSfRate, checked:true, custom:false, id:'d1', rateKey:'deck-sf' });
    if (railStyle !== 'None') {
      const railLF = Math.max(0, perimeter - stairs * (stairW + 2));
      scopeItems.push({ cat:'Railings', name:`${railStyle} railing`, unit:'linear ft', qty:railLF, price:railRate, checked:true, custom:false, id:'d2', rateKey:'rail' });
    }
    if (stairs > 0) scopeItems.push({ cat:'Stairs', name:`Stair construction (${stairs} flight${stairs>1?'s':''})`, unit:'each', qty:stairs, price:stairRate, checked:true, custom:false, id:'d3', rateKey:'stair' });
    if (deckPosts > 0) scopeItems.push({ cat:'Foundation', name:`Post footings (${deckPosts} posts)`, unit:'each', qty:deckPosts, price:footingRate, checked:true, custom:false, id:'d4', rateKey:'footing' });
  }

  const matTotal = matItems.reduce((s,m) => s + (m.qty||0) * (parseFloat(m.unitCost)||0), 0);
  let labourTotal = 0;
  if (projType !== 'deck') {
    labourTotal += (a.linearFt||0) * (parseFloat(document.getElementById('rate-lf').value)||0);
    labourTotal += (a.gates||0)    * (parseFloat(document.getElementById('rate-gate').value)||0);
  }
  if (projType !== 'fence') {
    const sqft = (parseFloat(a.deckLength)||0) * (parseFloat(a.deckWidth)||0);
    labourTotal += sqft * (parseFloat(document.getElementById('rate-deck-sf').value)||0);
    labourTotal += (a.deckStairs||0) * (parseFloat(document.getElementById('rate-stair').value)||0);
  }
  const combinedTotal = matTotal + labourTotal;
  const rangeMultiplier = selectedQuoteRange === 'low' ? 0.9 : selectedQuoteRange === 'high' ? 1.1 : 1.0;
  if (combinedTotal > 0) document.getElementById('pay-override').value = (combinedTotal * rangeMultiplier).toFixed(2);

  renderClients(); renderScope(); renderStages(); update(); expandProjectSections();
  // Show a non-blocking toast instead of alert
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#2D7D52;color:#fff;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.3);transition:opacity .4s;pointer-events:none;';
  toast.textContent = combinedTotal > 0 ? `✅ Quote loaded! Total set to ${fmt(combinedTotal * rangeMultiplier)}` : '✅ Quote loaded into scope!';
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3000);
  document.getElementById('sec-project').scrollIntoView({ behavior:'smooth' });
}

function wizShare() {
  const data = buildSaveData();
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const projSlug = (wizAnswers.projType||'fence').toLowerCase().replace(/\s+&\s+/g,'-').replace(/\s+/g,'-');
  const fileName = `${(wizAnswers.clientName||'quote').replace(/\s+/g,'-')}-${projSlug}.json`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

function wizCopyText() {
  const a = wizAnswers;
  const type = a.projType || 'Fence';
  const lf = a.linearFt||0;
  const gates = a.gates||0;
  const deckSf = (parseFloat(a.deckLength)||0) * (parseFloat(a.deckWidth)||0);

  let labour = 0;
  if (type !== 'Deck') {
    labour += lf * (parseFloat(document.getElementById('rate-lf').value)||0);
    labour += gates * (parseFloat(document.getElementById('rate-gate').value)||0);
  }
  if (type !== 'Fence') {
    labour += deckSf * (parseFloat(document.getElementById('rate-deck-sf').value)||0);
    labour += (a.deckStairs||0) * (parseFloat(document.getElementById('rate-stair').value)||0);
  }
  const matTotal = matItems.reduce((s,m) => s+(m.qty*(parseFloat(m.unitCost)||0)),0);
  const mid = labour + matTotal;

  let text = `${type.toUpperCase()} QUOTE — ${new Date().toLocaleDateString('en-CA')}\n`;
  text += `Client: ${a.clientName||'—'}\nAddress: ${a.clientAddress||'—'}\n`;
  if (type !== 'Deck')  text += `Fence: ${a.fenceStyle||'—'} — ${lf} LF, ${gates} gate(s)\n`;
  if (type !== 'Fence') text += `Deck: ${deckSf} sqft ${a.deckMaterial||''} — ${a.deckHeight||''} — Railings: ${a.deckRailings||'None'} — Stairs: ${a.deckStairs||0} flight(s)\n`;
  text += `\nMATERIAL LIST:\n`;
  matItems.forEach(m => { text += `  ${m.name}: ${m.qty} ${m.unit}${m.unitCost?' @ $'+m.unitCost+' = '+fmt(m.qty*(parseFloat(m.unitCost)||0)):''}\n`; });
  text += `\nQUOTE RANGE:\n  Low: ${fmt(mid*0.9)}\n  Mid: ${fmt(mid)}\n  High: ${fmt(mid*1.1)}\n`;
  text += `\nGenerated by ContractForge v2.8`;
  navigator.clipboard.writeText(text).then(() => alert('✅ Copied to clipboard!')).catch(() => alert('Could not copy. Try saving instead.'));
}

function wizSavePricesToConfig() {
  const cfg = loadMatConfig();
  let added = 0;
  let updated = 0;

  matItems.forEach((m, i) => {
    const costInput = document.getElementById('mat-cost-' + i);
    const currentCost = costInput ? parseFloat(costInput.value) || 0 : (m.unitCost || 0);

    if (currentCost > 0) {
      const match = findMatConfigMatch(m.name, cfg);
      if (match) {
        if (match.cost !== currentCost) {
          match.cost = currentCost;
          updated++;
        }
      } else {
        cfg.push({
          id: 'mc-' + Date.now() + '-' + i,
          name: m.name,
          unit: m.unit.split('(')[0].trim(),
          cost: currentCost
        });
        added++;
      }
    }
  });

  if (added > 0 || updated > 0) {
    saveMatConfig(cfg);
    if (typeof renderMatConfig === 'function') renderMatConfig();
    
    const warningDiv = document.getElementById('wiz-mat-save-banner');
    if (warningDiv) warningDiv.style.display = 'none';
    
    alert(`✅ Global config updated!\nAdded ${added} new items and updated ${updated} existing prices.`);
  } else {
    alert('No new prices to save. Make sure you entered costs greater than 0.');
  }
}