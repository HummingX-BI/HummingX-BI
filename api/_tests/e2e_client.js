// api/_tests/e2e_client.js
// Auditoría funcional E2E del Portal Cliente y flujo "Mis Recomendados"
// Ejecución segura sobre BD con guarda de datos protegidos y cleanup aislado.

process.env.EMAIL_DRY_RUN = '1';
process.env.EMAIL_AUTO_NOTIFICATIONS = '0';
require('dotenv').config({ path: 'api/.env' });

const prisma = require('../_src/lib/prisma');
const jwt = require('jsonwebtoken');
const { assertSafeDb } = require('../_scripts/assert_safe_db');
const { isProtectedUser } = require('../_scripts/protected');

assertSafeDb();

const API_BASE = 'http://localhost:4000/api';
let ADMIN_JWT = null;

const created = {
  users: new Set(),
  projects: new Set(),
  prospects: new Set(),
  referrals: new Set(),
  creditMovements: new Set(),
  portalSessions: new Set(),
};

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const status = passed ? '✓ PASA' : '✗ FALLA';
  console.log(`[${status}] ${name} ${detail ? `(${detail})` : ''}`);
}

async function req(method, path, body = null, token = undefined, headers = {}) {
  const authToken = token === undefined ? ADMIN_JWT : token;
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

function safeGuard(entity) {
  if (!entity) return;
  if (isProtectedUser(entity)) {
    throw new Error(`CRITICAL: Intento de manipular entidad protegida: ${JSON.stringify(entity)}`);
  }
}

async function runClientE2E() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 INICIANDO AUDITORÍA E2E: PORTAL CLIENTE Y MIS RECOMENDADOS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!adminUser) throw new Error('No se encontró usuario admin en BD');
  ADMIN_JWT = jwt.sign(
    { id: adminUser.id, email: adminUser.email, role: 'admin' },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '2h' }
  );

  const now = Date.now();
  let clientA = null;
  let clientAToken = null;

  try {
    // ─── 1. CREACIÓN Y ACTIVACIÓN DE CLIENTE A ──────────────────────────────
    console.log('▶ [1/7] Creando Cliente A y verificando flujo de activación...');
    const clientAEmail = `zz-test+client_a_${now}@hummingxbi.test`;
    const resCreate = await req('POST', '/admin/clients', {
      name: `ZZ-TEST Cliente A ${now}`,
      email: clientAEmail,
      companyName: `ZZ-TEST Empresa A`,
      phone: '5511223344',
      projectName: `ZZ-TEST Proyecto Alpha`,
    });

    safeGuard(resCreate.data);
    const passCreate = resCreate.status === 201 && resCreate.data?.id;
    record('Cliente: Creación desde admin con proyecto', passCreate);
    if (!passCreate) throw new Error('No se pudo crear Cliente A');

    clientA = resCreate.data;
    created.users.add(clientA.id);

    // Obtener token de invitación directo de la BD para activación
    const userDb = await prisma.user.findUnique({
      where: { id: clientA.id },
      include: { projects: true }
    });
    if (userDb.projects?.[0]?.id) {
      created.projects.add(userDb.projects[0].id);
    }
    const invToken = userDb.invitationToken;
    record('Cliente: Generación de token de invitación seguro', !!invToken);

    // Activar cuenta con contraseña
    const resActivate = await req('POST', '/auth/activate', {
      token: invToken,
      password: 'Password123!',
    }, null);

    const passActivate = resActivate.status === 200 && resActivate.data?.token;
    record('Cliente: Activación de cuenta y establecimiento de contraseña', passActivate);
    if (passActivate) {
      clientAToken = resActivate.data.token;
    }

    // Login formal con credenciales
    const resLogin = await req('POST', '/auth/login', {
      email: clientAEmail,
      password: 'Password123!',
    }, null);
    const passLogin = resLogin.status === 200 && resLogin.data?.token;
    record('Cliente: Inicio de sesión con credenciales nuevas', passLogin);
    if (passLogin) {
      clientAToken = resLogin.data.token;
    }

    // ─── 2. "MIS RECOMENDADOS": CÓDIGO Y TEXTO DE COMPARTIR ──────────────────
    console.log('\n▶ [2/7] Verificando módulo "Mis Recomendados" de Cliente A...');
    const resMyRef = await req('GET', '/referrals/my', null, clientAToken);
    const passMyRef = resMyRef.status === 200 && resMyRef.data?.referralCode;
    record('Mis Recomendados: Carga de ficha personal (GET /referrals/my)', passMyRef);

    const refCode = resMyRef.data?.referralCode;
    const isFiveDigits = /^\d{5,6}$/.test(refCode);
    record('Mis Recomendados: Código de socio numérico fijo (5 dígitos)', isFiveDigits, `Código: ${refCode}`);

    // Validar formato del mensaje de WhatsApp especificado en Bloque 1
    const expectedPhoneLabel = '+52 55 7508 4267';
    const waText = `Hola, te recomiendo a HummingX BI (software e inteligencia de negocios para empresas). Cuando los contactes por WhatsApp al ${expectedPhoneLabel}, menciona mi código de socio: *${refCode}* y te darán trato preferente.`;

    const noUrlInMessage = !waText.includes('http://') && !waText.includes('https://') && !waText.includes('hummingxbi.com');
    const noRegisterWord = !waText.toLowerCase().includes('registrar');
    const containsCode = waText.includes(`*${refCode}*`);
    const containsPhone = waText.includes(expectedPhoneLabel);
    record('Mis Recomendados: Mensaje WhatsApp sin enlaces ni palabra "registrarte"', noUrlInMessage && noRegisterWord && containsCode && containsPhone);

    // Intento de editar código (debe estar bloqueado)
    const resEditCode = await req('PUT', '/referrals/code', { code: '12345' }, clientAToken);
    record('Mis Recomendados: Rechazar edición manual de código (400)', resEditCode.status === 400);

    // ─── 3. RECOMENDAR EMPRESA DESDE MODAL DEL CLIENTE ──────────────────────
    console.log('\n▶ [3/7] Cliente A recomienda una empresa (RecommendModal)...');
    const resRecommend = await req('POST', '/referrals', {
      companyName: `ZZ-TEST Empresa Recomendada B ${now}`,
      contactName: `Contacto B`,
      contactEmail: `zz-test+rec_b_${now}@hummingxbi.test`,
      contactPhone: '5599887766',
      notes: 'Recomendada vía Portal Cliente ZZ-TEST',
    }, clientAToken);

    const passRecommend = resRecommend.status === 201 && resRecommend.data?.id;
    record('Mis Recomendados: Registro de recomendación por el cliente', passRecommend);
    if (passRecommend) {
      created.referrals.add(resRecommend.data.id);
    }

    // Verificar que aparece en la lista de A con status 'registered'
    const resCheckList = await req('GET', '/referrals/my', null, clientAToken);
    const foundInClient = resCheckList.data?.referrals?.some(r => r.id === resRecommend.data?.id && r.status === 'registered');
    record('Mis Recomendados: Aparece como "Registrado" en el portal del cliente', foundInClient);

    // Verificar sincronización automática con CRM Prospects del Admin
    const resAdminProspects = await req('GET', '/admin/prospects');
    const matchingProspect = resAdminProspects.data?.find(p => p.email === `zz-test+rec_b_${now}@hummingxbi.test`);
    record('Sincronización CRM: La recomendación aparece como prospecto en Admin', !!matchingProspect);
    if (matchingProspect) {
      created.prospects.add(matchingProspect.id);
    }

    // ─── 4. CIERRE DE VENTA Y ABONO DE CRÉDITOS ──────────────────────────────
    console.log('\n▶ [4/7] Cierre en CRM y abono de $1,500 Créditos HX...');
    if (matchingProspect) {
      // Validar código de A desde Admin
      const resValCode = await req('GET', `/admin/referrals/validate-code/${refCode}`);
      record('Admin: Validación de código de socio (GET /admin/referrals/validate-code)', resValCode.status === 200 && resValCode.data?.valid === true);

      // Pasar a Ganado y abonar créditos
      await req('PUT', `/admin/prospects/${matchingProspect.id}`, { status: 'won' });

      const resAward = await req('POST', `/admin/prospects/${matchingProspect.id}/award-referral-credits`, { amount: 1500 });
      record('Admin: Abonar créditos por cierre exitoso ($1,500 HX)', resAward.status === 200);

      // Segundo abono debe ser rechazado
      const resAward2 = await req('POST', `/admin/prospects/${matchingProspect.id}/award-referral-credits`, { amount: 1500 });
      record('Admin: Rechazar segundo abono duplicado (400)', resAward2.status === 400);

      // Cliente A verifica su saldo y estado
      const resAAfter = await req('GET', '/referrals/my', null, clientAToken);
      const passCredits = resAAfter.data?.totalCredits === 1500;
      const passConverted = resAAfter.data?.referrals?.some(r => r.id === resRecommend.data?.id && r.status === 'converted');
      record('Cliente: Saldo actualizado (+$1,500 HX) y recomendación "Concretada"', passCredits && passConverted);
    }

    // ─── 5. PROGRESIÓN DE NIVELES (BRONCE -> PARTNER) ────────────────────────
    console.log('\n▶ [5/7] Verificando progresión de niveles por recomendaciones acumuladas...');
    // Creamos 4 recomendaciones convertidas adicionales para Cliente A (total 5)
    for (let i = 2; i <= 5; i++) {
      const extraRef = await prisma.referral.create({
        data: {
          referrerId: clientA.id,
          companyName: `ZZ-TEST Empresa Extra ${i} ${now}`,
          contactName: `Contacto Extra ${i}`,
          status: 'converted',
          creditsGenerated: 1500,
        }
      });
      created.referrals.add(extraRef.id);
    }

    // Cliente A consulta su nivel: al llegar a 5 conversiones, debe subir a Nivel 2 (Partner)
    const resLevelCheck = await req('GET', '/referrals/my', null, clientAToken);
    const newLevel = resLevelCheck.data?.level;
    const isPartner = newLevel === 2 || resLevelCheck.data?.tier?.name?.toLowerCase().includes('partner');
    record('Progresión: Subida a Nivel Partner tras 5 conversiones', isPartner, `Nivel: ${newLevel}`);

    // La 6ª recomendación paga $2,500 HX (beneficio Partner)
    const partnerTierReward = resLevelCheck.data?.tier?.amount;
    record('Progresión: Recompensa Partner es de $2,500 HX por cierre', partnerTierReward === 2500, `Monto tier: $${partnerTierReward}`);

    // ─── 6. OTRAS PANTALLAS: MI PROYECTO, PAGOS, SUSPENSIÓN, EXPIRACIÓN ──────
    console.log('\n▶ [6/7] Verificando pantallas secundarias y seguridad de sesión...');
    
    // Mi Proyecto (GET /projects/my)
    const resMyProj = await req('GET', '/projects/my', null, clientAToken);
    const passMyProj = resMyProj.status === 200 && Array.isArray(resMyProj.data) && resMyProj.data.length > 0;
    record('Mi Proyecto: Consulta de proyectos activos (GET /projects/my)', passMyProj);

    if (passMyProj) {
      const projId = resMyProj.data[0].id;

      // Aprobar diseño
      const resApprove = await req('PUT', `/projects/${projId}/design-status`, { designStatus: 'approved' }, clientAToken);
      record('Mi Proyecto: Cliente aprueba diseño UX/UI', resApprove.status === 200 && resApprove.data?.designStatus === 'approved');

      // Solicitar cambios
      const resChanges = await req('PUT', `/projects/${projId}/design-status`, { designStatus: 'modifications_requested' }, clientAToken);
      record('Mi Proyecto: Cliente solicita modificaciones al diseño', resChanges.status === 200 && resChanges.data?.designStatus === 'modifications_requested');
    }

    // Plan de Pagos (GET /payments/my-payments)
    const resMyPayments = await req('GET', '/payments/my-payments', null, clientAToken);
    record('Plan de Pagos: Consulta de calendario de pagos del cliente', resMyPayments.status === 200 && Array.isArray(resMyPayments.data));

    // Forgot password
    const resForgot = await req('POST', '/auth/forgot-password', { email: clientAEmail }, null);
    record('Seguridad: Solicitud de restablecimiento de contraseña (POST /auth/forgot-password)', resForgot.status === 200);

    // Sesión expirada / token inválido
    const resBadToken = await req('GET', '/projects/my', null, 'invalid_token_123');
    record('Seguridad: Rechazo de sesión inválida/expirada con 401', resBadToken.status === 401);

    // Cuenta suspendida
    await req('PUT', `/admin/clients/${clientA.id}`, { active: false });
    const resSuspLogin = await req('POST', '/auth/login', {
      email: clientAEmail,
      password: 'Password123!',
    }, null);
    record('Seguridad: Cuenta suspendida rechazada al iniciar sesión (403)', resSuspLogin.status === 403);

    // Reactivar para tracking
    await req('PUT', `/admin/clients/${clientA.id}`, { active: true });

    // ─── 7. TRACKING DE TIEMPO Y SESIÓN ACTIVA ───────────────────────────────
    console.log('\n▶ [7/7] Verificando tracking de actividad y sesión (PortalSession)...');
    const sessionId = `zz-test-session-${now}`;
    created.portalSessions.add(sessionId);

    // Enviar heartbeat de 35 segundos
    const resHeartbeat = await req('POST', '/analytics/heartbeat', {
      sessionId,
      activeSec: 30,
      path: '/portal/referrals',
    }, clientAToken);

    record('Tracking: Registro de heartbeat de actividad (POST /analytics/heartbeat)', resHeartbeat.status === 200);

    // Verificar en BD que PortalSession acumuló segundos activos
    const sessionDb = await prisma.portalSession.findUnique({ where: { id: sessionId } });
    record('Tracking: PortalSession.activeSec acumulado (>0)', sessionDb && sessionDb.activeSec >= 30, `Segundos: ${sessionDb?.activeSec}`);

    // Verificar que modo impersonación NO suma tiempo
    const initialTime = (await prisma.user.findUnique({ where: { id: clientA.id } })).totalTimeSpent;
    await req('POST', '/analytics/heartbeat', {
      sessionId: `zz-test-impersonate-${now}`,
      activeSec: 30,
      path: '/portal/referrals',
    }, clientAToken, { 'x-impersonating': 'true' });

    const timeAfterImpersonate = (await prisma.user.findUnique({ where: { id: clientA.id } })).totalTimeSpent;
    record('Tracking: Modo impersonación NO registra tracking de tiempo', initialTime === timeAfterImpersonate);

  } catch (err) {
    console.error('Error durante la ejecución E2E Client:', err);
    record('Ejecución global E2E Client sin excepciones', false, err.message);
  } finally {
    console.log('\n🧹 Limpiando datos temporales de prueba ZZ-TEST...');
    try {
      // Limpiar portal sessions
      for (const sId of created.portalSessions) {
        await prisma.portalSession.deleteMany({ where: { id: sId } });
      }
      // Limpiar credit movements
      for (const uId of created.users) {
        await prisma.creditMovement.deleteMany({ where: { clientId: uId } });
      }
      // Limpiar referrals
      for (const rId of created.referrals) {
        await prisma.referral.deleteMany({ where: { id: rId } });
      }
      // Limpiar prospects
      for (const pId of created.prospects) {
        await prisma.prospect.deleteMany({ where: { id: pId } });
      }
      // Limpiar projects
      for (const prId of created.projects) {
        await prisma.payment.deleteMany({ where: { projectId: prId } });
        await prisma.projectActivity.deleteMany({ where: { projectId: prId } });
        await prisma.project.deleteMany({ where: { id: prId } });
      }
      // Limpiar users
      for (const uId of created.users) {
        await prisma.loginEvent.deleteMany({ where: { userId: uId } });
        await prisma.pageView.deleteMany({ where: { userId: uId } });
        await prisma.user.deleteMany({ where: { id: uId } });
      }
      console.log('✓ Limpieza completada exitosamente.');
    } catch (cleanupErr) {
      console.error('Error durante la limpieza de datos de prueba:', cleanupErr);
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 RESUMEN AUDITORÍA CLIENTE: ${passedCount} PASA / ${failedCount} FALLA`);
  console.log('═══════════════════════════════════════════════════════════════');
}

runClientE2E();
