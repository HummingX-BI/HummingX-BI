# Propuesta y Archivo de Rediseño: "Administrar Cliente" por Pestañas

Este documento preserva la arquitectura, componentes y estilos del rediseño modular por pestañas para la vista de **Administrar Cliente** (`AdminClientDetailPage.jsx`), dejado en standby para una versión posterior.

---

## 1. Objetivo del Rediseño

Reemplazar la vista monolítica de 1,745 líneas de `AdminClientDetailPage.jsx` por un espacio de trabajo modular con pestañas gobernadas por la URL (`?tab=`), con componentes desacoplados de menos de 400 líneas cada uno:

- **ClientHeader (sticky):** Volver, logo del cliente, nombre/empresa, chips de estado (Activo/Pendiente/Suspendido), chips de nivel y fase, botón "Entrar como cliente", "Ver analíticas" y menú ⋯ con acciones globales (Reenviar invitación, Suspender, Eliminar).
- **ClientKpis (5 tarjetas compactas):** Avance del proyecto %, Próximo pago (monto y fecha), Cobrado vs pendiente, Saldo de Créditos HX, Último acceso.
- **Pestañas de Trabajo:**
  1. `resumen`: Alertas inteligentes (pagos vencidos, invitación pendiente >3 días, inactividad >14 días), datos de contacto, proyecto activo mini y últimos 5 movimientos.
  2. `proyecto`: Formulario de proyecto (fase, %, entrega estimada, enlaces de cotización/contrato/diseño/preview, estado de diseño) con barra inferior sticky de guardado cuando `isDirty`, y botón "Nuevo proyecto".
  3. `pagos`: KPIs financiero (cobrado/pendiente/vencido), tabla de cobros con cambio de estado en 1 clic, wizard de Plan de Pagos y modal para agregar pago individual.
  4. `bitacora`: Composer rápido (tipo de evento + texto) y línea de tiempo histórica con opción de eliminar actividades.
  5. `referidos`: Saldo consolidado, nivel, lista de recomendaciones con acción "Abonar créditos", movimientos de créditos y botón de ajuste manual (+/- HX).
  6. `actividad`: Visualización de <ActivityCalendar/> y horas pico de acceso del cliente (GET `/admin/analytics/client/:id?range=90`).
  7. `ajustes`: Edición de datos generales (nombre, empresa, teléfono, nivel, subida de logo a Cloudinary), suspensión y zona de peligro (eliminar cliente con confirmación de nombre).

---

## 2. Archivos Desarrollados y Archivados

Todos los archivos desarrollados se encuentran respaldados en `docs/archive/`:

```
docs/archive/
├── client-detail/
│   ├── AdjustCreditsModal.jsx
│   ├── AwardCreditsModal.jsx
│   ├── ClientHeader.jsx
│   ├── ClientKpis.jsx
│   ├── ConfirmDialog.jsx
│   ├── NewProjectModal.jsx
│   ├── NotifyPhaseModal.jsx
│   ├── PaymentFormModal.jsx
│   ├── PendingAlerts.jsx
│   ├── PlanWizardModal.jsx
│   ├── TabActivity.jsx
│   ├── TabBitacora.jsx
│   ├── TabOverview.jsx
│   ├── TabPayments.jsx
│   ├── TabProject.jsx
│   ├── TabReferrals.jsx
│   ├── TabSettings.jsx
│   ├── dateUtils.js
│   ├── projectUtils.js
│   ├── uploadUtils.js
│   └── useClientDetail.js
└── client-detail.css
```

---

## 3. Guía de Restauración / Reactivación

Cuando se decida activar esta actualización en una versión futura:

1. **Restaurar carpetas de componentes y estilos:**
   ```bash
   mv docs/archive/client-detail portal/src/pages/admin/
   mv docs/archive/client-detail.css portal/src/styles/
   ```

2. **Importar CSS en `portal/src/main.jsx`:**
   ```javascript
   import './styles/client-detail.css';
   ```

3. **Reemplazar `portal/src/pages/admin/AdminClientDetailPage.jsx`** por el orquestador compacto que delega al hook `useClientDetail` y renderiza las pestañas dinámicas con `<ClientHeader/>`, `<ClientKpis/>` y `<TabComponent/>` (disponible en el commit `aaf1f7d` de git).

4. **Verificar compilación:**
   ```bash
   cd portal && npm run build
   ```
