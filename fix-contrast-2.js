const fs = require('fs');

const file = 'c:/Users/jesus/OneDrive/Desktop/ColibriX/css/components.css';
let content = fs.readFileSync(file, 'utf8');

// nav-header fallback
content = content.replace(/background:\s*#000000;/g, 'background: var(--color-bg-base);');

// nav-header.scrolled and mobile-menu
content = content.replace(/background:\s*#0A0A0C;/g, 'background: var(--color-bg-elevated);');

// The rgba(5, 11, 20, 0.65) glass
content = content.replace(/background:\s*rgba\(5,\s*11,\s*20,\s*0\.65\);/g, 'background: rgba(255, 255, 255, 0.85);');

// The .contact section earlier had background: rgba(5, 11, 20, 0.65);
content = content.replace(/background:\s*rgba\(5,\s*11,\s*20,\s*0\.65\);/g, 'background: rgba(255, 255, 255, 0.85);');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed components.css');
