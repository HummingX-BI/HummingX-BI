const fs = require('fs');
let css = fs.readFileSync('css/components.css', 'utf8');

// Add services mobile styles before the PROCESO section
const processMark = '/* ================================================================\n   2. PROCESO (Metodología)';
if (!css.includes('service-tab.active::before {\\n    /* Reset the left bar on mobile */')) {
  const mobileServices = `/* ── Services mobile: horizontal scroll tab bar ─────────────── */
@media (max-width: 767px) {
  .services-master-detail {
    grid-template-columns: 1fr !important;
  }

  .services-master {
    border-right: none !important;
    border-bottom: 1px solid var(--color-border);
    flex-direction: row !important;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .services-master::-webkit-scrollbar { display: none; }

  .service-tab {
    flex: 0 0 auto;
    white-space: nowrap;
    padding: var(--space-3) var(--space-4) !important;
    font-size: var(--text-sm) !important;
    border-bottom: 2px solid transparent;
    border-right: none;
    min-height: 48px;
  }

  .service-tab.active {
    border-bottom: 2px solid var(--color-gold) !important;
    background: transparent !important;
  }

  .service-tab.active::before { display: none !important; }

  .services-detail {
    padding: var(--space-5) var(--space-4) !important;
  }
}

`;
  css = css.replace(processMark, mobileServices + processMark);
  fs.writeFileSync('css/components.css', css, 'utf8');
  console.log('Added services mobile styles.');
} else {
  console.log('Services mobile styles already present.');
}
