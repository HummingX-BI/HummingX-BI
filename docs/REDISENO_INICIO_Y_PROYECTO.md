# Documento Técnico: Rediseño Premium de "Inicio" y "Mi Proyecto" (En Standby)

**Estado:** EN STANDBY (Pospuesto para versión futura)  
**Fecha de resguardo:** Octubre 2026  
**Módulos involucrados:** Portal Cliente (`/client/dashboard` e `/client/project`)  
**Commits de referencia en Git:**
- `3935d1c` — *feat(portal): rediseño premium de Inicio*
- `d6c8ccb` — *feat(portal): rediseño premium de Mi Proyecto*
**Copia de seguridad en código fuente:** `docs/archive/redesign-standby/`

---

## 1. Motivo del Standby: Diagnóstico de Contraste con Logotipos

Durante la previsualización del rediseño en entorno de pruebas, se observó que **algunos logotipos de clientes se pierden o reducen drásticamente su legibilidad**.

### Causa Raíz
1. **Heterogeneidad de formatos de cliente:** Los logotipos subidos por los clientes corresponden en gran medida a archivos PNG con fondo transparente diseñados originalmente para soportes claros (papelería, membretes, sitios web con fondo blanco). Muchos de ellos tienen tipografías en color negro, gris oscuro o azul marino profundo.
2. **Fondo oscuro del Hero Banner:** El nuevo diseño editorial implementó un contenedor Hero con fondo oscuro profundo (`#0B0B0E`) y un badge translúcido (`rgba(255, 255, 255, 0.08)`). Al colocarse sobre este fondo, cualquier isotipo o tipografía oscura del logotipo pierde contraste cromático (contraste inferior a 2:1 contra la norma WCAG AA de 4.5:1).
3. **Por qué el diseño original no presentaba este problema:** La versión anterior del portal utiliza un fondo claro general (`#F9FAFB` / `#FFFFFF`), lo que permite que los logotipos oscuros o tradicionales mantengan un contraste natural inmediato.

---

## 2. Soluciones Técnicas para la Siguiente Versión

Para reactivar el rediseño sin comprometer ningún logotipo de cliente, se debe implementar una de las siguientes soluciones en la siguiente iteración:

### Opción A: Contenedor Blanco Aislado / "Pill" de Alto Contraste (Recomendada)
En lugar de permitir que la imagen transparente repose directamente sobre el fondo oscuro de `#0B0B0E`, envolver el logotipo en una pastilla o tarjeta de contraste asegurado:

```jsx
// En ClientBadge.jsx o HomeHero.jsx
<div style={{
  background: '#FFFFFF',
  borderRadius: '16px',
  padding: '10px 16px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
  border: '1px solid rgba(255, 255, 255, 0.2)'
}}>
  <img
    src={logoUrl}
    alt={name}
    style={{ maxHeight: '42px', maxWidth: '140px', objectFit: 'contain' }}
  />
</div>
```

**Ventajas:**
- Resuelve el 100% de los casos sin importar si el logotipo es negro, azul, dorado o multicolor.
- Da un aspecto de "placa de lujo" o credencial corporativa prémium.

### Opción B: Detección Dinámica de Luminosidad (Canvas)
Un hook (`useLogoLuminance.js`) que renderiza el logo en un canvas oculto de 16x16px y calcula el brillo medio de los píxeles no transparentes:
- Si `luminance < 0.45` (logo oscuro): se inyecta dinámicamente un fondo blanco o un filtro CSS sutil de realce (`drop-shadow(0 0 1px rgba(255,255,255,0.8))`).
- Si `luminance >= 0.45` (logo claro o con fondo blanco propio): se mantiene en modo transparente nativo.

### Opción C: Hero Banner Híbrido Claro / Dark Mode Opcional
Conservar toda la nueva arquitectura de datos (KPIs, Bitácora, Roadmap de 5 fases, Entregables), pero ofrecer el Hero Banner en un acabado de superficie clara (`#FFFFFF` con gradiente suave y bordes pulidos) manteniendo la estética prémium pero con fondo amigable para cualquier logotipo tradicional.

---

## 3. Catálogo de Componentes Desarrollados

Los componentes y estilos se encuentran íntegramente resguardados en `docs/archive/redesign-standby/` para su reutilización directa:

### 3.1 Componentes UI Compartidos (`components/premium/`)
- **`ClientBadge.jsx`**: Insignia con el isotipo del cliente o sus iniciales con tipografía *DM Serif Display*, con bordes redondeados y sombra difuminada.
- **`CountUp.jsx`**: Animación fluida de incremento numérico para métricas y KPIs.
- **`ProgressRing.jsx`**: Anillo de progreso SVG circular animado con porcentaje centrado y gradiente personalizado.
- **`Reveal.jsx`**: Contenedor con animación de entrada suave (*fade-in + slide-up*) mediante `IntersectionObserver`.
- **`useAccentColor.js`**: Hook que analiza los colores del logo del cliente para derivar una paleta de acento contextual (`--px-accent`).

### 3.2 Módulo "Inicio" (`pages/client/home/`)
- **`HomeHero.jsx`**: Hero principal con saludo editorial, estado general del proyecto y enlace de contacto directo con soporte HummingX.
- **`KpiStrip.jsx`**: Tira de 4 tarjetas de métricas (Fase actual, Días transcurridos, Entregables validados, Estado de entrega).
- **`ActionCard.jsx`**: Tarjeta destacada con el siguiente entregable o acción requerida por parte del cliente.
- **`PhaseMini.jsx`**: Vista compacta del avance del proyecto con barra segmentada.
- **`ActivityFeed.jsx`**: Historial de actividades recientes con marcas de tiempo relativas en español.

### 3.3 Módulo "Mi Proyecto" (`pages/client/project/`)
- **`ProjectHero.jsx`**: Encabezado del proyecto con banner de celebración de cambio de fase, estado y acceso a URL de previsualización.
- **`BrowserFrame.jsx`**: Mockup de navegador web con botones estilo macOS para enmarcar enlaces a prototipos y entregables interactivos.
- **`PhaseRoadmap.jsx`**: Línea de tiempo estructurada con las 5 fases comerciales, checklist de objetivos por fase y estado (*Completada*, *En curso*, *Próxima*).
- **`NextStepCard.jsx`**: Bloque enfocado en el paso inmediato a ejecutar para mantener la tracción del proyecto.
- **`DeliverablesGrid.jsx`**: Catálogo de entregables clasificados por estado con botones de descarga y previsualización.
- **`Bitacora.jsx`**: Bitácora cronológica con comentarios y avances registrados por el equipo de HummingX.

### 3.4 Sistema de Estilos y Tokens (`styles/premium.css`)
- **Tipografía:** *Inter Variable* para cuerpos y datos; *DM Serif Display* para encabezados editoriales.
- **Tokens de color:**
  - `--px-bg`: Fondo general `#070709`.
  - `--px-surface`: Superficie de tarjetas `#0E0E12`.
  - `--px-border`: Bordes suaves `rgba(255, 255, 255, 0.08)`.
  - `--px-accent`: Color dinámico derivado o cian corporativo `#00C4CC`.

---

## 4. Guía de Reactivación para Futuras Versiones

Cuando se decida retomar este rediseño:

1. **Copiar los archivos archivados de vuelta al código activo:**
   ```bash
   cp -r docs/archive/redesign-standby/components/premium portal/src/components/
   cp -r docs/archive/redesign-standby/pages/client/home portal/src/pages/client/
   cp -r docs/archive/redesign-standby/pages/client/project portal/src/pages/client/
   cp docs/archive/redesign-standby/styles/premium.css portal/src/styles/
   ```

2. **Aplicar la Opción A (Contenedor Blanco Aislado) en:**
   - `portal/src/components/premium/ClientBadge.jsx`
   - `portal/src/pages/client/home/HomeHero.jsx`
   - `portal/src/pages/client/project/ProjectHero.jsx`

3. **Reactivar las vistas principales:**
   - Copiar `docs/archive/redesign-standby/pages/client/DashboardPage.redesign.jsx` a `portal/src/pages/client/DashboardPage.jsx`.
   - Copiar `docs/archive/redesign-standby/pages/client/ProjectPage.redesign.jsx` a `portal/src/pages/client/ProjectPage.jsx`.
   - Importar `premium.css` y las fuentes en `portal/src/main.jsx`.

4. **Validación:**
   ```bash
   cd portal && npm run build
   ```
   Comprobar en el navegador local (`http://localhost:5177`) con varios clientes que tengan logotipos oscuros, claros y mixtos para verificar que todos tengan contraste óptimo.
