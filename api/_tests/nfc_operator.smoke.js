const path = require('path');
const fs = require('fs');

// Load environment variables
const rootEnv = path.join(__dirname, '../../.env');
const apiEnv = path.join(__dirname, '../.env');
if (fs.existsSync(rootEnv)) {
  require('dotenv').config({ path: rootEnv });
} else if (fs.existsSync(apiEnv)) {
  require('dotenv').config({ path: apiEnv });
} else {
  require('dotenv').config();
}

const express = require('express');
const app = require('../index');
const http = require('http');

let server;
let baseUrl;

function makeRequest(method, pathUrl, token = null, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathUrl, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Iniciando Smoke Tests para Rol NFC_OPERATOR...\n');

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  try {
    // 1. Login con samuel@hummingxbi.com
    console.log('1. Probando Login de Samuel...');
    const loginRes = await makeRequest('POST', '/api/auth/login', null, {
      email: 'samuel@hummingxbi.com',
      password: 'SamuelNFC2026!'
    });

    if (loginRes.status !== 200 || !loginRes.data.token) {
      throw new Error(`Login falló con status ${loginRes.status}: ${JSON.stringify(loginRes.data)}`);
    }
    console.log(`   ✅ Login exitoso. Rol recibido: ${loginRes.data.user.role}`);
    if (loginRes.data.user.role !== 'nfc_operator') {
      throw new Error(`Rol esperado nfc_operator, recibido ${loginRes.data.user.role}`);
    }

    const samuelToken = loginRes.data.token;

    // 2. GET /auth/me
    console.log('\n2. Probando /api/auth/me...');
    const meRes = await makeRequest('GET', '/api/auth/me', samuelToken);
    if (meRes.status !== 200 || meRes.data.role !== 'nfc_operator') {
      throw new Error(`/auth/me falló: status ${meRes.status}, data: ${JSON.stringify(meRes.data)}`);
    }
    console.log(`   ✅ /auth/me respondió 200 con role: ${meRes.data.role}`);

    // 3. Acceso permitido a NFC: GET /api/admin/nfc-cards
    console.log('\n3. Probando GET /api/admin/nfc-cards con token de Samuel...');
    const nfcGetRes = await makeRequest('GET', '/api/admin/nfc-cards', samuelToken);
    if (nfcGetRes.status !== 200 || !Array.isArray(nfcGetRes.data.cards)) {
      throw new Error(`GET /admin/nfc-cards falló con status ${nfcGetRes.status}`);
    }
    console.log(`   ✅ GET /admin/nfc-cards respondió 200 (${nfcGetRes.data.cards.length} tarjetas encontradas)`);

    // 4. Bloqueo de rutas Admin generales (403 Forbidden para Samuel)
    console.log('\n4. Verificando que rutas administrativas generales estén estrictamente bloqueadas (403)...');

    const blockedEndpoints = [
      { method: 'GET', path: '/api/admin/clients', name: 'Listar clientes' },
      { method: 'POST', path: '/api/admin/clients', name: 'Crear cliente', body: { name: 'Test' } },
      { method: 'GET', path: '/api/admin/prospects', name: 'Listar prospectos' },
      { method: 'GET', path: '/api/admin/expenses', name: 'Listar finanzas/gastos' },
      { method: 'GET', path: '/api/payments', name: 'Listar todos los pagos' },
      { method: 'POST', path: '/api/referrals', name: 'Crear recomendación como cliente', body: { companyName: 'Test' } },
    ];

    for (const ep of blockedEndpoints) {
      const res = await makeRequest(ep.method, ep.path, samuelToken, ep.body);
      if (res.status === 403) {
        console.log(`   ✅ ${ep.method} ${ep.path} (${ep.name}) -> 403 Forbidden (BLOQUEADO CORRECTAMENTE)`);
      } else {
        throw new Error(`FALLO DE SEGURIDAD: ${ep.method} ${ep.path} devolvió ${res.status} en lugar de 403`);
      }
    }

    // 5. Crear, editar y desvincular tarjeta con prefijo ZZ-TEST
    console.log('\n5. Probando operaciones de tarjeta con token de Samuel (crear, editar, unlink)...');
    const testCode = '998';
    
    // Crear tarjeta de prueba
    const createRes = await makeRequest('POST', '/api/admin/nfc-cards', samuelToken, {
      code: testCode,
      clientName: 'ZZ-TEST Samuel Operator Store',
      type: 'google_reviews',
      targetUrl: 'https://g.page/r/test-review',
      active: true,
      notes: 'Test creado por operador Samuel'
    });

    if (createRes.status !== 201) {
      throw new Error(`POST /admin/nfc-cards falló con status ${createRes.status}: ${JSON.stringify(createRes.data)}`);
    }
    const cardId = createRes.data.id;
    console.log(`   ✅ Tarjeta #${testCode} creada con ID ${cardId}`);

    // QR de tarjeta
    const qrRes = await makeRequest('GET', `/api/admin/nfc-cards/${cardId}/qr`, samuelToken);
    if (qrRes.status !== 200 || !qrRes.data.qrDataUrl) {
      throw new Error(`GET /admin/nfc-cards/:id/qr falló: status ${qrRes.status}`);
    }
    console.log(`   ✅ QR generado exitosamente`);

    // Actualizar tarjeta
    const updateRes = await makeRequest('PUT', `/api/admin/nfc-cards/${cardId}`, samuelToken, {
      notes: 'Notas actualizadas por Samuel'
    });
    if (updateRes.status !== 200 || updateRes.data.notes !== 'Notas actualizadas por Samuel') {
      throw new Error(`PUT /admin/nfc-cards/:id falló`);
    }
    console.log(`   ✅ Tarjeta actualizada exitosamente`);

    // Unlink tarjeta
    const unlinkRes = await makeRequest('POST', `/api/admin/nfc-cards/${cardId}/unlink`, samuelToken);
    if (unlinkRes.status !== 200 || unlinkRes.data.active !== false) {
      throw new Error(`POST /admin/nfc-cards/:id/unlink falló`);
    }
    console.log(`   ✅ Tarjeta desvinculada exitosamente`);

    // Eliminar tarjeta de prueba (limpieza)
    const deleteRes = await makeRequest('DELETE', `/api/admin/nfc-cards/${cardId}`, samuelToken);
    if (deleteRes.status !== 200) {
      throw new Error(`DELETE /admin/nfc-cards/:id falló`);
    }
    console.log(`   ✅ Tarjeta eliminada y entorno de prueba limpio`);

    // 6. Probar login alternativo con samuel.ador@hummingxbi.com
    console.log('\n6. Probando login con alias samuel.ador@hummingxbi.com...');
    const loginAdor = await makeRequest('POST', '/api/auth/login', null, {
      email: 'samuel.ador@hummingxbi.com',
      password: 'SamuelNFC2026!'
    });
    if (loginAdor.status !== 200 || loginAdor.data.user.role !== 'nfc_operator') {
      throw new Error(`Login con samuel.ador falló`);
    }
    console.log(`   ✅ Login con samuel.ador@hummingxbi.com exitoso con role: ${loginAdor.data.user.role}`);

    console.log('\n🎉 ¡TODOS LOS TESTS DE SEGURIDAD Y PERMISOS PASARON EXITOSAMENTE!');
  } finally {
    if (server) {
      await new Promise(res => server.close(res));
    }
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('\n❌ ERROR EN TEST:', err);
  process.exit(1);
});
