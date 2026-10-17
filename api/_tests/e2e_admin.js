/**
 * api/_tests/e2e_admin.js
 * Comprehensive E2E test suite for Admin functionalities.
 * Run with: node api/_tests/e2e_admin.js
 */

process.env.EMAIL_DRY_RUN = '1';
process.env.EMAIL_AUTO_NOTIFICATIONS = '0';
require('dotenv').config({ path: 'api/.env' });

const assert = require('assert');
const jwt = require('jsonwebtoken');
const prisma = require('../_src/lib/prisma');
const { assertSafeDb, assertCreated } = require('../_scripts/assert_safe_db');
const { isProtectedUser } = require('../_scripts/protected');

assertSafeDb();

const API_BASE = process.env.API_BASE || 'http://localhost:4010/api';
let ADMIN_TOKEN = null;

// Registry of created IDs for safe deletion
const created = {
  users: new Set(),
  projects: new Set(),
  payments: new Set(),
  prospects: new Set(),
  appointments: new Set(),
  tasks: new Set(),
  expenses: new Set(),
  cards: new Set(),
  referrals: new Set(),
  movements: new Set(),
};

async function req(method, endpoint, body = null) {
  if (['PUT', 'DELETE', 'PATCH'].includes(method) || (method === 'POST' && (endpoint.includes('/credit-movements') || endpoint.includes('/referrals') || endpoint.includes('/notify-phase')))) {
    const mutateMatch = endpoint.match(/\/([a-zA-Z0-9_-]{20,})/);
    if (mutateMatch) {
      const targetId = mutateMatch[1];
      assertCreated(created, targetId);
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, ok: res.ok, data };
}

function safeGuard(target) {
  if (isProtectedUser(target)) {
    throw new Error(`CRITICAL: Attempted to touch protected user: ${JSON.stringify(target)}`);
  }
}

const results = [];
function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const statusStr = passed ? '✓ PASA' : '✗ FALLA';
  console.log(`[${statusStr}] ${name} ${detail ? `(${detail})` : ''}`);
}

async function run() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 INICIANDO AUDITORÍA FUNCIONAL ADMIN (E2E)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!process.env.JWT_SECRET) {
    throw new Error('OPERACIÓN ABORTADA: JWT_SECRET no está configurada.');
  }

  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!adminUser) {
    throw new Error('OPERACIÓN ABORTADA: No se encontró ningún administrador en la base de datos.');
  }

  ADMIN_TOKEN = jwt.sign(
    { id: adminUser.id, email: adminUser.email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  const now = Date.now();
  let clientA = null;
  let clientB = null;
  let clientAProject = null;
  let testProspect = null;

  try {
    // ─── 1. MÓDULO CLIENTES ──────────────────────────────────────────────
    console.log('▶ [1/8] Verificando módulo de Clientes...');

    // 1.1 Caso Feliz: Crear cliente con proyecto
    const resCreateWithProj = await req('POST', '/admin/clients', {
      name: `ZZ-TEST Cliente 1 ${now}`,
      companyName: `ZZ-TEST Empresa 1 ${now}`,
      email: `zz-test+c1_${now}@hummingxbi.test`,
      phone: '5512345678',
      createProject: true,
      projectName: `ZZ-TEST Proyecto Inicial ${now}`,
    });
    safeGuard(resCreateWithProj.data);
    const passC1 = resCreateWithProj.status === 201 && resCreateWithProj.data?.id;
    record('Clientes: Crear con proyecto (caso feliz)', passC1);
    if (passC1) {
      clientA = resCreateWithProj.data;
      created.users.add(clientA.id);
      if (clientA.projects?.[0]?.id) created.projects.add(clientA.projects[0].id);
    }

    // 1.2 Caso Feliz: Crear cliente sin proyecto
    const resCreateNoProj = await req('POST', '/admin/clients', {
      name: `ZZ-TEST Cliente 2 ${now}`,
      companyName: `ZZ-TEST Empresa 2 ${now}`,
      email: `zz-test+c2_${now}@hummingxbi.test`,
      createProject: false,
    });
    safeGuard(resCreateNoProj.data);
    const passC2 = resCreateNoProj.status === 201 && resCreateNoProj.data?.id;
    record('Clientes: Crear sin proyecto', passC2);
    if (passC2) {
      clientB = resCreateNoProj.data;
      created.users.add(clientB.id);
    }

    // 1.3 Inválido 1: Email vacío
    const resBadEmpty = await req('POST', '/admin/clients', {
      name: `ZZ-TEST Empty`,
      companyName: `ZZ-TEST Empty`,
      email: '',
    });
    record('Clientes: Rechazar email vacío (400)', resBadEmpty.status === 400);

    // 1.4 Inválido 2: Formato de email incorrecto
    const resBadFormat = await req('POST', '/admin/clients', {
      name: `ZZ-TEST Format`,
      companyName: `ZZ-TEST Format`,
      email: 'not-an-email',
    });
    record('Clientes: Rechazar formato inválido (400)', resBadFormat.status === 400);

    // 1.5 Inválido 3: Email duplicado (409)
    if (clientA) {
      const resDup = await req('POST', '/admin/clients', {
        name: `ZZ-TEST Dup`,
        companyName: `ZZ-TEST Dup`,
        email: clientA.email,
      });
      record('Clientes: Rechazar email duplicado (409)', resDup.status === 409);
    }

    // 1.6 Reenviar invitación (botón manual)
    if (clientA) {
      const resInvite = await req('POST', `/admin/clients/${clientA.id}/resend-invitation`);
      const passInvite = resInvite.status === 200 && Boolean(resInvite.data?.activationLink);
      record('Clientes: Reenviar invitación con enlace generado', passInvite);
    }

    // 1.7 Editar cliente
    if (clientA) {
      const resEdit = await req('PUT', `/admin/clients/${clientA.id}`, {
        name: `ZZ-TEST Cliente 1 Editado`,
        phone: '5599887766',
      });
      record('Clientes: Editar datos del cliente', resEdit.status === 200 && resEdit.data?.name === 'ZZ-TEST Cliente 1 Editado');
    }

    // 1.8 Suspender y Reactivar
    if (clientA) {
      const resSusp = await req('PUT', `/admin/clients/${clientA.id}/suspend`, { active: false });
      const resReact = await req('PUT', `/admin/clients/${clientA.id}/suspend`, { active: true });
      record('Clientes: Suspender y reactivar cuenta', resSusp.status === 200 && resReact.status === 200);
    }

    // 1.9 Verificación cruzada (GET /admin/clients/:id)
    if (clientA) {
      const resGet = await req('GET', `/admin/clients/${clientA.id}`);
      record('Clientes: Verificación cruzada GET /admin/clients/:id', resGet.status === 200 && resGet.data?.id === clientA.id);
      if (resGet.data?.projects?.[0]) {
        clientAProject = resGet.data.projects[0];
        created.projects.add(clientAProject.id);
      }
    }

    // 1.10 Notificación manual de fase (POST /admin/projects/:id/notify-phase)
    if (clientAProject) {
      const resNotifyValid = await req('POST', `/admin/projects/${clientAProject.id}/notify-phase`, { phase: 3 });
      record(
        'Proyectos: Notificar fase válida devuelve success y dryRun:true',
        resNotifyValid.status === 200 && resNotifyValid.data?.success === true && resNotifyValid.data?.dryRun === true
      );

      const resNotifyInvalid = await req('POST', `/admin/projects/${clientAProject.id}/notify-phase`, { phase: 99 });
      record(
        'Proyectos: Notificar fase inválida (99) devuelve 400',
        resNotifyInvalid.status === 400
      );
    }

    // ─── 2. MÓDULO PROSPECTOS Y REFERIDOS ────────────────────────────────
    console.log('\n▶ [2/8] Verificando módulo de Prospectos y Referidos...');

    // 2.1 Crear prospecto con código de socio válido de clientA
    const codeA = clientA?.referralCode;
    const resP1 = await req('POST', '/admin/prospects', {
      companyName: `ZZ-TEST Prospecto A1 ${now}`,
      contactName: `Contacto P1`,
      email: `zz-test+p1_${now}@hummingxbi.test`,
      phone: '5500001111',
      referralCode: codeA,
    });
    safeGuard(resP1.data);
    const passP1 = resP1.status === 201 && resP1.data?.id;
    record('Prospectos: Crear con código de socio válido', passP1);
    if (passP1) {
      testProspect = resP1.data;
      created.prospects.add(testProspect.id);
      if (testProspect.referralId) created.referrals.add(testProspect.referralId);
    }

    // 2.2 Crear con código inexistente
    const resPBadCode = await req('POST', '/admin/prospects', {
      companyName: `ZZ-TEST Inexistente ${now}`,
      contactName: `Contacto Invalido`,
      email: `zz-test+badcode_${now}@hummingxbi.test`,
      referralCode: '999999',
    });
    // Should either reject or create without referral attribution
    record('Prospectos: Manejo de código inexistente (no revienta)', resPBadCode.status === 200 || resPBadCode.status === 201 || resPBadCode.status === 400);
    if (resPBadCode.data?.id) created.prospects.add(resPBadCode.data.id);

    // 2.3 Editar prospecto
    if (testProspect) {
      const resPEdit = await req('PUT', `/admin/prospects/${testProspect.id}`, {
        contactName: 'Contacto P1 Editado',
        notes: 'Nota de seguimiento ZZ-TEST',
      });
      record('Prospectos: Editar información', resPEdit.status === 200);
    }

    // 2.4 Cambiar estado a 'negotiating' y luego 'won'
    if (testProspect) {
      await req('PUT', `/admin/prospects/${testProspect.id}`, { status: 'negotiating' });
      const resWon = await req('PUT', `/admin/prospects/${testProspect.id}`, { status: 'won' });
      record('Prospectos: Transición de estados hasta Ganado (won)', resWon.status === 200 && resWon.data?.status === 'won');
    }

    // 2.5 Convertir prospecto: caso inválido sin email
    const resPNoEmail = await req('POST', '/admin/prospects', {
      companyName: `ZZ-TEST Sin Email ${now}`,
      contactName: `Contacto Sin Email`,
    });
    if (resPNoEmail.data?.id) {
      created.prospects.add(resPNoEmail.data.id);
      const resConvNoEmail = await req('POST', `/admin/prospects/${resPNoEmail.data.id}/convert`, {});
      record('Prospectos: Convertir sin email rechazado (400)', resConvNoEmail.status === 400);
    }

    // 2.6 Convertir prospecto con email real
    let convertedClient = null;
    if (testProspect) {
      const resConv = await req('POST', `/admin/prospects/${testProspect.id}/convert`, {});
      const passConv = resConv.status === 200 && resConv.data?.client?.id;
      record('Prospectos: Convertir prospecto a cliente formal', passConv);
      if (passConv) {
        convertedClient = resConv.data.client;
        created.users.add(convertedClient.id);
        if (convertedClient.projects?.[0]?.id) created.projects.add(convertedClient.projects[0].id);
      }

      // 2.7 Idempotencia: segundo intento de conversión
      const resConv2 = await req('POST', `/admin/prospects/${testProspect.id}/convert`, {});
      record('Prospectos: Idempotencia en segunda conversión', resConv2.status === 200 && resConv2.data?.client?.id === convertedClient?.id);
    }

    // 2.8 Premiar créditos una sola vez y rechazo del segundo (doble clic simultáneo con Promise.all)
    if (testProspect) {
      const [call1, call2] = await Promise.all([
        req('POST', `/admin/prospects/${testProspect.id}/award-referral-credits`, { amount: 1500 }),
        req('POST', `/admin/prospects/${testProspect.id}/award-referral-credits`, { amount: 1500 }),
      ]);
      const successfulCalls = [call1, call2].filter(c => c.status === 200).length;
      const rejectedCalls = [call1, call2].filter(c => c.status === 400).length;
      record('Referidos: Abonar recompensa por cierre (+1500 HX)', successfulCalls === 1);
      record('Referidos: Rechazar segundo abono duplicado o simultáneo (400)', rejectedCalls === 1);
      if (call1.data?.referral?.id) created.referrals.add(call1.data.referral.id);
      if (call2.data?.referral?.id) created.referrals.add(call2.data.referral.id);
    }

    // ─── 3. MÓDULO CITAS ────────────────────────────────────────────────
    console.log('\n▶ [3/8] Verificando módulo de Citas...');
    let testAppointment = null;
    const tomorrow = new Date(Date.now() + 86400000).toISOString();

    const resApp1 = await req('POST', '/admin/appointments', {
      title: `ZZ-TEST Cita ${now}`,
      companyName: `ZZ-TEST Empresa ${now}`,
      dateTime: tomorrow,
      location: 'Ciudad de México',
      assignedTo: 'emmanuel',
    });
    const passApp1 = resApp1.status === 201 && resApp1.data?.id;
    record('Citas: Crear cita (caso feliz)', passApp1);
    if (passApp1) {
      testAppointment = resApp1.data;
      created.appointments.add(testAppointment.id);
    }

    // Inválido: Título vacío
    const resAppEmpty = await req('POST', '/admin/appointments', { title: '', companyName: 'Test', dateTime: tomorrow, location: 'CDMX' });
    record('Citas: Rechazar cita sin título (400)', resAppEmpty.status === 400);

    // Editar y minuta
    if (testAppointment) {
      const resAppEdit = await req('PUT', `/admin/appointments/${testAppointment.id}`, {
        title: `ZZ-TEST Cita Editada`,
        summary: 'Minuta con acuerdos tomados en la sesión ZZ-TEST',
      });
      record('Citas: Editar título y guardar minuta', resAppEdit.status === 200);

      // Cancelar
      const resAppCancel = await req('PUT', `/admin/appointments/${testAppointment.id}`, { status: 'cancelled' });
      record('Citas: Cancelar cita', resAppCancel.status === 200 && resAppCancel.data?.status === 'cancelled');
    }

    // ─── 4. MÓDULO TAREAS ────────────────────────────────────────────────
    console.log('\n▶ [4/8] Verificando módulo de Tareas...');
    let testTask = null;

    const resTask1 = await req('POST', '/admin/tasks', {
      title: `ZZ-TEST Tarea ${now}`,
      status: 'todo',
      priority: 'high',
    });
    const passTask1 = resTask1.status === 201 && resTask1.data?.id;
    record('Tareas: Crear tarea (caso feliz)', passTask1);
    if (passTask1) {
      testTask = resTask1.data;
      created.tasks.add(testTask.id);
    }

    // Inválido: Título vacío
    const resTaskEmpty = await req('POST', '/admin/tasks', { title: '' });
    record('Tareas: Rechazar tarea vacía (400)', resTaskEmpty.status === 400);

    // Completar y eliminar
    if (testTask) {
      const resTaskDone = await req('PUT', `/admin/tasks/${testTask.id}`, { status: 'done' });
      record('Tareas: Marcar como completada', resTaskDone.status === 200 && resTaskDone.data?.status === 'done');

      const resTaskDel = await req('DELETE', `/admin/tasks/${testTask.id}`);
      record('Tareas: Eliminar tarea', resTaskDel.status === 200);
      created.tasks.delete(testTask.id);
    }

    // ─── 5. MÓDULO FINANZAS ──────────────────────────────────────────────
    console.log('\n▶ [5/8] Verificando módulo de Finanzas...');
    let testExpense = null;

    const resExp1 = await req('POST', '/admin/expenses', {
      title: `ZZ-TEST Gasto Servidores ${now}`,
      amount: 450,
      category: 'infrastructure',
      date: new Date().toISOString().split('T')[0],
    });
    const passExp1 = resExp1.status === 201 && resExp1.data?.id;
    record('Finanzas: Registrar gasto operativo (caso feliz)', passExp1);
    if (passExp1) {
      testExpense = resExp1.data;
      created.expenses.add(testExpense.id);
    }

    const resFinGet = await req('GET', '/admin/finances/overview');
    record('Finanzas: Verificación cruzada de totales (GET /admin/finances/overview)', resFinGet.status === 200);

    // ─── 6. MÓDULO TARJETAS QR/NFC ───────────────────────────────────────
    console.log('\n▶ [6/8] Verificando módulo de Tarjetas QR/NFC...');
    let testCard = null;

    const cardCode = `99${now.toString().slice(-4)}`;
    const resCard1 = await req('POST', '/admin/nfc-cards', {
      code: cardCode,
      clientName: `ZZ-TEST Cliente ${now}`,
      targetUrl: 'https://hummingxbi.com',
      active: true,
    });
    const passCard1 = resCard1.status === 201 && resCard1.data?.id;
    record('Tarjetas: Crear tarjeta QR/NFC', passCard1);
    if (passCard1) {
      testCard = resCard1.data;
      created.cards.add(testCard.id);

      // Desvincular tarjeta
      const resUnlink = await req('POST', `/admin/nfc-cards/${testCard.id}/unlink`);
      record('Tarjetas: Desvincular tarjeta', resUnlink.status === 200);

      // Verificación cruzada
      const resCardsList = await req('GET', '/admin/nfc-cards');
      record('Tarjetas: Verificación cruzada GET /admin/nfc-cards', resCardsList.status === 200);
    }

    // ─── 7. MÓDULO PAGOS Y PLANES ────────────────────────────────────────
    console.log('\n▶ [7/8] Verificando módulo de Pagos y Planes...');
    const projId = clientA?.projects?.[0]?.id;

    if (projId) {
      // 7.1 Registrar plan de pagos
      const resPlan = await req('POST', '/payments/plan', {
        projectId: projId,
        replaceExisting: true,
        payments: [
          { title: 'ZZ-TEST Anticipo', amount: 5000, dueDate: '2026-11-01', status: 'completed' },
          { title: 'ZZ-TEST Entrega', amount: 5000, dueDate: '2026-12-01', status: 'pending' },
        ],
      });
      record('Pagos: Registrar lote/plan de pagos (POST /payments/plan)', resPlan.status === 201 || resPlan.status === 200);

      // Verificación cruzada de pagos
      const resListPay = await req('GET', `/payments/project/${projId}`);
      const passListPay = resListPay.status === 200 && Array.isArray(resListPay.data) && resListPay.data.length >= 2;
      record('Pagos: Verificación cruzada GET /payments/project/:id', passListPay);
      if (passListPay) {
        resListPay.data.forEach((p) => created.payments.add(p.id));
        const firstPayment = resListPay.data[0];

        // Editar estado de pago rápido
        const resPayStatus = await req('PUT', `/payments/${firstPayment.id}`, { status: 'overdue' });
        record('Pagos: Cambio rápido de estado a vencido', resPayStatus.status === 200 && resPayStatus.data?.status === 'overdue');
      }
    }

    // ─── 8. MÓDULO CRÉDITOS (AJUSTE MANUAL) ──────────────────────────────
    console.log('\n▶ [8/8] Verificando módulo de Créditos...');
    if (clientA) {
      // Ajuste positivo
      const resCredPos = await req('POST', `/admin/clients/${clientA.id}/credit-movements`, {
        amount: 1000,
        description: 'ZZ-TEST Ajuste bono fidelidad',
        type: 'adjustment',
      });
      record('Créditos: Ajuste manual positivo (+1000)', resCredPos.status === 201 || resCredPos.status === 200);

      // Ajuste negativo
      const resCredNeg = await req('POST', `/admin/clients/${clientA.id}/credit-movements`, {
        amount: -500,
        description: 'ZZ-TEST Ajuste canje servicio',
        type: 'redeemed',
      });
      record('Créditos: Ajuste manual negativo (-500)', resCredNeg.status === 201 || resCredNeg.status === 200);

      // Verificación de saldo final
      const resClientFinal = await req('GET', `/admin/clients/${clientA.id}`);
      // Initial +1500 (referral) + 1000 - 500 = 2000
      const passCredits = resClientFinal.data?.totalCredits === 2000;
      record('Créditos: Verificación cruzada de saldo consolidado ($2,000 HX)', passCredits);
    }

  } catch (err) {
    console.error('Error durante la ejecución E2E:', err);
    record('Ejecución global E2E sin excepciones', false, err.message);
  } finally {
    console.log('\n🧹 Limpiando datos temporales de prueba (ZZ-TEST)...');
    try {
      // Clean payments
      for (const pid of created.payments) {
        await prisma.payment.deleteMany({ where: { id: pid } });
      }
      // Clean appointments
      for (const aid of created.appointments) {
        await prisma.appointment.deleteMany({ where: { id: aid } });
      }
      // Clean tasks
      for (const tid of created.tasks) {
        await prisma.task.deleteMany({ where: { id: tid } });
      }
      // Clean expenses
      for (const eid of created.expenses) {
        await prisma.expense.deleteMany({ where: { id: eid } });
      }
      // Clean cards
      for (const cid of created.cards) {
        await prisma.nfcCard.deleteMany({ where: { id: cid } });
      }
      // Clean prospects & referrals
      for (const pid of created.prospects) {
        await prisma.prospect.deleteMany({ where: { id: pid } });
      }
      for (const rid of created.referrals) {
        await prisma.referral.deleteMany({ where: { id: rid } });
      }
      // Clean projects & movements & users
      for (const uid of created.users) {
        await prisma.creditMovement.deleteMany({ where: { clientId: uid } });
        await prisma.projectActivity.deleteMany({ where: { project: { clientId: uid } } });
        await prisma.payment.deleteMany({ where: { project: { clientId: uid } } });
        await prisma.project.deleteMany({ where: { clientId: uid } });
        await prisma.user.deleteMany({ where: { id: uid } });
      }
      console.log('✓ Limpieza completada exitosamente.');
    } catch (cleanupErr) {
      console.error('Error durante limpieza:', cleanupErr.message);
    }

    await prisma.$disconnect();
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 RESUMEN AUDITORÍA ADMIN: ${passedCount} PASA / ${failedCount} FALLA`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

run();
