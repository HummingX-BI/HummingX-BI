import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(args) {
  const options = {
    base: 'https://hummingxbi.com/t/',
    desde: 1,
    hasta: 15,
    out: path.resolve(__dirname, '../../qr-output')
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--base' && args[i + 1]) {
      options.base = args[++i];
    } else if (arg.startsWith('--base=')) {
      options.base = arg.slice('--base='.length);
    } else if (arg === '--desde' && args[i + 1]) {
      options.desde = parseInt(args[++i], 10);
    } else if (arg.startsWith('--desde=')) {
      options.desde = parseInt(arg.slice('--desde='.length), 10);
    } else if (arg === '--hasta' && args[i + 1]) {
      options.hasta = parseInt(args[++i], 10);
    } else if (arg.startsWith('--hasta=')) {
      options.hasta = parseInt(arg.slice('--hasta='.length), 10);
    } else if (arg === '--out' && args[i + 1]) {
      options.out = path.resolve(process.cwd(), args[++i]);
    } else if (arg.startsWith('--out=')) {
      options.out = path.resolve(process.cwd(), arg.slice('--out='.length));
    }
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const base = options.base.endsWith('/') ? options.base : `${options.base}/`;
  const outDir = options.out;

  fs.mkdirSync(outDir, { recursive: true });

  const rows = [
    ['codigo', 'url', 'svg', 'png', 'svg_margen', 'png_margen']
  ];

  const summary = [];
  let allOk = true;

  console.log(`\nGenerando códigos QR para tarjetas NFC (${options.desde} a ${options.hasta})...`);
  console.log(`Directorio de salida: ${outDir}\n`);

  for (let i = options.desde; i <= options.hasta; i++) {
    const code = String(i).padStart(3, '0');
    const url = `${base}${code}`;

    // Nombres de archivos
    const svgFileName = `qr_${code}.svg`;
    const pngFileName = `qr_${code}.png`;
    const svgMargenFileName = `qr_${code}_margen.svg`;
    const pngMargenFileName = `qr_${code}_margen.png`;

    const svgPath = path.join(outDir, svgFileName);
    const pngPath = path.join(outDir, pngFileName);
    const svgMargenPath = path.join(outDir, svgMargenFileName);
    const pngMargenPath = path.join(outDir, pngMargenFileName);

    // Calcular tamaño en módulos (nivel de corrección Q)
    const qrObj = QRCode.create(url, { errorCorrectionLevel: 'Q' });
    const modules = qrObj.modules.size;
    const expectedPxSinMargen = modules * 20;
    const expectedPxConMargen = (modules + 8) * 20;

    // 1) SVG sin margen
    const svgContent = await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'Q',
      margin: 0,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    fs.writeFileSync(svgPath, svgContent, 'utf8');

    // 2) PNG sin margen (escala 20 px por módulo)
    const pngBuffer = await QRCode.toBuffer(url, {
      type: 'png',
      errorCorrectionLevel: 'Q',
      margin: 0,
      scale: 20,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    fs.writeFileSync(pngPath, pngBuffer);

    // 3) SVG con margen (4 módulos)
    const svgMargenContent = await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'Q',
      margin: 4,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    fs.writeFileSync(svgMargenPath, svgMargenContent, 'utf8');

    // 4) PNG con margen (4 módulos, escala 20 px por módulo)
    const pngMargenBuffer = await QRCode.toBuffer(url, {
      type: 'png',
      errorCorrectionLevel: 'Q',
      margin: 4,
      scale: 20,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
    fs.writeFileSync(pngMargenPath, pngMargenBuffer);

    // Verificación 1: Confirmar dimensiones de PNG sin margen
    const pngSinMargenData = PNG.sync.read(pngBuffer);
    const dimOk = (
      pngSinMargenData.width === expectedPxSinMargen &&
      pngSinMargenData.height === expectedPxSinMargen
    );

    // Verificación 2: Decodificar PNG con margen con jsqr + pngjs
    const pngMargenData = PNG.sync.read(pngMargenBuffer);
    const decoded = jsQR(
      new Uint8ClampedArray(pngMargenData.data),
      pngMargenData.width,
      pngMargenData.height
    );
    const decodedUrl = decoded ? decoded.data : null;
    const decodeOk = (decodedUrl === url);

    const testOk = dimOk && decodeOk;
    if (!testOk) {
      allOk = false;
    }

    summary.push({
      Código: code,
      URL: url,
      'Módulos': `${modules}x${modules}`,
      'PNG sin margen': `${pngSinMargenData.width}x${pngSinMargenData.height} px ${dimOk ? '✔' : '✖'}`,
      'Decodificación jsQR': decodeOk ? 'OK' : `FALLÓ (${decodedUrl})`,
      'Estado': testOk ? 'OK' : 'FALLÓ'
    });

    rows.push([code, url, svgFileName, pngFileName, svgMargenFileName, pngMargenFileName]);
  }

  // Escribir indice.csv
  const csvContent = rows.map(r => r.join(',')).join('\n') + '\n';
  const csvPath = path.join(outDir, 'indice.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf8');

  // Imprimir tabla resumen
  console.table(summary);

  console.log(`\nURL base utilizada: ${base}`);
  console.log('Recordatorio: Estas URLs deben coincidir con las que se escriban en los chips NFC.\n');

  if (!allOk) {
    console.error('Error: Una o más verificaciones de QR fallaron.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error fatal en generar.mjs:', err);
  process.exit(1);
});
