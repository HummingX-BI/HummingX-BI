const fs = require('fs');

let css = fs.readFileSync('css/components.css', 'utf8');

// 1. Fix the broken .team-profile:hover block — orphaned properties after it
// The broken block: after .team-profile:hover closing }, there's dangling:
//   font-weight: 600; margin-bottom: var(--space-8); text-align: center; }
// We need to replace that with proper team-profile__icon, title, desc, projects-showcase

const badBlock = `.team-profile:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-sm);
}

  font-weight: 600;
  margin-bottom: var(--space-8);
  text-align: center;
}

.projects-grid {`;

const fixedBlock = `.team-profile:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-sm);
}

.team-profile__icon {
  font-size: 2rem;
  margin-bottom: var(--space-4);
  color: var(--color-gold);
}

.team-profile__title {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.team-profile__desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* ── Mobile: Full-width team cards with generous padding ──────── */
@media (max-width: 767px) {
  .team-profiles {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .team-profile {
    padding: var(--space-6);
    border-radius: var(--radius-xl);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  .team-profile__title {
    font-size: var(--text-base);
    line-height: 1.3;
  }

  .team-profile__desc {
    font-size: var(--text-sm);
    line-height: 1.65;
  }
}

/* --- Proyectos Grid --- */
.projects-showcase {
  margin-top: var(--space-16);
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-12);
}

.projects-showcase__heading {
  font-size: var(--text-2xl);
  font-family: var(--font-heading);
  font-weight: 600;
  margin-bottom: var(--space-8);
  text-align: center;
}

.projects-grid {`;

if (css.includes(badBlock)) {
  css = css.replace(badBlock, fixedBlock);
  console.log('Fixed team-profile CSS block');
} else {
  // Try a simpler approach - just find and fix the orphaned block
  const orphanedPattern = /\.team-profile:hover \{\s+transform: translateY\(-4px\);\s+box-shadow: var\(--shadow-sm\);\s+\}\s+font-weight: 600;\s+margin-bottom: var\(--space-8\);\s+text-align: center;\s+\}\s+\.projects-grid/;
  if (orphanedPattern.test(css)) {
    css = css.replace(orphanedPattern, fixedBlock.replace('}\n\n.projects-grid {', '').trim() + '\n\n.projects-grid {'.replace('\n.projects-grid', '\n\n.projects-showcase {\n  margin-top: var(--space-16);\n  border-top: 1px solid var(--color-border);\n  padding-top: var(--space-12);\n}\n\n.projects-showcase__heading {\n  font-size: var(--text-2xl);\n  font-family: var(--font-heading);\n  font-weight: 600;\n  margin-bottom: var(--space-8);\n  text-align: center;\n}\n\n.projects-grid'));
    console.log('Fixed with regex pattern');
  } else {
    console.log('Pattern not found, showing context:');
    const idx = css.indexOf('box-shadow: var(--shadow-sm);\n}');
    console.log(css.substring(idx - 5, idx + 200));
  }
}

// 2. Also improve project card area badge and mobile project cards
if (!css.includes('@media (max-width: 767px) {\n  .project-card')) {
  // Add before the carousel wrapper section
  const carouselComment = '/* --- Carrusel Wrapper (Soluciones y Proyectos) --- */';
  const mobileProjectCards = `/* ── Mobile: Project cards full-width ─────────────────────────── */
@media (max-width: 767px) {
  .project-card {
    min-width: calc(100vw - 48px);
    flex: 0 0 calc(100vw - 48px);
    padding: var(--space-6);
    border-radius: var(--radius-xl);
  }

  .project-card__area {
    font-size: 0.6rem;
    letter-spacing: 0.08em;
    padding: 3px 8px;
    /* Border-styled badge for higher perceived quality */
    border: 1px solid rgba(0, 229, 160, 0.3);
    background: rgba(0, 229, 160, 0.07);
  }

  .project-card__title {
    font-size: var(--text-base);
    line-height: 1.3;
  }
}

${carouselComment}`;
  css = css.replace(carouselComment, mobileProjectCards);
  console.log('Added mobile project card styles');
}

// 3. Services mobile accordion — on mobile, convert master-detail to accordion
const servicesResponsive = `
/* ── Services mobile accordion ────────────────────────────────── */
@media (max-width: 767px) {
  .services-master-detail {
    grid-template-columns: 1fr;
    /* On mobile: no side-by-side layout */
  }

  .services-master {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0;
  }

  .services-master::-webkit-scrollbar {
    display: none;
  }

  .service-tab {
    flex: 0 0 auto;
    white-space: nowrap;
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-sm);
    border-bottom: 2px solid transparent;
    border-right: none;
    border-left: none;
    min-height: 48px; /* Touch target */
  }

  .service-tab.active {
    border-bottom-color: var(--color-gold);
    border-bottom-width: 2px;
  }

  .service-tab.active::before {
    /* Reset the left bar on mobile */
    display: none;
  }

  .services-detail {
    padding: var(--space-6) var(--space-4);
  }
}
`;

if (!css.includes('Services mobile accordion')) {
  // Append before the process section
  const processComment = '/* ================================================================\n   2. PROCESO (Metodología)';
  css = css.replace(processComment, servicesResponsive + '\n\n' + processComment);
  console.log('Added services mobile accordion styles');
}

fs.writeFileSync('css/components.css', css, 'utf8');
console.log('\nAll CSS fixes applied successfully.');
