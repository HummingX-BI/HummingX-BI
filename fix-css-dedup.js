const fs = require('fs');

// Read and rewrite the entire team + projects section cleanly
let css = fs.readFileSync('css/components.css', 'utf8');

// Find the corrupt section start
const badStart = '.projects-showcase__heading {\n  font-size: var(--text-2xl);\n  font-family: var(--font-heading);\n  font-weight: 600;\n  margin-bottom: var(--space-8);\n  text-align: center;\n\n\n.projects-showcase {';

// Find the end of the bad section (after the second .projects-showcase__heading block)
const cleanEnd = '\n\n.projects-grid { {\n  display: flex;\n  gap: var(--space-6);\n  /* Scroll-snap settings */\n}';

const replacement = `.projects-showcase__heading {
  font-size: var(--text-2xl);
  font-family: var(--font-heading);
  font-weight: 600;
  margin-bottom: var(--space-8);
  text-align: center;
}

.projects-grid {
  display: flex;
  gap: var(--space-6);
  /* Scroll-snap settings */
}`;

if (css.includes(badStart)) {
  const startIdx = css.indexOf(badStart);
  const endOfBad = css.indexOf(cleanEnd);
  if (endOfBad > startIdx) {
    css = css.substring(0, startIdx) + replacement + css.substring(endOfBad + cleanEnd.length);
    console.log('Fixed duplicate projects-showcase block');
  } else {
    console.log('Could not find end of bad block, end idx:', endOfBad);
  }
} else {
  console.log('Bad block not found as expected');
  // Fallback: fix .projects-grid { { double brace  
  css = css.replace('.projects-grid { {', '.projects-grid {');
  // Remove duplicate projects-showcase sections
  const firstOccurrence = css.indexOf('.projects-showcase {');
  const secondOccurrence = css.indexOf('.projects-showcase {', firstOccurrence + 20);
  if (secondOccurrence > firstOccurrence) {
    // Delete from second occurrence back to a newline before it
    const deleteFrom = css.lastIndexOf('\n\n', secondOccurrence);
    const projectsHeadingEnd = css.indexOf('.projects-grid {', secondOccurrence);
    css = css.substring(0, deleteFrom) + '\n\n' + css.substring(projectsHeadingEnd);
    console.log('Removed duplicate via fallback');
  }
}

fs.writeFileSync('css/components.css', css, 'utf8');
console.log('Done.');
