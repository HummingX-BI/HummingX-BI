const fs = require('fs');

let cssPath = 'css/components.css';
let content = fs.readFileSync(cssPath, 'utf8');

content = content.replace(
  /\.mobile-menu \{\s+background: rgba\(10, 10, 12, 0\.97\);\s+backdrop-filter: blur\(20px\);\s+-webkit-backdrop-filter: blur\(20px\);\s+\}/,
  `.mobile-menu {
    background: rgba(255, 255, 255, 0.97);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }`
);

fs.writeFileSync(cssPath, content, 'utf8');
console.log('Fixed mobile-menu background color.');
