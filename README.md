# ContractForge

A free, offline-capable PWA for fence and deck contractors to generate professional quotes and contracts — no subscriptions, no accounts, no cloud required.

**Live tool:** https://kamaflage.github.io/contractforge/

---

## Features

- **Smart Wizard** — answer a few questions about the job (fence, deck, or both) and get a material list + labour estimate in seconds
- **Quote → Contract** — flip between quote mode and contract mode with one click; auto-fills client name, date, and scope
- **Low / Mid / High pricing** — choose your confidence level before locking in a number
- **Scope builder** — line items auto-populate from the wizard; add, remove, or adjust anything manually
- **Payment stages** — configurable deposit/progress/completion splits
- **Multi-client support** — add co-signers or multiple client names
- **Print-ready documents** — clean single-page PDF output for quotes, contracts, and material receipts
- **Save & load** — export projects as JSON files; reload them on any device
- **Works offline** — full PWA with service worker caching; install to your phone's home screen

---

## Getting Started

No installation needed. Open the live link above, then:

1. **Set your company info** — name, address, phone, email, logo
2. **Set your labour rates** — per linear foot, per post, per square foot, etc.
3. **Run the Wizard** — pick Fence, Deck, or Fence & Deck and answer the prompts
4. **Review the estimate** — choose Low, Mid, or High, then click "Use This Quote → Fill Contract"
5. **Print or save** — use the Preview button to generate a PDF or save the project file

Click **📖 How To Use** at the top of the page for the full interactive guide.

---

## Files

```
index.html          Main app shell + all CSS
sw.js               Service worker (offline caching)
manifest.json       PWA manifest
icon-192.png        App icon
icon-512.png        App icon (large)
js/
  cf-state.js       Global variables and shared helpers
  cf-wizard.js      Estimate wizard (fence + deck) and material calculators
  cf-scope.js       Scope table: add/remove/render line items
  cf-pricing.js     Stage payments and client split renderer
  cf-preview.js     Print preview and PDF generation
  cf-save-load.js   Save/load project JSON and company settings
  cf-ui.js          UI orchestration, nav, dark mode, init
DEVELOPER_GUIDE.md  Technical reference for developers
```

---

## Offline / PWA Install

- **Android:** tap the browser menu → "Add to Home Screen"
- **iPhone:** tap Share → "Add to Home Screen"
- **Desktop:** click the install icon in the address bar

Once installed, ContractForge works fully without an internet connection.

---

## License

Free to use. No warranty. Built for small contractors who just need a tool that works.
