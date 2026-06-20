const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');

// The section is enclosed in:
// <!-- Así se ven nuestros entregables -->
// <div class="solutions-mockup reveal-up">
// ...
// </div>
// Let's use a regex to remove it
const regex = /<!-- Así se ven nuestros entregables -->[\s\S]*?<div class="solutions-mockup[\s\S]*?<\/div>\s*<\/div>/g;

if (regex.test(indexHtml)) {
  indexHtml = indexHtml.replace(regex, '');
  fs.writeFileSync('index.html', indexHtml, 'utf8');
  console.log('Removed mockup section from index.html');
} else {
  console.log('Mockup section not found');
}
