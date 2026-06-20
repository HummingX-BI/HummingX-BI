const fs = require('fs');

let cssPath = 'css/style.css';
let content = fs.readFileSync(cssPath, 'utf8');

if (!content.includes('@media (max-width: 768px) { .reveal-up')) {
  content += `\n
/* ================================================================
   AJUSTES DE ANIMACIÓN PARA MÓVILES (Performance y Experiencia)
   ================================================================ */
@media (max-width: 768px) {
  .reveal-up {
    transform: translateY(20px);
    transition-duration: 0.5s;
  }
  .reveal-left {
    transform: translateX(-20px);
    transition-duration: 0.5s;
  }
  .reveal-right {
    transform: translateX(20px);
    transition-duration: 0.5s;
  }
}

/* Reducir motion si el usuario lo prefiere */
@media (prefers-reduced-motion: reduce) {
  .reveal-up, .reveal-left, .reveal-right {
    transition: none;
    transform: none;
    opacity: 1;
  }
}
`;
  fs.writeFileSync(cssPath, content, 'utf8');
  console.log('Added mobile animation adjustments');
} else {
  console.log('Mobile animation adjustments already exist');
}
