# CLAUDE.md — HummingX BI · Landing Page

Contexto fijo del proyecto para Claude Code. Léelo siempre antes de hacer
cambios. El objetivo del cliente: una landing más profesional, más pulida
visualmente y más fácil de navegar (web y móvil), **manteniendo su paleta e
identidad visual**.

---

## 1. Qué es

HummingX BI (antes "ColibriX" — si encuentras branding viejo "ColibriX" o
`colibri-*`, es residuo, elimínalo) es una firma mexicana de **tecnología e
inteligencia de negocios** para PyMEs de CDMX y Estado de México.

Servicios: software integral, agentes IA / automatización, ecosistemas web,
digital signage, NFC / lealtad, Business Intelligence y software a la medida.

Producto: **landing de una sola página** (`index.html`) + 2 páginas legales
(`aviso-de-privacidad.html`, `terminos-y-condiciones.html`). Todo el contenido
está **en español**.

---

## 2. Stack

- **Vite** (vanilla, sin framework). Build a `/dist`, deploy en Vercel.
- HTML + CSS nativo + JavaScript ES modules. **No** React, **no** jQuery, **no**
  Tailwind, **no** Bootstrap.
- Fuentes self-hosted vía `@fontsource`.
- `base: './'` en `vite.config.js` (rutas relativas para Vercel).

---

## 3. Estructura de archivos

```
public/            assets servidos tal cual (fonts, images, media, favicon)
src/css/
  base/            tokens.css · reset.css · typography.css · utilities.css
  layout/          navbar.css · footer.css · container.css
  components/      buttons.css · cards.css · forms.css · marquee.css · carousel.css · faq.css
  sections/        hero.css · services.css · process.css · solutions.css · team.css · philosophy.css · contact.css · cta.css
  main.css         SOLO @import en orden de cascada
src/js/
  modules/         un módulo = una responsabilidad (navbar, form, carousel, faq, ...)
  utils/           helpers (svgInject, reducedMotion, ...)
  main.js          importa e inicializa todo
index.html · aviso-de-privacidad.html · terminos-y-condiciones.html
```

Regla: **un componente CSS = un archivo. Un módulo JS = una responsabilidad.**
Agregar algo nuevo = un archivo nuevo, no engordar uno existente.

---

## 4. Sistema de diseño (NO inventar valores nuevos)

Todos los colores, espaciados y radios viven como variables CSS en
`src/css/base/tokens.css`. **Nunca hardcodees un color o medida**: usa la
variable. Si falta una, créala en tokens.css.

### Paleta (respetar siempre)
```
Verde primario   --color-gold        #00E5A0   (light #33EAB3 · dim #00B37E)
Azul secundario  --color-blue        #0066FF   (light #3385FF)
Fondos           base #FAFAF9 · blanco #FFFFFF · gris #F3F4F6 / #F9FAFB
Texto            primario #111827 · secundario #6B7280 · muted #9CA3AF
Bordes           #E5E7EB · sutil #F3F4F6
```
Tema **claro** (fondos crema/blanco, texto oscuro). No es dark mode.

### Tipografía
```
Titulares  DM Serif Display  (editorial, vía @fontsource/dm-serif-display)
Cuerpo/UI  Inter             (vía @fontsource/inter)
```
**Importante:** NO dejes `--font-display/heading/body` apuntando a `system-ui`
(era un bug). Deben usar Inter y DM Serif Display reales.

### Tokens de medida
```
Radios     4 / 6 / 8 / 12 / 16 px · full 9999
Container  max 1280px
Spacing    escala --space-1..32 (0.25rem .. 8rem)
```

---

## 5. Convenciones de código

- **CSS:** metodología **BEM** (`block__element--modifier`). **Mobile-first**:
  estilos base para móvil, `@media (min-width: ...)` para escalar. Respeta
  `prefers-reduced-motion` en toda animación.
- **HTML:** **cero `style=""` inline.** Todo va a clases. HTML semántico y
  accesible (roles, aria-*, alt). Los `id` de sección y los `href="#..."` del
  nav/footer **deben coincidir exactamente**.
- **JS:** módulos ES (`import`/`export`), patrón de un módulo por feature con
  `init()`. Sin librerías externas salvo que se acuerde. Nada de código muerto:
  si defines un módulo, inicialízalo.
- **Assets:** imágenes optimizadas. El favicon no debe pesar megas.

---

## 6. Prohibido (errores del pasado)

- ❌ Scripts `.js` en la raíz que muten CSS/HTML por regex (eso causó el caos
  original: comentarios obsoletos, secciones duplicadas, rutas Windows).
  Si necesitas cambiar CSS, **edita el archivo directamente.**
- ❌ Hardcodear colores hex en componentes (usa tokens).
- ❌ `style=""` inline en HTML.
- ❌ Romper la paleta o la identidad visual del cliente.
- ❌ Duplicar reglas o módulos ("Enhanced", "v2", "new_") en vez de editar el
  existente.

---

## 7. Estado / hoja de ruta

Migración por fases revisables. Tras cada fase, **el sitio debe seguir
funcionando** antes de avanzar.

- [ ] Fase 1 — Andamiaje Vite + limpieza de muerto
- [ ] Fase 2 — Partir CSS gigante en componentes + borrar CSS huérfano
        (`.attributes`, `.service-item`, `.mockup`, counters — ya no existen en HTML)
- [ ] Fase 3 — Limpiar JS muerto (módulos definidos y nunca llamados; doble
        binding del FAQ entre main.js y animations.js)
- [ ] Fase 4 — Bugs: fuentes reales · anchor `#faqs`→`#faq` · email
        inconsistente (`@hummingx.com` vs `@hummingxbi.com`) · "Equipo" al nav
- [ ] Fase 5+ — Mejoras visuales: tipografía, hero, integrar
        `mockup-dashboard.png`, prueba social, micro-interacciones

Trabaja SOLO la fase pedida. No te adelantes a fases siguientes.
