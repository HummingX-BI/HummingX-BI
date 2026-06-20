const fs = require('fs');

let cssPath = 'css/style.css';
let content = fs.readFileSync(cssPath, 'utf8');

if (!content.includes('.legal-page')) {
  content += `\n
/* ================================================================
   PÁGINAS LEGALES
   ================================================================ */
.legal-page {
  padding-top: var(--space-32);
  padding-bottom: var(--space-20);
  max-width: 720px;
  margin: 0 auto;
  color: var(--color-text-primary);
  background: var(--color-bg-elevated);
}

.legal-page h1 {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  margin-bottom: var(--space-4);
  color: var(--color-gold);
}

.legal-page .legal-date {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-12);
  display: block;
}

.legal-page h2 {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  margin-top: var(--space-10);
  margin-bottom: var(--space-4);
  color: var(--color-text-primary);
}

.legal-page p {
  font-size: var(--text-base);
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}

.legal-page ul {
  margin-bottom: var(--space-6);
  padding-left: var(--space-6);
}

.legal-page li {
  font-size: var(--text-base);
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.legal-page strong {
  color: var(--color-text-primary);
  font-weight: 600;
}
`;
  fs.writeFileSync(cssPath, content, 'utf8');
  console.log('Added .legal-page styles to style.css');
}
