import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno (.env de la raíz del proyecto)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function parseArgs(args) {
  const options = {
    base: 'https://hummingxbi.com/t/',
    desde: null,
    hasta: null,
    cantidad: null,
    out: path.resolve(__dirname, '../../qr-output'),
    syncDb: true,
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
    } else if (arg === '--cantidad' && args[i + 1]) {
      options.cantidad = parseInt(args[++i], 10);
    } else if (arg.startsWith('--cantidad=')) {
      options.cantidad = parseInt(arg.slice('--cantidad='.length), 10);
    } else if (arg === '--out' && args[i + 1]) {
      options.out = path.resolve(process.cwd(), args[++i]);
    } else if (arg.startsWith('--out=')) {
      options.out = path.resolve(process.cwd(), arg.slice('--out='.length));
    } else if (arg === '--no-db' || arg === '--no-sync') {
      options.syncDb = false;
    } else if (arg === '--sync-db') {
      options.syncDb = true;
    }
  }
  return options;
}

async function getHighestExistingCode(outDir) {
  let highest = 15; // Mínimo 15 ya existentes confirmados en HummingX BI

  // 1. Intentar consultar base de datos vía Prisma
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const cards = await prisma.nfcCard.findMany({ select: { code: true } });
    for (const c of cards) {
      const n = parseInt(c.code, 10);
      if (!isNaN(n) && n > highest) highest = n;
    }
    await prisma.$disconnect();
  } catch (err) {
    // Si falla la conexión a Prisma, intentar leer archivos locales
  }

  // 2. Revisar indice.csv local si existe
  const csvPath = path.join(outDir, 'indice.csv');
  if (fs.existsSync(csvPath)) {
    try {
      const lines = fs.readFileSync(csvPath, 'utf8').split('\n');
      for (const line of lines) {
        const parts = line.split(',');
        const codeNum = parseInt(parts[0], 10);
        if (!isNaN(codeNum) && codeNum > highest) highest = codeNum;
      }
    } catch (e) {}
  }

  return highest;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const base = options.base.endsWith('/') ? options.base : `${options.base}/`;
  const outDir = options.out;

  fs.mkdirSync(outDir, { recursive: true });

  // Determinar numeración inicial y final
  const highestExisting = await getHighestExistingCode(outDir);
  const startNum = options.desde !== null ? options.desde : (highestExisting + 1);

  let endNum;
  if (options.hasta !== null) {
    endNum = options.hasta;
  } else if (options.cantidad !== null) {
    endNum = startNum + options.cantidad - 1;
  } else {
    // Por defecto generar 15 tarjetas más para seguir la numeración
    endNum = startNum + 14;
  }

  if (startNum > endNum) {
    console.error(`Error: El número inicial (${startNum}) no puede ser mayor al final (${endNum}).`);
    process.exit(1);
  }

  // Leer indice.csv previo para no sobreescribir historial de tarjetas
  const csvPath = path.join(outDir, 'indice.csv');
  const existingRowsMap = new Map();
  if (fs.existsSync(csvPath)) {
    const lines = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts[0]) existingRowsMap.set(parts[0], parts);
    }
  }

  const summary = [];
  const generatedCodes = [];
  let allOk = true;

  console.log(`\n============================================================`);
  console.log(`  HummingX BI — Generador Automático de Códigos QR NFC`);
  console.log(`============================================================`);
  console.log(`• Último código detectado en sistema: #${String(highestExisting).padStart(3, '0')}`);
  console.log(`• Rango a generar: #${String(startNum).padStart(3, '0')} a #${String(endNum).padStart(3, '0')} (${endNum - startNum + 1} códigos)`);
  console.log(`• URL base de redirección: ${base}`);
  console.log(`• Directorio de salida: ${outDir}\n`);

  for (let i = startNum; i <= endNum; i++) {
    const code = String(i).padStart(3, '0');
    const url = `${base}${code}`;
    generatedCodes.push(code);

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

    existingRowsMap.set(code, [code, url, svgFileName, pngFileName, svgMargenFileName, pngMargenFileName]);
  }

  // Escribir / actualizar indice.csv con todas las tarjetas ordenadas numéricamente
  const sortedRows = Array.from(existingRowsMap.values()).sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10));
  const csvContent = [['codigo', 'url', 'svg', 'png', 'svg_margen', 'png_margen'], ...sortedRows]
    .map(r => r.join(','))
    .join('\n') + '\n';
  fs.writeFileSync(csvPath, csvContent, 'utf8');

  // Imprimir tabla resumen
  console.table(summary);

  // Sincronizar automáticamente en la Base de Datos (Neon PostgreSQL) si está activo
  if (options.syncDb) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const existingInDb = await prisma.nfcCard.findMany({ select: { code: true } });
      const dbCodes = new Set(existingInDb.map(c => c.code));

      const cardsToCreate = [];
      for (const code of generatedCodes) {
        if (!dbCodes.has(code)) {
          cardsToCreate.push({
            code,
            clientName: 'Disponible para asignar',
            type: 'google_reviews',
            targetUrl: 'https://hummingxbi.com',
            active: false,
            notes: `Lote generado (#${String(startNum).padStart(3, '0')} a #${String(endNum).padStart(3, '0')})`
          });
        }
      }

      if (cardsToCreate.length > 0) {
        await prisma.nfcCard.createMany({ data: cardsToCreate });
        console.log(`✅ Sincronización exitosa: ${cardsToCreate.length} tarjetas registradas en la base de datos de HummingX BI.`);
      } else {
        console.log(`ℹ️ Las tarjetas generadas ya se encontraban registradas en la base de datos.`);
      }
      await prisma.$disconnect();
    } catch (dbErr) {
      console.warn(`⚠️ No se pudo sincronizar automáticamente con la base de datos:`, dbErr.message);
    }
  }

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
