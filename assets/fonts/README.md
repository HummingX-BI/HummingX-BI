# Fuentes Locales — HummingX-BI

## ¿Por qué están aquí?

Las fuentes locales eliminan la dependencia del CDN de Google Fonts en producción,
reduciendo el FCP (First Contentful Paint) y el CLS (Cumulative Layout Shift).

## Archivos esperados

Coloca los siguientes archivos WOFF2 en esta carpeta:

| Archivo                    | Fuente     | Peso | Uso                  |
|----------------------------|------------|------|----------------------|
| `syncopate-regular.woff2`  | Syncopate  | 400  | Títulos hero, navbar |
| `syncopate-bold.woff2`     | Syncopate  | 700  | Títulos en negrita   |
| `inter-regular.woff2`      | Inter      | 400  | Cuerpo, UI           |
| `inter-600.woff2`          | Inter      | 600  | Labels, botones      |

## Cómo descargar

### Opción A — Google Fonts Helper (recomendada)
1. Ve a https://gwfh.mranftl.com/fonts
2. Busca "Syncopate" → Selecciona pesos 400 y 700 → Descarga el ZIP
3. Repite con "Inter" → Selecciona pesos 400 y 600
4. Extrae los archivos `.woff2` y cópialos aquí

### Opción B — fontsource (npm)
```bash
npm install @fontsource/syncopate @fontsource/inter
# Los WOFF2 estarán en node_modules/@fontsource/*/files/
```

## Fallback
Mientras estos archivos no existen, la landing page usa la fuente de Google Fonts CDN
declarada en el `<head>` como fallback. No habrá errores visuales, solo warnings
en devtools sobre 404 en estas rutas.

## hero-poster.webp
Coloca también en `/assets/hero-poster.webp` una imagen estática que represente
el primer frame del video `hero-bg.mp4`. Esta imagen se muestra instantáneamente
mientras el video carga, mejorando el LCP.

```bash
# Con ffmpeg:
ffmpeg -i assets/hero-bg.mp4 -vframes 1 -vf scale=1920:-1 assets/hero-poster.webp
```
