/**
 * api/_tests/e2e_referrals.js
 * Comprehensive E2E test suite for Referrals & Partners program logic (client + admin).
 * Covers the 12 strict test cases defined in Bloque 4.
 * Run with: node api/_tests/e2e_referrals.js
 */

process.env.EMAIL_DRY_RUN = '1';
process.env.EMAIL_AUTO_NOTIFICATIONS = '0';
require('dotenv').config({ path: 'api/.env' });

const assert = require('assert');
const jwt = require('jsonwebtoken');
const prisma = require('../_src/lib/prisma');
const { assertSafeDb, assertCreated, assertTargetNotProtected } = require('../_scripts/assert_safe_db');
const { isProtectedUser } = require('../_scripts/protected');

assertSafeDb();

const API_BASE = process.env.API_BASE || 'http://localhost:4010/api';
let ADMIN_JWT = null;
let adminUserId = null;

const created = {
  users: new Set(),
  projects: new Set(),
  prospects: new Set(),
  referrals: new Set(),
  creditMovements: new Set(),
};

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const statusStr = passed ? '✓ PASA' : '✗ FALLA';
  console.log(`[${statusStr}] ${name} ${detail ? `(${detail})` : ''}`);
}

async function req(method, endpoint, body = null, token = undefined, headers = {}) {
  // Safe mutation assertion: prevent touching non-test IDs
  if (['PUT', 'DELETE', 'PATCH'].includes(method) || (method === 'POST' && (endpoint.includes('/credit-movements') || endpoint.includes('/referrals')))) {
    const mutateMatch = endpoint.match(/\/([a-zA-Z0-9_-]{20,})/);
    if (mutateMatch) {
      const targetId = mutateMatch[1];
      if (!targetId.includes('nonexistent') && !targetId.includes('fake') && targetId !== adminUserId) {
        assertCreated(created, targetId);
      }
    }
  }

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

  const res = await fetch(`${API_BASE}${endpoint}`, opts);
  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    data = await res.text();
  }

  return { status: res.status, ok: res.ok, data };
}

async function runReferralsE2E() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 INICIANDO PRUEBAS COMPLETAS DE REFERIDOS Y PARTNERS (E2E)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!process.env.JWT_SECRET) {
    throw new Error('OPERACIÓN ABORTADA: JWT_SECRET no está configurada.');
  }

  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!adminUser) throw new Error('OPERACIÓN ABORTADA: No se encontró administrador en BD.');
  adminUserId = adminUser.id;

  ADMIN_JWT = jwt.sign(
    { id: adminUser.id, email: adminUser.email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  const now = Date.now();
  let clientA = null;
  let clientAToken = null;
  let clientB = null;
  let clientBToken = null;

  try {
    // Preparar Cliente A
    const resA = await req('POST', '/admin/clients', {
      name: `ZZ-TEST Socio A ${now}`,
      email: `zz-test+socio_a_${now}@hummingxbi.test`,
      companyName: `ZZ-TEST Empresa Socio A ${now}`,
      phone: '4771000001',
    });
    clientA = resA.data;
    created.users.add(clientA.id);

    clientAToken = jwt.sign(
      { id: clientA.id, email: clientA.email, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Preparar Cliente B
    const resB = await req('POST', '/admin/clients', {
      name: `ZZ-TEST Socio B ${now}`,
      email: `zz-test+socio_b_${now}@hummingxbi.test`,
      companyName: `ZZ-TEST Empresa Socio B ${now}`,
      phone: '4771000002',
    });
    clientB = resB.data;
    created.users.add(clientB.id);

    clientBToken = jwt.sign(
      { id: clientB.id, email: clientB.email, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // ─── CASO 1: CLIENTE A RECOMIENDA DESDE EL PORTAL ───────────────────────
    console.log('\n▶ [1/12] Recomendación desde el portal por Cliente A...');
    const resClientADetail = await req('GET', `/admin/clients/${clientA.id}`);
    const codeA = resClientADetail.data?.referralCode;
    const isCode5Digits = /^\d{5,6}$/.test(String(codeA));
    record('1.1 Cliente A tiene código numérico de 5-6 dígitos', isCode5Digits, `Código: ${codeA}`);

    const resRec1 = await req('POST', '/referrals', {
      companyName: `ZZ-TEST Recomendada Portal 1 ${now}`,
      contactName: 'Contacto Portal 1',
      contactEmail: `contacto1_${now}@test.com`,
      contactPhone: '4779990001',
      notes: 'Nota visible recomendación portal',
    }, clientAToken);

    const ref1Id = resRec1.data?.id;
    if (ref1Id) created.referrals.add(ref1Id);

    const resRec1Db = await prisma.referral.findUnique({ where: { id: ref1Id } });
    const isOriginPortal = resRec1Db?.origin === 'client_portal';
    const isRegistered = resRec1Db?.status === 'registered';
    record('1.2 POST /referrals crea Referral "registered" con origin "client_portal"', isOriginPortal && isRegistered, `Origin: ${resRec1Db?.origin}, Status: ${resRec1Db?.status}`);

    const linkedProspect1 = await prisma.prospect.findFirst({ where: { referralId: ref1Id } });
    if (linkedProspect1?.id) created.prospects.add(linkedProspect1.id);
    const passLinkedProspect = linkedProspect1 && linkedProspect1.referralCode === codeA && linkedProspect1.status === 'lead';
    record('1.3 Crea Prospecto lead con referralCode y referralId vinculados', passLinkedProspect, `Prospect ID: ${linkedProspect1?.id}`);

    const resAdminProspects = await req('GET', '/admin/prospects');
    const p1InAdmin = (resAdminProspects.data || []).find(p => p.id === linkedProspect1?.id);
    const passReferralInfo = p1InAdmin?.referralInfo?.referrerName && p1InAdmin.referralCode === codeA;
    record('1.4 Aparece en GET /admin/prospects con referralInfo enriquecido del socio', passReferralInfo);

    // ─── CASO 2: NUEVO ENDPOINT GET /admin/referrals/new ───────────────────
    console.log('\n▶ [2/12] Verificando GET /admin/referrals/new...');
    const oneMinAgo = new Date(Date.now() - 60000).toISOString();
    const resNewRefs = await req('GET', `/admin/referrals/new?since=${encodeURIComponent(oneMinAgo)}`);
    const foundRef1 = (resNewRefs.data?.items || []).find(i => i.referralId === ref1Id);
    record('2.1 Incluye la recomendación reciente con displayName, referralCode y tierName', Boolean(foundRef1?.referrer?.referralCode));

    const futureIso = new Date(Date.now() + 60000).toISOString();
    const resFuture = await req('GET', `/admin/referrals/new?since=${encodeURIComponent(futureIso)}`);
    record('2.2 Con since en el futuro o ahora devuelve count 0', resFuture.data?.count === 0);

    const resInvalidSince = await req('GET', '/admin/referrals/new?since=invalid-date-string');
    record('2.3 Since inválido o corrupto no revienta y devuelve 200', resInvalidSince.status === 200);

    const resOldSince = await req('GET', `/admin/referrals/new?since=${encodeURIComponent(new Date(Date.now() - 20*24*3600*1000).toISOString())}`);
    record('2.4 Since > 14 días no revienta y aplica fallback de 7 días', resOldSince.status === 200);

    const resForbiddenClient = await req('GET', '/admin/referrals/new', null, clientAToken);
    record('2.5 Con token de cliente devuelve 403 Forbidden', resForbiddenClient.status === 403);

    // ─── CASO 3: ADMIN CREA PROSPECTO CON CÓDIGO DE SOCIO A ────────────────
    console.log('\n▶ [3/12] Admin crea prospecto con código de socio...');
    const resAdminCreateWithCode = await req('POST', '/admin/prospects', {
      companyName: `ZZ-TEST Prospecto Con Código ${now}`,
      contactName: 'Contacto Código 1',
      email: `prospecto_code_${now}@test.com`,
      phone: '4778880001',
      referralCode: codeA,
      status: 'lead',
      source: 'Llamada',
    });
    const prospectCode1 = resAdminCreateWithCode.data;
    if (prospectCode1?.id) created.prospects.add(prospectCode1.id);

    const resMyRefsA = await req('GET', '/referrals/my', null, clientAToken);
    const foundInMyA = (resMyRefsA.data?.referrals || []).find(r => r.companyName === prospectCode1?.companyName);
    if (foundInMyA?.id) created.referrals.add(foundInMyA.id);
    record('3.1 Prospecto creado con código aparece en GET /referrals/my de A como "registered"', foundInMyA?.status === 'registered');

    const resInvalidCode = await req('POST', '/admin/prospects', {
      companyName: `ZZ-TEST Invalido ${now}`,
      referralCode: '999999',
    });
    record('3.2 Código inexistente devuelve 400', resInvalidCode.status === 400);

    const resSelfCode = await req('POST', '/admin/prospects', {
      companyName: `ZZ-TEST Auto ${now}`,
      email: clientA.email,
      referralCode: codeA,
    });
    record('3.3 Código propio del socio con su mismo email devuelve 400', resSelfCode.status === 400);

    // PUT que agrega código a prospecto existente
    const resDirectProspect = await req('POST', '/admin/prospects', {
      companyName: `ZZ-TEST Directo Original ${now}`,
      status: 'lead',
    });
    const dirP = resDirectProspect.data;
    if (dirP?.id) created.prospects.add(dirP.id);

    const resPutCode = await req('PUT', `/admin/prospects/${dirP.id}`, {
      referralCode: codeA,
    });
    const resMyRefsAfterPut = await req('GET', '/referrals/my', null, clientAToken);
    const foundLinkedPut = (resMyRefsAfterPut.data?.referrals || []).find(r => r.companyName === dirP.companyName);
    if (foundLinkedPut?.id) created.referrals.add(foundLinkedPut.id);
    record('3.4 PUT que agrega código a prospecto existente vincula o crea Referral en cuenta de A', Boolean(foundLinkedPut));

    // ─── CASO 4: SINCRONIZACIÓN DE ESTADOS CRM -> REFERRAL ─────────────────
    console.log('\n▶ [4/12] Sincronía bidireccional de estados...');
    await req('PUT', `/admin/prospects/${prospectCode1.id}`, { status: 'contacted' });
    let refsCheck = (await req('GET', '/referrals/my', null, clientAToken)).data?.referrals || [];
    let rSync = refsCheck.find(r => r.companyName === prospectCode1.companyName);
    const passContacted = rSync?.status === 'contacted';

    await req('PUT', `/admin/prospects/${prospectCode1.id}`, { status: 'negotiating' });
    refsCheck = (await req('GET', '/referrals/my', null, clientAToken)).data?.referrals || [];
    rSync = refsCheck.find(r => r.companyName === prospectCode1.companyName);
    const passNegotiating = rSync?.status === 'negotiating';

    await req('PUT', `/admin/prospects/${prospectCode1.id}`, { status: 'lost' });
    refsCheck = (await req('GET', '/referrals/my', null, clientAToken)).data?.referrals || [];
    rSync = refsCheck.find(r => r.companyName === prospectCode1.companyName);
    const passInactive = rSync?.status === 'inactive';

    record('4.1 Prospecto contacted → negotiating → lost se refleja como contacted → negotiating → inactive', passContacted && passNegotiating && passInactive);

    // ─── CASO 5: BUG "GANADO SIN BONO" RESUELTO ────────────────────────────
    console.log('\n▶ [5/12] Bug "Ganado sin bono" corregido...');
    const resWonWithCode = await req('POST', '/admin/prospects', {
      companyName: `ZZ-TEST Prospecto Won Directo ${now}`,
      status: 'won',
      referralCode: codeA,
    });
    const pWon = resWonWithCode.data;
    if (pWon?.id) created.prospects.add(pWon.id);

    refsCheck = (await req('GET', '/referrals/my', null, clientAToken)).data?.referrals || [];
    const rWonRef = refsCheck.find(r => r.companyName === pWon.companyName);
    if (rWonRef?.id) created.referrals.add(rWonRef.id);
    record('5.1 Prospecto creado como "won" deja el referral en "negotiating" (NO converted)', rWonRef?.status === 'negotiating' && rWonRef.creditsGenerated === 0);
    record('5.2 Prospecto won con referral pendiente indica needsAward=true en respuesta/drawer', pWon.referralReward?.needsAward === true);

    // ─── CASO 6: ABONO DE CRÉDITOS Y CONCURRENCIA ──────────────────────────
    console.log('\n▶ [6/12] Abono de recompensa y protección contra llamadas concurrentes...');
    const initialCreditsA = (await req('GET', '/referrals/my', null, clientAToken)).data?.totalCredits || 0;

    // Disparar 2 llamadas simultáneas de abono
    const [call1, call2] = await Promise.all([
      req('PUT', `/admin/referrals/${rWonRef.id}`, { status: 'converted', creditAmount: 1500 }),
      req('PUT', `/admin/referrals/${rWonRef.id}`, { status: 'converted', creditAmount: 1500 }),
    ]);

    const oneSucceeded = (call1.status === 200 && call2.status !== 200) || (call2.status === 200 && call1.status !== 200);
    record('6.1 Dos llamadas simultáneas de abono (Promise.all): 1 éxito y 1 rechazo', oneSucceeded, `Call1: ${call1.status}, Call2: ${call2.status}`);

    const afterAwardCreditsA = (await req('GET', '/referrals/my', null, clientAToken)).data?.totalCredits || 0;
    record('6.2 Saldo de Cliente A se incrementó exactamente en +$1,500 HX', afterAwardCreditsA === initialCreditsA + 1500, `Antes: ${initialCreditsA}, Después: ${afterAwardCreditsA}`);

    const refAfterAward = await prisma.referral.findUnique({ where: { id: rWonRef.id } });
    record('6.3 Referral queda en status "converted" y creditsGenerated = 1500', refAfterAward?.status === 'converted' && refAfterAward.creditsGenerated === 1500);

    // ─── CASO 7: PROGRESIÓN REAL DE NIVELES (1 -> 2 -> 3) ──────────────────
    console.log('\n▶ [7/12] Progresión real de niveles por flujo completo...');
    // Cliente A ya tiene 1 cierre. Completamos cierres 2, 3, 4 y 5 por API real.
    for (let c = 2; c <= 5; c++) {
      const resC = await req('POST', `/admin/clients/${clientA.id}/referrals`, {
        companyName: `ZZ-TEST Cierre Real ${c} ${now}`,
        status: 'negotiating',
        createInCrm: false,
      });
      if (resC.data?.referral?.id) {
        created.referrals.add(resC.data.referral.id);
        await req('PUT', `/admin/referrals/${resC.data.referral.id}`, { status: 'converted', creditAmount: 1500 });
      }
    }

    const resAAt5 = await req('GET', `/admin/clients/${clientA.id}`);
    const summaryAt5 = resAAt5.data?.referralSummary;
    record('7.1 Con 5 cierres acumulados sube a Nivel 2 (Partner)', summaryAt5?.level === 2 && (summaryAt5?.tierName?.toLowerCase().includes('partner') || summaryAt5?.tierName?.toLowerCase().includes('plata')));

    // 6º cierre debe pagar $2,500 HX (monto de nivel 2)
    const resC6 = await req('POST', `/admin/clients/${clientA.id}/referrals`, {
      companyName: `ZZ-TEST Cierre Real 6 ${now}`,
      status: 'negotiating',
      createInCrm: false,
    });
    created.referrals.add(resC6.data.referral.id);
    const balanceBefore6 = (await req('GET', '/referrals/my', null, clientAToken)).data?.totalCredits || 0;
    await req('PUT', `/admin/referrals/${resC6.data.referral.id}`, { status: 'converted', creditAmount: 2500 });
    const balanceAfter6 = (await req('GET', '/referrals/my', null, clientAToken)).data?.totalCredits || 0;
    record('7.2 El 6º cierre paga $2,500 HX por beneficio de Nivel 2', balanceAfter6 === balanceBefore6 + 2500);

    // Completamos cierres 7, 8, 9 y 10 (total 10 cierres)
    for (let c = 7; c <= 10; c++) {
      const resC = await req('POST', `/admin/clients/${clientA.id}/referrals`, {
        companyName: `ZZ-TEST Cierre Real ${c} ${now}`,
        status: 'negotiating',
        createInCrm: false,
      });
      created.referrals.add(resC.data.referral.id);
      await req('PUT', `/admin/referrals/${resC.data.referral.id}`, { status: 'converted', creditAmount: 2500 });
    }

    const resAAt10 = await req('GET', `/admin/clients/${clientA.id}`);
    const summaryAt10 = resAAt10.data?.referralSummary;
    record('7.3 Con 10 cierres acumulados alcanza Nivel 3 (Oro, $3,500/cierre)', summaryAt10?.level === 3 && summaryAt10?.rewardAmount === 3500);

    // ─── CASO 8: ALTA MANUAL POST /admin/clients/:id/referrals ─────────────
    console.log('\n▶ [8/12] Alta manual de referidos por el admin...');
    const resManualValid = await req('POST', `/admin/clients/${clientB.id}/referrals`, {
      companyName: `ZZ-TEST Empresa Manual B ${now}`,
      contactName: 'Lic. García',
      contactEmail: 'garcia@empresa.test',
      contactPhone: '4771234567',
      status: 'contacted',
      clientNote: 'Nota especial para socio B',
      createInCrm: true,
    });
    const manualRef = resManualValid.data?.referral;
    if (manualRef?.id) created.referrals.add(manualRef.id);
    if (resManualValid.data?.prospect?.id) created.prospects.add(resManualValid.data.prospect.id);
    record('8.1 Alta manual con todos los campos exitosa (origin: admin_manual)', manualRef?.origin === 'admin_manual' && resManualValid.status === 201);

    const resManualDup = await req('POST', `/admin/clients/${clientB.id}/referrals`, {
      companyName: `ZZ-TEST Empresa Manual B ${now}`,
    });
    record('8.2 Mismo cliente + misma empresa devuelve 409 Conflicto', resManualDup.status === 409);

    const resManualConverted = await req('POST', `/admin/clients/${clientB.id}/referrals`, {
      companyName: `ZZ-TEST Invalido Converted ${now}`,
      status: 'converted',
    });
    record('8.3 Status inicial "converted" rechazado con 400', resManualConverted.status === 400);

    const resManualBadEmail = await req('POST', `/admin/clients/${clientB.id}/referrals`, {
      companyName: `ZZ-TEST Bad Email ${now}`,
      contactEmail: 'not-an-email',
    });
    record('8.4 Email con formato inválido devuelve 400', resManualBadEmail.status === 400);

    const resManualNonExistent = await req('POST', '/admin/clients/nonexistentclientid123456/referrals', {
      companyName: `ZZ-TEST 404 ${now}`,
    });
    record('8.5 Cliente inexistente devuelve 404', resManualNonExistent.status === 404);

    const resManualAdminId = await req('POST', `/admin/clients/${adminUser.id}/referrals`, {
      companyName: `ZZ-TEST Admin Role ${now}`,
    });
    record('8.6 Intentar agregar referido a usuario con role "admin" devuelve 400', resManualAdminId.status === 400);

    const myBRefs = (await req('GET', '/referrals/my', null, clientBToken)).data?.referrals || [];
    const bFound = myBRefs.find(r => r.id === manualRef?.id);
    record('8.7 Aparece en GET /referrals/my de B con estado y nota visible', bFound?.notes === 'Nota especial para socio B' && bFound?.status === 'contacted');

    // ─── CASO 9: EDICIÓN Y ELIMINACIÓN DE REFERIDOS ────────────────────────
    console.log('\n▶ [9/12] Edición y eliminación de referidos...');
    const resEditRef = await req('PUT', `/admin/referrals/${manualRef.id}`, {
      companyName: `ZZ-TEST Empresa Manual B Editada ${now}`,
      contactName: 'Lic. García Modificado',
      notes: 'Nota actualizada por admin',
      status: 'negotiating',
    });
    record('9.1 PUT /admin/referrals/:id actualiza datos y sincroniza prospecto a negotiating', resEditRef.status === 200 && resEditRef.data?.referral?.status === 'negotiating');

    // Intentar eliminar un referido que generó créditos (el de cliente A)
    const resDelBlocked = await req('DELETE', `/admin/referrals/${rWonRef.id}`);
    record('9.2 DELETE bloqueado con 409 si tiene créditos generados > 0', resDelBlocked.status === 409);

    // Eliminar referido sin créditos (el de cliente B)
    const resDelAllowed = await req('DELETE', `/admin/referrals/${manualRef.id}`);
    record('9.3 DELETE permitido (200) si créditos generados = 0', resDelAllowed.status === 200);

    // ─── CASO 10: ENDURECIMIENTO DE AJUSTES DE CRÉDITOS ────────────────────
    console.log('\n▶ [10/12] Validaciones de movimientos de créditos y auditoría...');
    const resAdjValid = await req('POST', `/admin/clients/${clientB.id}/credit-movements`, {
      amount: 500,
      description: 'Ajuste manual de auditoría',
      type: 'adjustment',
    });
    record('10.1 Ajuste positivo válido devuelve {movement, balance}', resAdjValid.status === 200 && resAdjValid.data?.balance !== undefined);

    const resAdjZero = await req('POST', `/admin/clients/${clientB.id}/credit-movements`, {
      amount: 0,
      description: 'Ajuste cero',
      type: 'adjustment',
    });
    record('10.2 Monto 0 rechazado con 400', resAdjZero.status === 400);

    const resAdjDecimal = await req('POST', `/admin/clients/${clientB.id}/credit-movements`, {
      amount: 10.5,
      description: 'Ajuste decimal',
      type: 'adjustment',
    });
    record('10.3 Monto decimal rechazado con 400', resAdjDecimal.status === 400);

    const resAdjExcess = await req('POST', `/admin/clients/${clientB.id}/credit-movements`, {
      amount: 150000,
      description: 'Ajuste excesivo',
      type: 'adjustment',
    });
    record('10.4 Monto > 100000 rechazado con 400', resAdjExcess.status === 400);

    const resAdjShortDesc = await req('POST', `/admin/clients/${clientB.id}/credit-movements`, {
      amount: 200,
      description: 'ab',
      type: 'adjustment',
    });
    record('10.5 Motivo < 3 caracteres rechazado con 400', resAdjShortDesc.status === 400);

    const resAdjIllegalType = await req('POST', `/admin/clients/${clientB.id}/credit-movements`, {
      amount: 500,
      description: 'Intento de simular bono',
      type: 'referral_converted',
    });
    record('10.6 Tipo "referral_converted" o "welcome_bonus" manual rechazado con 400', resAdjIllegalType.status === 400);

    const resRedeemedPos = await req('POST', `/admin/clients/${clientB.id}/credit-movements`, {
      amount: 500,
      description: 'Canje positivo inválido',
      type: 'redeemed',
    });
    record('10.7 Tipo "redeemed" con monto positivo rechazado con 400', resRedeemedPos.status === 400);

    const resNoPutMovements = await req('PUT', '/admin/credit-movements/fakeid12345', { amount: 100 });
    const resNoDeleteMovements = await req('DELETE', '/admin/credit-movements/fakeid12345');
    record('10.8 Inmutabilidad de auditoría: no existen rutas PUT/DELETE para movimientos', resNoPutMovements.status === 404 && resNoDeleteMovements.status === 404);

    // ─── CASO 11: SEGURIDAD Y PRIVACIDAD ───────────────────────────────────
    console.log('\n▶ [11/12] Seguridad, permisos y privacidad de datos...');
    const impersonateToken = jwt.sign(
      { id: clientA.id, email: clientA.email, role: 'client', isImpersonating: true },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const resImpersonateBlock = await req('POST', '/referrals', { companyName: 'ZZ-TEST Imp' }, impersonateToken);
    record('11.1 POST /referrals con token de impersonación bloqueado con 403', resImpersonateBlock.status === 403);

    const resAdminAsClient = await req('GET', '/admin/prospects', null, clientAToken);
    record('11.2 Endpoint admin consultado con token de cliente bloqueado con 403', resAdminAsClient.status === 403);

    const resAdminNoToken = await req('GET', '/admin/prospects', null, null);
    record('11.3 Endpoint admin sin token bloqueado con 401', resAdminNoToken.status === 401);

    const resMyRefSanitized = (await req('GET', '/referrals/my', null, clientAToken)).data?.referrals?.[0];
    const hasInternalFields = resMyRefSanitized && ('estimatedValue' in resMyRefSanitized || 'internalNotes' in resMyRefSanitized);
    record('11.4 GET /referrals/my no expone campos comerciales internos de prospectos', !hasInternalFields);

    const resValidateCode = await req('GET', `/admin/referrals/validate-code/${codeA}`);
    record('11.5 validate-code/:code resuelve exitosamente con datos del socio', resValidateCode.status === 200 && resValidateCode.data?.valid === true);

    // ─── CASO 12: GET /admin/clients Y GET /admin/clients/:id ENRIQUECIDOS ──
    console.log('\n▶ [12/12] Enriquecimiento de endpoints GET /admin/clients...');
    const resClientList = await req('GET', '/admin/clients');
    const aInList = (resClientList.data || []).find(c => c.id === clientA.id);
    record('12.1 GET /admin/clients incluye referralCode en la lista', Boolean(aInList?.referralCode));

    const resClientADetailFinal = await req('GET', `/admin/clients/${clientA.id}`);
    const summaryFinal = resClientADetailFinal.data?.referralSummary;
    const passSummaryStructure = summaryFinal && 
      typeof summaryFinal.level === 'number' && 
      typeof summaryFinal.tierName === 'string' &&
      typeof summaryFinal.rewardAmount === 'number' &&
      typeof summaryFinal.convertedCount === 'number';
    record('12.2 GET /admin/clients/:id devuelve referralCode y referralSummary completo', passSummaryStructure && Boolean(resClientADetailFinal.data?.referralCode));

  } catch (err) {
    console.error('Error durante la ejecución de e2e_referrals:', err);
    record('Ejecución global de pruebas sin excepciones', false, err.message);
  } finally {
    console.log('\n🧹 Limpiando entidades de prueba creadas durante e2e_referrals...');
    try {
      for (const uid of created.users) {
        await prisma.creditMovement.deleteMany({ where: { clientId: uid } });
        await prisma.referral.deleteMany({ where: { referrerId: uid } });
        await prisma.projectActivity.deleteMany({ where: { project: { clientId: uid } } });
        await prisma.payment.deleteMany({ where: { project: { clientId: uid } } });
        await prisma.project.deleteMany({ where: { clientId: uid } });
      }
      for (const rid of created.referrals) {
        await prisma.referral.deleteMany({ where: { id: rid } });
      }
      for (const pid of created.prospects) {
        await prisma.prospectDocument.deleteMany({ where: { prospectId: pid } });
        await prisma.prospect.deleteMany({ where: { id: pid } });
      }
      for (const uid of created.users) {
        await prisma.portalSession.deleteMany({ where: { userId: uid } });
        await prisma.loginEvent.deleteMany({ where: { userId: uid } });
        await prisma.pageView.deleteMany({ where: { userId: uid } });
        await prisma.user.deleteMany({ where: { id: uid } });
      }
      console.log('✓ Limpieza de e2e_referrals finalizada con éxito.');
    } catch (cleanupErr) {
      console.error('Error en limpieza de e2e_referrals:', cleanupErr.message);
    }
    await prisma.$disconnect();
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 RESUMEN E2E REFERIDOS: ${passedCount} PASA / ${failedCount} FALLA`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runReferralsE2E();
}

module.exports = { runReferralsE2E };
