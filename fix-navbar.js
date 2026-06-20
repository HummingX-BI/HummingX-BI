const fs = require('fs');

let cssPath = 'css/components.css';
let content = fs.readFileSync(cssPath, 'utf8');

content = content.replace(
  /\.nav-header \{\s+background: rgba\(0, 0, 0, 0\.50\);\s+backdrop-filter: blur\(32px\) saturate\(180%\);\s+-webkit-backdrop-filter: blur\(32px\) saturate\(180%\);\s+\}/,
  `.nav-header {
    background: rgba(255, 255, 255, 0.70);
    backdrop-filter: blur(32px) saturate(180%);
    -webkit-backdrop-filter: blur(32px) saturate(180%);
  }`
);

content = content.replace(
  /\.nav-header\.scrolled \{\s+background: rgba\(10, 10, 12, 0\.92\);\s+backdrop-filter: blur\(32px\) saturate\(180%\);\s+-webkit-backdrop-filter: blur\(32px\) saturate\(180%\);\s+\}/,
  `.nav-header.scrolled {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(32px) saturate(180%);
    -webkit-backdrop-filter: blur(32px) saturate(180%);
  }`
);

fs.writeFileSync(cssPath, content, 'utf8');
console.log('Fixed nav-header background colors.');
