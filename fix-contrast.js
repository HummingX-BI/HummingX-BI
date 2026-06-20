const fs = require('fs');

const files = [
  'c:/Users/jesus/OneDrive/Desktop/ColibriX/css/style.css',
  'c:/Users/jesus/OneDrive/Desktop/ColibriX/css/components.css'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace dark overlays with light overlays or background colors
  content = content.replace(/rgba\(\s*12\s*,\s*12\s*,\s*13\s*,\s*0\.97\s*\)/g, 'rgba(255, 255, 255, 0.97)');
  content = content.replace(/rgba\(\s*12\s*,\s*12\s*,\s*13\s*,\s*0\.[0-9]+\s*\)/g, 'rgba(255, 255, 255, 0.5)');
  content = content.replace(/rgba\(\s*15\s*,\s*25\s*,\s*40\s*,\s*0\.[0-9]+\s*\)/g, 'rgba(255, 255, 255, 0.5)');
  content = content.replace(/rgba\(\s*20\s*,\s*20\s*,\s*22\s*,\s*0\.[0-9]+\s*\)/g, 'rgba(255, 255, 255, 0.6)');
  content = content.replace(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.6\s*\)/g, 'rgba(0, 0, 0, 0.05)');
  content = content.replace(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.5\s*\)/g, 'rgba(0, 0, 0, 0.05)');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
});
