const fs = require('fs');
const file = '/Users/emmanuel/Desktop/HummingX BI/HummingX BI Web/HummingX-BI/portal/src/assets/lottie/ZLG67VWQkw.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const colors = new Set();
function traverse(obj) {
  if (Array.isArray(obj)) {
    if ((obj.length === 3 || obj.length === 4) && obj.every(n => typeof n === 'number')) {
      if (obj.every(n => n >= 0 && n <= 1) && obj.some(n => n > 0 && n < 1)) { 
        const hex = '#' + obj.slice(0,3).map(n => Math.round(n * 255).toString(16).padStart(2, '0')).join('');
        colors.add(hex);
      }
    }
    obj.forEach(traverse);
  } else if (obj && typeof obj === 'object') {
    Object.values(obj).forEach(traverse);
  }
}

traverse(data);
console.log('Colors extracted:', Array.from(colors));
