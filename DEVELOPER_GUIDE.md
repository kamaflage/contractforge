# ContractForge — Developer Guide

**Version:** 2.8  
**Stack:** Vanilla JS, HTML/CSS, PWA (no build step, no framework, no npm)  
**Purpose:** Fence and deck contractor quoting tool — generates quotes, contracts, and payment receipts as printable PDFs.

---

## File Structure

```
contractforge/
├── index.html              ← App shell (all CSS inline, no JS logic)
├── manifest.json           ← PWA manifest
├── sw.js                   ← Service worker (cache-first PWA)
├── icon-192.png            ← PWA icon
├── icon-512.png            ← PWA icon
├── DEVELOPER_GUIDE.md      ← This file
└── js/
    ├── cf-state.js         ← Global state + utility functions (load first)
    ├── cf-pricing.js       ← Materials config, pricing merge logic
    ├── cf-scope.js         ← Scope items, clients, stages, rates, company
    ├── cf-wizard.js        ← Measurement wizard + material calculator
    ├── cf-preview.js       ← Print preview renderer (quote/contract/receipt)
    ├── cf-save-load.js     ← Save/load project JSON files
    └── cf-ui.js            ← UI wiring, init(), update() (load last)
```

**Script load order matters** — they must be loaded in the order above (see `<script>` tags near `</body>` in index.html). Each file depends on globals defined in earlier files.

---

## index.html

Contains:
- All CSS (inline `<style>` block) — no external stylesheet
- All HTML structure (sidebar, sections, modals)
- PWA `<meta>` tags and service worker registration in `<head>`
- Zero JS logic — only `<script src="js/cf-*.js">` tags at the bottom

**To add a new UI section:** add the HTML card in index.html, wire up any inputs, then add logic to the appropriate JS file.

**CSS variables (root theme):**
```css
--navy: #0d1b2e      /* dark background */
--gold: #C49A28      /* accent / buttons */
--ink: #1a1a2e       /* body text */
--muted: #6b7a99     /* secondary text */
--pale: #f4f6fb      /* light backgrounds */
```

---

## js/cf-state.js

**What it does:** Defines all global state variables and two utility functions shared by every other file.

**Key globals:**
```js
let mode = 'quote'           // current document mode: 'quote' | 'contract' | 'receipt'
let clients = []             // array of client objects: { id, name, address, amount }
let stages = []              // payment stages: { id, name, pct, paid }
let scopeItems = []          // scope line items: { id, name, cat, qty, price, unit, rateKey, checked, custom }
let matItems = []            // materials list from wizard: { name, qty, unit, unitCost }
let wizStep = 0              // current wizard step index
let wizAnswers = {}          // wizard answers keyed by step id
let logoData = null          // base64 data URL of company logo
let currentPreviewMode = 'quote'
let matDisplayMode = 'hidden' // 'hidden' | 'names' | 'costs'
```

**Utility functions:**
```js
fmt(n)    // formats a number as Canadian dollar string: "$1,234.56"
esc(s)    // HTML-escapes a string (XSS-safe for innerHTML use)
setMode(m) // sets global mode variable
```

**Rule:** Never store persistent data here. Use `localStorage` (prefixed `cf-`) via cf-scope.js or cf-ui.js.

---

## js/cf-pricing.js

**What it does:** Manages the materials configuration (name, unit, unit cost per material) and handles merging when a saved project file from another device has different pricing than the local config.

**Key functions:**

| Function | Purpose |
|---|---|
| `getDefaultMatConfig()` | Returns 18 default materials (lumber, hardware, concrete, etc.) |
| `loadMatConfig()` | Reads from `localStorage['cf-mat-config']`, falls back to defaults |
| `saveMatConfig()` | Saves current mat config to localStorage |
| `renderMatConfig()` | Renders the materials config table in the UI |
| `runPricingMerge(fileMats, fileRates)` | Merges pricing from a loaded JSON into local config — fast-path if local is blank, shows conflict modal otherwise |
| `showMergeModal(conflicts)` | Shows a modal for each pricing conflict (keep local vs use file) |
| `applyMergeChoices()` | Applies user's conflict resolution choices |

**Material object shape:**
```js
{ name: "2x6x16 Lumber", unit: "each", unitCost: 14.50 }
```

**To add a new default material:** edit `getDefaultMatConfig()` — add an entry to the returned array.

---

## js/cf-scope.js

**What it does:** Everything about what's in the project — scope items, clients, payment stages, rates, and company profile.

**Key functions:**

| Function | Purpose |
|---|---|
| `loadScopeDefaults()` | Populates `scopeItems` from FENCE_DEFAULTS or DECK_DEFAULTS based on `proj-type` select |
| `renderScope()` | Renders the scope checklist UI |
| `toggleScope(id)` | Checks/unchecks a scope item |
| `updateScopeItem(id, field, value)` | Updates qty or price on a scope item |
| `addCustomItem()` | Adds a blank custom scope line |
| `removeScope(id)` | Removes a scope item |
| `getScopeSubtotal()` | Returns sum of all checked scope items (qty × price) |
| `getProjectTotal()` | Returns subtotal + HST (if checked) |
| `addClient()` / `removeClient(id)` | Manage clients array |
| `renderClients()` | Renders client input rows |
| `addStage(name, pct, paid)` | Adds a payment stage |
| `removeStage(id)` | Removes a stage |
| `renderStages()` | Renders payment stages UI |
| `renderClientSplit()` | Renders the per-client payment breakdown |
| `getRate(rateKey)` | Reads a labour rate from the DOM inputs by key |
| `saveRates()` / `loadRates()` | Persist labour rates to localStorage |
| `saveCompany()` / `loadCompany()` | Persist company profile to localStorage |
| `updateHeader()` | Updates the top header bar with company name |
| `handleLogo(e)` / `showLogo(data)` / `removeLogo()` | Logo file management |

**rateKey system:** Scope items can store a `rateKey` (e.g. `'lf'`, `'post'`, `'gate'`) that maps to a DOM input. When a project is loaded, if `item.price === 0` and `item.rateKey` is set, `getRate(rateKey)` fills the price automatically. This is how rates saved in a project file propagate to scope items.

**rateKey → input ID map:**
```
lf      → #rate-lf        (linear foot install rate)
mat-lf  → #rate-mat-lf    (materials per linear foot)
gate    → #rate-gate       (gate install rate)
post    → #rate-post       (post rate)
deck-sf → #rate-deck-sf    (deck sq ft rate)
footing → #rate-footing    (footing rate)
rail    → #rate-rail       (railing rate)
stair   → #rate-stair      (stair rate)
```

**FENCE_DEFAULTS / DECK_DEFAULTS:** Arrays of scope item templates at the top of the file. To add a new default scope item, add an entry here. Shape:
```js
{ cat: 'Fence Style', name: 'Shadow box fence (6 ft)', qty: 0, unit: 'linear ft', price: 0, rateKey: 'lf' }
```

---

## js/cf-wizard.js

**What it does:** Step-by-step measurement wizard. Asks the user for fence dimensions, style, and features, then calculates a full materials list.

**Key functions:**

| Function | Purpose |
|---|---|
| `wizRender()` | Renders the current wizard step |
| `wizChoose(stepId, value)` | Records an answer and advances |
| `wizNext()` / `wizBack()` | Navigate steps |
| `wizReset()` | Clears all wizard answers |
| `calcMaterials(answers)` | Core calculator — takes wizard answers, returns array of material objects with qty |
| `findMatConfigMatch(name)` | Fuzzy-matches a material name to the local mat config (for unit costs) |
| `wizShowResults()` | Renders the materials results panel |
| `wizUseQuote()` | Pushes calculated matItems into the global state |
| `updateMatTotals()` | Recalculates mat totals after cost edits |

**WIZ_STEPS array:** Each step is:
```js
{ id: 'linearFt', label: 'Total linear feet of fence?', type: 'number' | 'choice', choices: [...] }
```
To add a wizard step, add an entry to `WIZ_STEPS` and handle the new `answers.yourStepId` in `calcMaterials()`.

---

## js/cf-preview.js

**What it does:** Renders the print preview for all three document modes.

**Entry point:** `openPreviewModal(mode)` — call with `'quote'`, `'contract'`, or `'receipt'`.

**Core function:** `renderPreviewInto(container, mode)`

- `mode === 'quote'` → Project Quote (parties, scope list, payment schedule, quote disclaimer)
- `mode === 'contract'` → Construction Contract (same as quote + Terms & Conditions + signature blocks)
- `mode === 'receipt'` → Payment Receipt Log (one receipt block per unpaid stage per client)

**Scope table behavior (quote/contract):**
- Lists only item descriptions (no per-line prices)
- Shows HST row if `#include-hst` is checked
- Shows TOTAL (grand total only)

**Materials display toggle:** Controlled by `matDisplayMode` global:
- `'hidden'` → materials section not shown in preview
- `'names'` → materials table with name/qty/unit only
- `'costs'` → materials table with full pricing

**To modify what appears in a printed document:** edit `renderPreviewInto()` in this file. The function builds a single HTML string and sets `container.innerHTML`.

---

## js/cf-save-load.js

**What it does:** Save project as JSON, load project from JSON, clear project.

**Key functions:**

| Function | Purpose |
|---|---|
| `buildSaveData()` | Collects all state (clients, stages, scopeItems, company, rates, matConfig, wizAnswers, matItems) into a plain object |
| `saveProject()` | Calls buildSaveData(), triggers browser download as `.json` |
| `loadProject()` | Triggers file picker |
| `handleLoad(e)` | Parses JSON, restores all state, handles legacy files (pre-v2.2 had no embedded company info) |
| `clearProject()` | Resets project fields only — keeps company profile and rates |

**Load order in handleLoad()** (critical — do not reorder):
1. Restore DOM field values (proj name, address, dates, etc.)
2. Restore array state (clients, stages, scopeItems, matItems, wizAnswers)
3. Apply company info (with confirm dialog)
4. Apply labour rates to DOM inputs
5. Fill scope item prices via rateKey for any item with price === 0
6. Call `runPricingMerge()` for material costs
7. Call render functions (wizRender, renderClients, renderScope, renderStages, update)

**Why step 4 must come before step 5:** `getRate(rateKey)` reads from DOM inputs. If rates aren't written to the DOM first, all rateKey lookups return 0.

---

## js/cf-ui.js

**What it does:** Wires up all event listeners, initializes the app on load, and provides the `update()` function that syncs all totals.

**Key functions:**

| Function | Purpose |
|---|---|
| `init()` | Runs on page load — loads saved company/rates/logo, renders defaults, attaches event listeners |
| `update()` | Call this after any state change — recalculates totals, re-renders stages and client split |
| `toggleDark()` | Toggles dark mode class + saves preference |
| `navTo(sectionId)` | Scrolls to a section |
| `toggleSection(id)` | Expands/collapses a card section |
| `initSectionStates()` | Restores collapsed/expanded state from localStorage |
| `openGuide()` / `closeGuide()` | Guide modal |

**`init()` is called at the bottom of cf-ui.js** — no `DOMContentLoaded` wrapper needed because all scripts are loaded just before `</body>`.

**When to call `update()`:** Any time a value that affects totals changes (scope qty/price, HST toggle, stage %, client amount). Most input event listeners already call it.

---

## sw.js — Service Worker

Cache name: `contractforge-v2.X` (bump the version number every time you deploy new JS/HTML).

**Important:** If you edit any JS file and deploy, you **must** bump `CACHE` in sw.js (e.g. `v2.8` → `v2.9`). Otherwise browsers will keep serving the old cached files and your changes won't appear.

```js
const CACHE = 'contractforge-v2.8'; // ← bump this on every deploy
```

Strategy: cache-first for all listed assets, network-first fallback, offline navigation falls back to index.html.

---

## manifest.json

```json
{
  "start_url": "https://kamaflage.github.io/contractforge/",
  "scope": "https://kamaflage.github.io/contractforge/",
  "theme_color": "#C49A28",
  "background_color": "#0d1b2e"
}
```

If the repo name or GitHub username changes, update `start_url` and `scope` here.

---

## localStorage Keys

All keys are prefixed `cf-` to avoid collisions:

| Key | Contents |
|---|---|
| `cf-company` | JSON object with name, rep, address, phone, email, website |
| `cf-logo` | Base64 data URL of company logo |
| `cf-rates` | JSON object with labour rate values (lf, gate, post, etc.) |
| `cf-mat-config` | JSON array of material config objects |
| `cf-dark` | `'1'` if dark mode is on |
| `cf-sections` | JSON object of section collapsed states |

---

## Common Modifications

### Add a new scope item to the defaults
In `cf-scope.js`, find `FENCE_DEFAULTS` or `DECK_DEFAULTS` and add:
```js
{ cat: 'Your Category', name: 'Item Name', qty: 0, unit: 'each', price: 0, rateKey: null }
```
Set `rateKey` to one of the rate keys above if the price should auto-populate from a rate input, otherwise leave `null` and set a fixed `price`.

### Add a new labour rate field
1. Add an `<input>` to index.html with id `rate-yourkey`
2. Add `yourkey: 'rate-yourkey'` to the `rfMap` object in `cf-save-load.js` → `handleLoad()`
3. Add `yourkey: document.getElementById('rate-yourkey').value||''` to `buildSaveData()` → `labourRates`
4. Use `rateKey: 'yourkey'` on any scope item that should pull from it

### Change what appears in the printed quote/contract
Edit `renderPreviewInto()` in `cf-preview.js`. The quote and contract share the same branch (`m !== 'receipt'`). Contract-only content is wrapped in `isContract ? ... : ...` ternaries.

### Add a new wizard step
1. Add an entry to `WIZ_STEPS` in `cf-wizard.js`
2. Handle `answers.yourStepId` inside `calcMaterials()`

### Change HST rate (currently 13%)
Search `cf-preview.js` and `cf-scope.js` for `0.13` — change both occurrences. Also update the label in the UI (index.html) and preview renderer.

### Deploy to GitHub Pages
1. Bump `CACHE` version in `sw.js`
2. Push all files to the `contractforge` repo on GitHub
3. In repo Settings → Pages → set source to `main` branch, `/ (root)`
4. App will be live at `https://kamaflage.github.io/contractforge/`

---

## Architecture Notes

- **No build step.** Edit files directly. Refresh browser. That's it.
- **No external JS dependencies.** Everything is vanilla JS.
- **Print CSS** is in the `<style>` block in index.html under `@media print`. The preview modal is what gets printed — the rest of the page is hidden.
- **The wizard doesn't modify scopeItems directly.** It produces `matItems` (materials list). The user clicks "Use for Quote" to merge wizard results into scope pricing.
- **Prices on scopeItems are computed at render time from rateKeys**, not stored permanently (unless you save the project after rates are entered). This is intentional — it means rates set in the Rates section always win for new projects.
