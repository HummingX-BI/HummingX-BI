const fs = require('fs');

let cssPath = 'css/components.css';
let content = fs.readFileSync(cssPath, 'utf8');

const targetStyle = `\.solutions-mockup__img-container \\{
    max-width: 900px;
    margin: 0 auto;
    border-radius: var\\(--radius-xl\\);
    overflow: hidden;
    box-shadow: var\\(--shadow-depth\\);
    border: 1px solid var\\(--color-border\\);
    background: var\\(--color-bg-elevated\\);
  \\}
  
  \.solutions-mockup__img-container img \\{
    width: 100%;
    height: auto;
    display: block;
  \\}`;

const regex = new RegExp(targetStyle.replace(/\s+/g, '\\s+'));

const replacement = `.solutions-mockup__img-container {
    max-width: 1000px; /* Aumentado para mayor impacto */
    margin: 0 auto;
    border-radius: var(--radius-xl);
    overflow: hidden;
    /* Sombra elegante tipo presentación Apple */
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--color-border);
    background: var(--color-bg-elevated);
    transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.6s ease;
    transform: translateY(0) scale(1);
  }
  
  .solutions-mockup__img-container:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--color-border), 0 20px 40px rgba(13, 148, 136, 0.12); /* Brillo esmeralda/teal sutil */
  }
  
  .solutions-mockup__img-container img {
    /* Escalar la imagen un 4% y usar márgenes negativos recorta el espacio en blanco (padding) pegado a la imagen original */
    width: 104%;
    height: auto;
    margin-left: -2%;
    margin-top: -2%;
    margin-bottom: -2%;
    display: block;
    object-fit: cover;
  }`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(cssPath, content, 'utf8');
  console.log('Fixed solutions-mockup style.');
} else {
  console.log('Could not find target style in components.css');
}
