// Redirección de tarjetas NFC/QR: hummingxbi.com/t/001 -> destino guardado en Neon PostgreSQL / Supabase
const { createClient } = require('@supabase/supabase-js');
const prisma = require('./_src/lib/prisma');

// Opcional: número con lada de país, solo dígitos (ej. 5215512345678). Si falta, no se muestra el botón.
const WHATSAPP_NUMBER = (process.env.NFC_WHATSAPP_NUMBER || '525575084267').replace(/\D/g, '');

let supabase;
function db() {
  if (!supabase && process.env.NFC_SUPABASE_URL && process.env.NFC_SUPABASE_SECRET_KEY) {
    supabase = createClient(
      process.env.NFC_SUPABASE_URL,
      process.env.NFC_SUPABASE_SECRET_KEY,
      { auth: { persistSession: false } }
    );
  }
  return supabase;
}

function paginaNoActivada(res, code, status = 200, isSuspended = false, clientName = '') {
  const queryText = isSuspended
    ? `Hola HummingX BI, requiero reactivar o asistencia con la tarjeta NFC/QR #${code || ''} (${clientName || ''})`
    : `Hola HummingX BI, quiero activar y vincular la tarjeta NFC/QR #${code || ''}`;
  const boton = WHATSAPP_NUMBER
    ? `<a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(queryText)}">Escríbenos por WhatsApp</a>`
    : '';

  const titulo = isSuspended ? 'Tarjeta temporalmente pausada' : 'Esta tarjeta aún no está activada';
  const descripcion = isSuspended
    ? `Esta tarjeta asignada a <b>${clientName || 'Cliente'}</b> se encuentra pausada temporalmente. Contacta a HummingX BI para reactivarla o solicitar soporte.`
    : 'Contacta a HummingX BI para activarla o vincularla a tus redes sociales, reseñas de Google o menú.';

  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(`<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${titulo} · HummingX BI</title>
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;background:#0B0B0E;color:#FFFFFF;text-align:center;padding:24px}
main{max-width:380px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:36px 28px;box-shadow:0 12px 36px rgba(0,0,0,0.4)}
h1{font-size:22px;margin:0 0 12px;font-weight:700}
p{color:#94A3B8;line-height:1.5;margin:0 0 24px;font-size:14px}
a{display:inline-block;padding:12px 24px;border-radius:12px;background:#00C4CC;color:#0B0B0E;text-decoration:none;font-weight:700;font-size:14px;box-shadow:0 4px 16px rgba(0,196,204,0.3)}
small{display:block;margin-top:24px;color:#64748B;font-size:12px}
</style></head><body><main>
<h1>${titulo}</h1>
<p>${descripcion}</p>
${boton}
${code ? `<small>Tarjeta / QR #${code}</small>` : ''}
</main></body></html>`);
}

module.exports = async (req, res) => {
  const code = String(req.query?.code || req.params?.code || '');
  if (!/^[0-9]{3,6}$/.test(code)) return paginaNoActivada(res, '', 404);

  try {
    // 1) Consultar en Neon PostgreSQL vía Prisma con executeWithRetry (resistente a cold starts)
    const card = await (prisma.executeWithRetry
      ? prisma.executeWithRetry(() => prisma.nfcCard.findUnique({ where: { code } }))
      : prisma.nfcCard.findUnique({ where: { code } }));

    if (card) {
      if (card.active && card.targetUrl && /^https?:\/\//i.test(card.targetUrl)) {
        // Incrementar contador de escaneos y esperar para asegurar registro en serverless Vercel
        const updatePromise = prisma.nfcCard.update({
          where: { id: card.id },
          data: {
            scanCount: { increment: 1 },
            lastScanned: new Date(),
          }
        });

        if (prisma.executeWithRetry) {
          await prisma.executeWithRetry(() => updatePromise).catch((e) => console.error('[NFC] Error incrementando escaneo:', e.message));
        } else {
          await updatePromise.catch((e) => console.error('[NFC] Error incrementando escaneo:', e.message));
        }

        res.statusCode = 302;
        res.setHeader('Location', card.targetUrl);
        res.setHeader('Cache-Control', 'no-store');
        return res.end();
      }

      const isSuspended = Boolean(!card.active && card.clientName && !card.clientName.includes('Disponible'));
      return paginaNoActivada(res, code, 200, isSuspended, card.clientName);
    }

    // 2) Fallback opcional a Supabase si existe configuración
    const sb = db();
    if (sb) {
      const { data, error } = await sb
        .from('tarjetas')
        .select('destino_url, activa')
        .eq('code', code)
        .maybeSingle();

      if (!error && data && data.activa && /^https?:\/\//i.test(data.destino_url || '')) {
        sb.from('escaneos').insert({ code }).catch(() => {});
        res.statusCode = 302;
        res.setHeader('Location', data.destino_url);
        res.setHeader('Cache-Control', 'no-store');
        return res.end();
      }
    }

    return paginaNoActivada(res, code);
  } catch (e) {
    console.error('[NFC] Error en redirección:', e);
    return paginaNoActivada(res, code, 503);
  }
};
