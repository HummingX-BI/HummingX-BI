# Runbook de Despliegue — HummingX BI

> Léelo ANTES de desplegar. Documenta incidentes reales y cómo evitarlos.

## 1. Mapa de infraestructura

| Pieza | Dónde vive | Cuenta/Equipo Vercel |
|---|---|---|
| Portal (Vite+React, `portal/`) | `portal.hummingxbi.com` · proyecto `hummingx-portal` | `humming-x-bi1` (CLI: `hummingxbi-source`) |
| API + redirección `/t/:code` | proyecto `hummingx-bi` → `hummingx-bi.vercel.app` | `humming-x-bi1` |
| Landing / dominio raíz `hummingxbi.com` | **Otra cuenta/equipo de Vercel** (no es `humming-x-bi1`) | Desconocida (¿Juan / cuenta personal?) |
| DNS de `hummingxbi.com` | Cloudflare (`margo` / `bethany`.ns.cloudflare.com) | — |
| Base de datos | Neon (Postgres), vía Prisma | — |

`vercel domains ls` en `humming-x-bi1` devuelve **0 dominios**: por eso el CLI dice
`You don't have access to the domain hummingxbi.com under humming-x-bi1`.

## 2. Incidente A — Tarjetas NFC/QR: dominio raíz bloqueado

**Síntoma:** el tap físico apunta a `https://hummingxbi.com/t/001`.
- `https://hummingx-bi.vercel.app/t/001` → 302 a Google Reviews ✅
- `https://hummingxbi.com/t/001` → **503 "Tarjeta no activada"** ❌ (verificado 2026-10-13)

**Causa:** `hummingxbi.com` está servido por OTRO proyecto/equipo con código y
`@prisma/client` viejos (sin `NfcCard` o sin las 15 tarjetas). Desde `humming-x-bi1` no se
puede reasignar ni redeployar ese dominio.

**Solución (requiere acceso a la cuenta dueña del dominio):**
1. En esa cuenta, redeploy de `main` SIN caché: `vercel --prod -f` (regenera Prisma).
2. Verificar que las env vars (`DATABASE_URL`, etc.) del proyecto apunten a la MISMA base Neon.
3. Alternativa permanente: transferir/añadir `hummingxbi.com` al equipo `humming-x-bi1`
   (Vercel → Domains → Transfer / invitar a `hummingxbi-source` al equipo dueño).
4. Alternativa sin Vercel: en Cloudflare, regla de redirección/Worker que envíe
   `hummingxbi.com/t/*` → `https://hummingx-bi.vercel.app/t/$1`.
5. Comprobar: `curl -sI https://hummingxbi.com/t/001` debe dar `302` con `location: https://search.google.com/local/writereview?placeid=...`.

## 3. Incidente B — "No se veía nada" en base de datos / clientes

**Síntoma:** tras desplegar cambios de `schema.prisma`, el portal mostraba
"no hay clientes disponibles" aunque los datos existían en Neon.

**Causa:** el schema cambió pero (a) la base de producción no estaba sincronizada
y/o (b) Vercel reutilizó caché de build y `@prisma/client` no se regeneró con el schema nuevo,
así que las consultas fallaban y la UI mostraba vacío. **Los datos nunca se borraron.**

**Regla obligatoria (también en `GEMINI.md`):** cada vez que cambie `prisma/schema.prisma`:
1. ANTES de desplegar: `npx prisma db push` contra producción (con las env vars correctas).
2. Desplegar SIEMPRE con `--force`: `vercel --prod -f --yes` (limpia caché y regenera Prisma).
3. Verificar tras el deploy: contar registros (usuarios/proyectos/tarjetas) antes y después.
4. Nunca usar `db push --accept-data-loss` ni `--force-reset` sin confirmación explícita del usuario.

## 4. Checklist de despliegue

- [ ] ¿Cambió `schema.prisma`? → `db push` + deploy con `-f`.
- [ ] ¿Qué proyecto Vercel afecta? API/landing (`hummingx-bi`, raíz del repo) vs portal (`portal/` → `hummingx-portal`).
- [ ] `git push origin main` (Vercel NO auto-despliega: hay que correr `vercel --prod`).
- [ ] Probar en la URL `.vercel.app` Y en el dominio real; no asumir que son el mismo proyecto.
- [ ] Móvil intacto: no tocar reglas `@media (max-width: 768px)` al ajustar desktop.

## 5. Flujo localhost → producción

Sigue este procedimiento estricto para desplegar cualquier cambio sin riesgo de pérdida de datos ni desincronización:

1. **Verificación previa (solo lectura):**
   ```bash
   npm run predeploy:check
   ```
   Valida si la base de datos de producción está sincronizada con `prisma/schema.prisma` y muestra los conteos actuales de registros.

2. **Respaldo de seguridad:**
   ```bash
   node api/_scripts/backup_db.js
   ```
   Genera una copia en JSON de todas las tablas en la carpeta `backups/`.

3. **Sincronización de esquema (solo si el check lo solicita):**
   ```bash
   npx prisma db push
   ```
   *Nota crítica:* NUNCA uses `--accept-data-loss` ni `--force-reset`. Si `predeploy:check` alertó sobre un `DROP`, revisa el esquema manualmente antes de continuar.

4. **Publicar código en control de versiones:**
   ```bash
   git push origin <nombre-de-rama>
   ```

5. **Desplegar API y Landing (raíz del repositorio):**
   ```bash
   npx vercel --prod -f --yes
   ```

6. **Desplegar Portal del Cliente (carpeta portal/):**
   ```bash
   cd portal && npx vercel --prod -f --yes
   ```
   *(Recordatorio: HummingX BI maneja dos proyectos separados en Vercel).*

7. **Verificación post-despliegue:**
   - Comprobar endpoint de salud de la API:
     ```bash
     curl -s https://hummingx-bi.vercel.app/api/health
     ```
   - Ejecutar conteo de registros nuevamente para asegurar que coincidan con el pre-deploy:
     ```bash
     node api/_scripts/predeploy_check.js
     ```

## 6. Incidente C — localhost usa la BD de producción

## 7. Interruptor de correos automáticos y guarda de seguridad

### Correos automáticos (EMAIL_AUTO_NOTIFICATIONS)
La **invitación de primera vez** se envía siempre al crear un cliente (`POST /admin/clients` y `POST /admin/prospects/:id/convert` cuando crea cuenta nueva), sin importar este interruptor. Vigencia del enlace: 72 h (también en reenvíos).
El resto de avisos (fases, diseño) siguen siendo manuales; para volverlos automáticos poner `EMAIL_AUTO_NOTIFICATIONS=1` en las variables de entorno de Vercel y local.
- Con `EMAIL_AUTO_NOTIFICATIONS` apagado (default):
  - Las transiciones de fase de proyectos no envían correos automáticos (el admin usa el botón manual "Notificar al cliente esta fase").
  - `resend-invitation` y `/auth/forgot-password` siguen operativos cuando el usuario o admin lo solicitan expresamente.
- Para pruebas locales y suites E2E, usar `EMAIL_DRY_RUN=1` en `api/.env` para registrar envíos en consola sin contactar SMTP.

### Guarda de base de datos segura (assert_safe_db)
- El módulo `api/_scripts/assert_safe_db.js` valida que los scripts de prueba no muten BD de producción sin aislamiento ni consentimiento explícito.
- `api/_scripts/protected.js` salvaguarda a usuarios de producción (como JM Nutriólogo y Zammir) contra cualquier mutación, empleando prefijos `ZZ-TEST` para todas las pruebas locales con limpieza automática garantizada.


