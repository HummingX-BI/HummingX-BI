# Generador de Códigos QR para Tarjetas NFC (HummingX BI)

Herramienta oficial para generar, validar y sincronizar códigos QR vectoriales (SVG) y rasterizados (PNG) para las tarjetas físicas NFC y material impreso de HummingX BI.

## Características

- **Numeración Continua Automática:** Detecta el último código registrado en la base de datos (actualmente los 15 QR iniciales del `#001` al `#015`) y continúa automáticamente a partir del `#016`.
- **Sincronización Directa con el Portal:** Registra automáticamente los nuevos códigos en la base de datos de producción (Neon PostgreSQL) como *"Disponible para asignar"*, para que el equipo comercial pueda configurarlos en 2 clics desde el panel web `/admin/tarjetas-qr`.
- **Preservación de Historial:** Actualiza `indice.csv` sin sobreescribir las tarjetas previas.
- **Validación Automática:** Cada código QR generado se comprueba pixel por pixel con `jsqr` y `pngjs` antes de finalizar.

## Requisitos y Configuración

Desde la raíz del proyecto:

```bash
npm run generate-qr
```

O entrando a la carpeta:

```bash
cd tools/qr-generator
npm install
node generar.mjs
```

## Ejemplos de Uso

### 1. Continuar numeración automáticamente (Siguiente lote de 15 tarjetas)
Detecta que ya hay 15 en existencia y genera del `#016` al `#030`:

```bash
npm run generate-qr
```

### 2. Generar una cantidad específica (ej. 10 tarjetas siguientes)
```bash
npm run generate-qr -- --cantidad 10
```

### 3. Generar un rango personalizado
Generar por ejemplo del 016 al 025:
```bash
npm run generate-qr -- --desde 16 --hasta 25
```

### 4. Regenerar el lote original (001 a 015)
```bash
npm run generate-qr -- --desde 1 --hasta 15
```

### Argumentos CLI Disponibles

- `--desde`: Número inicial (ej. `16`). Si no se especifica, toma el siguiente al último registrado en base de datos.
- `--hasta`: Número final (ej. `30`).
- `--cantidad`: Cantidad de tarjetas a generar a partir de `--desde`.
- `--base`: URL base de redirección (por defecto: `https://hummingxbi.com/t/`).
- `--out`: Directorio de salida (por defecto: `../../qr-output`).
- `--no-db` / `--no-sync`: Desactiva la sincronización con la base de datos (solo genera archivos locales).

## Archivos Generados por Tarjeta

Para cada código (ejemplo `016`):
1. `qr_016.svg`: Vectorial sin margen (para diseñadores gráficos).
2. `qr_016.png`: PNG sin margen (escala 20 px por módulo).
3. `qr_016_margen.svg`: Vectorial con margen de 4 módulos (para stickers sobre cualquier fondo).
4. `qr_016_margen.png`: PNG con margen de 4 módulos.
5. `indice.csv`: Mapeo completo de `codigo,url,svg,png,svg_margen,png_margen` listo para imprenta.

## Guía de Impresión

- **Dimensiones para recuadro:** Para un recuadro de **1.60 in** con zona silenciosa de **0.12 in**, el QR sin margen debe imprimirse a **1.36 in (3.45 cm)** por lado.
- **Tamaño mínimo:** Nunca imprimir a menos de **2.0 cm** de lado para garantizar lectura instantánea con smartphones.
- **Colores y acabado:** Módulos en negro puro (`#000000`) sobre fondo blanco (`#FFFFFF`), en papel o sustrato **mate** para evitar reflejos de luz al escanear.
