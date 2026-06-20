const fs = require('fs');
let c = fs.readFileSync('css/components.css', 'utf8');

const mobileServices = `

/* == Services mobile: horizontal scroll tab bar == */
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
    padding: 12px 14px !important;
    font-size: 0.8125rem !important;
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
    padding: 20px 16px !important;
  }
}
`;

fs.writeFileSync('css/components.css', c + mobileServices);
console.log('Appended services mobile styles');
