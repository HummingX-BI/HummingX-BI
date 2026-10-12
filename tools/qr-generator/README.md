# Generador de Códigos QR para Tarjetas NFC (HummingX BI)

Herramienta para generar y validar códigos QR vectoriales (SVG) y rasterizados (PNG) para las tarjetas físicas NFC y material impreso de HummingX BI.

## Requisitos y Configuración

```bash
cd tools/qr-generator
npm install
```

## Uso

Generar los códigos QR con los valores por defecto (tarjetas 001 a 015, URL base de producción):

```bash
node generar.mjs
```

### Argumentos Opcionales

- `--base`: URL base de redirección (por defecto: `https://hummingxbi.com/t/`).
- `--desde`: Número inicial (por defecto: `1`).
- `--hasta`: Número final (por defecto: `15`).
- `--out`: Ruta del directorio de salida (por defecto: `../../qr-output`).

Ejemplo con `--base` personalizada o ambiente de pruebas:

```bash
node generar.mjs --base https://hummingxbi.com/t/ --desde 1 --hasta 15
```

## Archivos Generados por Tarjeta

Para cada código (ejemplo `001`):
1. `qr_001.svg`: Vectorial sin margen (para colocar dentro de recuadros de diseño que ya cuentan con zona silenciosa).
2. `qr_001.png`: PNG sin margen (escala exacta de 20 px por módulo, sin suavizado/interpolación).
3. `qr_001_margen.svg`: Vectorial con margen de 4 módulos (ideal para stickers directos sobre cualquier fondo).
4. `qr_001_margen.png`: PNG con margen de 4 módulos (escala exacta de 20 px por módulo).
5. `indice.csv`: Tabla con el mapeo de `codigo`, `url`, y rutas de los 4 archivos correspondientes.

Cada código generado es validado automáticamente con `jsqr` y `pngjs` antes de finalizar.

## Guía y Notas de Impresión

- **Dimensiones para recuadro:** Para un recuadro de **1.60 in** con zona silenciosa de **0.12 in**, el QR sin margen debe imprimirse a **1.36 in (3.45 cm)** por lado.
- **Tamaño mínimo:** Nunca imprimir a menos de **2.0 cm** de lado para garantizar lectura instantánea con cámaras de smartphones.
- **Colores y acabado:** Módulos en negro puro (`#000000`) sobre fondo blanco (`#FFFFFF`), en papel o sustrato **mate** para evitar reflejos de luz al escanear.
