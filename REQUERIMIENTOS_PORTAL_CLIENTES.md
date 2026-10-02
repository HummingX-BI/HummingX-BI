# 📋 Requerimientos y Especificación Funcional: Portal de Clientes y Afiliados
**HummingX BI · Consultoría e Ingeniería de Software**  
*Versión: 1.0 — Documento de Definición Oficial*

---

## 1. Visión y Propósito del Sistema

El **Portal de Clientes de HummingX BI** es una plataforma web privada diseñada para brindar transparencia, control y valor agregado a los clientes de la firma. Resuelve dos necesidades prioritarias del negocio:

1. **Seguimiento de Proyecto (Core):** Permitir a cada cliente visualizar en tiempo real en qué fase de desarrollo se encuentra su solución, conocer las fechas estimadas de entrega y revisar la bitácora histórica de avances.
2. **Programa de Afiliados y Recomendaciones:** Facilitar la recomendación de nuevas empresas hacia HummingX BI y consultar los beneficios obtenidos (**Créditos HX**) de forma clara y motivante.

> **Premisa de Diseño y Experiencia:**  
> Simplicidad ejecutiva, elegancia corporativa y cero saturación. Se descartan interfaces recargadas, módulos innecesarios y elementos informales (cero emojis; iconografía basada en `lucide-react`).

---

## 2. Estructura Oficial de Navegación (Módulos del Nav)

El sistema opera bajo un esquema de **Roles Basados en Permisos (RBAC)** con una navegación lateral (**Sidebar**) limpia y diferenciada:

### A. Navegación para el Cliente (3 Módulos + 1 Enlace Directo)

```
┌──────────────────────────────────────────────────┐
│  [Logo HummingX BI]                              │
│  Portal de Clientes                              │
├──────────────────────────────────────────────────┤
│  📊 Inicio               (/dashboard)            │
│  📁 Mi Proyecto          (/project)              │
│  👥 Mis Referidos        (/referrals)            │
├──────────────────────────────────────────────────┤
│  💬 Soporte por WhatsApp (Enlace directo wa.me)  │
├──────────────────────────────────────────────────┤
│  [Avatar Cliente]        [Cerrar Sesión]         │
└──────────────────────────────────────────────────┘
```

#### 1. `Inicio` (`/dashboard`)
* **Objetivo:** Brindar un resumen ejecutivo instantáneo de la cuenta al iniciar sesión.
* **Componentes clave:**
  * **Saludo personalizado:** Nombre de la empresa y badge de cuenta activa.
  * **Resumen del Proyecto Activo:** Tarjeta con fase actual, barra de progreso porcentual y fecha de entrega.
  * **Widget de Créditos HX y Referidos:** Balance de créditos acumulados y número de empresas recomendadas.
  * **Acceso Rápido:** Enlace directo al expediente completo del proyecto o a recomendar una empresa.

#### 2. `Mi Proyecto` (`/project`) — *Módulo Core de la Plataforma*
* **Objetivo:** Seguimiento transparente del desarrollo contratado paso a paso.
* **Componentes clave:**
  * **Ficha Técnica:** Título del proyecto, descripción del alcance y estatus operativo (*En desarrollo*, *En revisión*, etc.).
  * **Stepper de 6 Fases Metodológicas:** Línea de tiempo visual e interactiva que muestra las etapas completadas, la etapa activa y las etapas pendientes.
  * **Métricas de Entrega:** Porcentaje de avance general y fecha estimada de entrega o siguiente hito.
  * **Bitácora de Avances (Activity Log):** Registro cronológico de actividades, hitos alcanzados y entregables generados por el equipo de ingeniería.

#### 3. `Mis Referidos` (`/referrals`) — *Módulo de Afiliados*
* **Objetivo:** Centralizar el ecosistema de recomendaciones y lealtad de la firma.
* **Componentes clave:**
  * **Balance de Créditos HX:** Tarjeta destacada con el saldo total acumulado y su equivalencia referencial (1 Crédito HX = $1 MXN).
  * **Enlace Único de Referido:** Input con botón de copiado en 1-clic (`hummingxbi.com/ref/[slug-cliente]`).
  * **Acción de Registro Rápido:** Botón modal *"Recomendar una empresa"* para ingresar directamente el nombre de la empresa y contacto sin depender únicamente del enlace.
  * **Historial de Recomendaciones (Data Grid):** Tabla con empresa recomendada, fecha, estatus de seguimiento y créditos generados tras la concreción del proyecto.
  * **Mecanismo de 3 Pasos:** Explicación visual breve (*Recomiendas ➔ Analizamos solución ➔ Recibes Créditos HX*).

#### 4. `Soporte por WhatsApp` *(Acceso Directo en Nav)*
* **Objetivo:** Proveer atención al cliente humana e inmediata sin fricción.
* **Comportamiento:** Enlace que abre conversación directa con el canal oficial de HummingX BI con mensaje contextual pre-escrito (*"Hola HummingX BI, necesito asistencia con mi proyecto..."*). No es una pantalla intermedia.

---

### B. Navegación para el Administrador / Fundadores

#### 1. `Directorio Clientes` (`/admin/clients`)
* **Objetivo:** Panel interno para que los fundadores gestionen el ciclo de vida de los proyectos sin depender de integraciones complejas inmediatas.
* **Componentes clave:**
  * **Listado de Clientes:** Tabla con todas las empresas registradas, contacto y estado del proyecto.
  * **Editor de Proyecto:** Selector de fase actual (1 a 6), actualizador del porcentaje de progreso (0% - 100%) y ajuste de fechas de entrega.
  * **Gestor de Bitácora:** Formulario ágil para redactar notas de avance o hitos que se reflejan de inmediato en el portal del cliente.
  * **Control de Referidos:** Visualización de recomendaciones enviadas por los clientes y actualización de su estado comercial.

---

## 3. Módulos Descartados y Justificación Estratégica

Tras el análisis de las propuestas preliminares (Stitch), se descartaron los siguientes módulos para evitar saturación y proteger la rentabilidad y confidencialidad de la firma:

| Módulo Descartado | Diagnóstico en Stitch | Motivo de Eliminación / Solución Adoptada |
|---|---|---|
| **Créditos HX (como pantalla independiente)** | Pantalla redundante dedicada solo a ver números y gráficos financieros. | **FUSIONADO:** No amerita una pantalla solitaria. Se integró directamente como tarjeta principal dentro de *Mis Referidos* y como métrica en el *Inicio*. |
| **Beneficios** | Niveles complejos (Member, Partner, VIP) con porcentajes visibles de comisión. | **ELIMINADO:** Fomentaba expectativas burocráticas y revelaba márgenes de costos. Todos los clientes de HummingX reciben atención VIP de primer nivel. |
| **Servicios (Catálogo/Tienda)** | Catálogo e-commerce para "comprar servicios con un clic" usando créditos. | **ELIMINADO:** HummingX BI es una firma de consultoría y desarrollo a la medida (high-ticket), no un e-commerce enlatado. Cada requerimiento se analiza personalmente. |
| **Soporte (Pantalla de Tickets)** | Sistema complejo de tickets de ayuda, SLAs y formularios burocráticos. | **ELIMINADO:** Distante e impersonal. Se reemplazó por atención directa y ágil por WhatsApp oficial. |

---

## 4. Reglas de Negocio del Programa de Afiliados

### 🔒 Regla de Oro: *"Mostrar el Beneficio, Proteger la Fórmula"*

1. **Estricta Confidencialidad de Precios (Cero Porcentajes Visibles):**
   * **Queda estrictamente prohibido mostrar porcentajes (ej. 10%, 12%, 15%)** en cualquier pantalla del portal o en la landing page.
   * *Razón matemática:* Si un cliente sabe que gana el 10% y recibe 20,000 Créditos HX, deduce instantáneamente por regla de 3 que el contrato de su colega se cerró en $200,000 MXN. Esto viola el secreto comercial y los acuerdos de confidencialidad (NDA).
2. **Cero Exposición de Importes Facturados a Terceros:**
   * El afiliado únicamente visualiza el estatus de la empresa recomendada y los Créditos HX que se le acreditaron a su propia cuenta. Jamás ve el valor total del contrato, cotizaciones ni márgenes.
3. **Naturaleza de los Créditos HX:**
   * **Equivalencia:** 1 Crédito HX = $1.00 MXN en valor de canje referencial.
   * **Aplicabilidad:** Los créditos se redimen en horas de consultoría, mantenimiento evolutivo, nuevas funcionalidades o extensiones de software directamente con HummingX BI.
   * **Gestión Personalizada:** El portal incluye la nota oficial: *"Tus créditos se aplican directamente en el crecimiento de tu solución y se coordinan en conjunto con los fundadores según las necesidades de tu empresa."*
4. **Ciclo de Estados del Referido:**
   * `Registrado` ➔ Se recibió el contacto y se está evaluando.
   * `En conversación` ➔ El equipo de HummingX está en fase de propuesta o negociación.
   * `Proyecto Concretado` ➔ Proyecto cerrado exitosamente; se liberan los Créditos HX al referidor.
   * `Inactivo` ➔ La empresa recomendada no concretó proyecto en el periodo evaluado.

---

## 5. Metodología de Proyecto: Las 6 Fases Oficiales

El Stepper visual del módulo `Mi Proyecto` debe reflejar fielmente las 6 fases de ingeniería de la firma:

| Fase | Nombre | Descripción ejecutiva para el cliente |
|---|---|---|
| **Fase 1** | **Análisis** | Levantamiento formal de requerimientos técnicos, arquitectura y alcance del proyecto. |
| **Fase 2** | **Diseño** | Creación de wireframes, arquitectura de información y prototipo visual interactivo de alta fidelidad. |
| **Fase 3** | **Desarrollo** | Construcción de código, base de datos, APIs y lógica de ingeniería por el equipo de software. |
| **Fase 4** | **Revisión** | Pruebas de calidad (QA), ajustes funcionales y validación conjunta con el cliente. |
| **Fase 5** | **Lanzamiento** | Despliegue en servidores de producción, configuración de dominios y puesta en marcha oficial. |
| **Fase 6** | **Activo** | Sistema en vivo con soporte preventivo, monitoreo y acompañamiento continuo. |

---

## 6. Seguridad y Control de Acceso (Auth)

* **Sin Auto-Registro Abierto:** No existe formulario público de registro libre para evitar cuentas huérfanas de usuarios que no son clientes activos.
* **Modelo por Invitación:** Los fundadores crean la cuenta del cliente desde el panel administrativo (nombre, empresa, correo oficial). El cliente recibe una bienvenida con enlace para establecer su contraseña segura.
* **Sesiones Seguras:** Autenticación mediante tokens JWT cifrados con expiración controlada y almacenamiento seguro en el frontend.

---

## 7. Identidad Visual y Estilo

* **Tema del Portal de Clientes:** Superficies claras (`#F8FAFC` / `#FFFFFF`), bordes finos (`#E2E8F0`), acentos en **Cian Tecnológico (`#00C4CC`)** y detalles de jerarquía en **Púrpura Corporativo (`#4B1D6F`)**.
* **Tema del Panel de Administrador:** Fondo sobrio en modo oscuro (`#0B0F19` / Midnight Card) para distinguir operativamente el entorno de control interno del entorno de cara al cliente.
* **Tipografía:** *Plus Jakarta Sans* / *Inter* para máxima legibilidad de datos y métricas.
* **Iconografía:** 100% `lucide-react` (prohibido el uso de emojis en interfaces del portal).
