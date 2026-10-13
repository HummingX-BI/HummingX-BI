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

function paginaNoActivada(res, code, status = 200) {
  const boton = WHATSAPP_NUMBER
    ? `<a href="https://wa.me/${WHATSAPP_NUMBER}">Escríbenos por WhatsApp</a>`
    : '';
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(`<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Tarjeta no activada · HummingX BI</title>
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#fff;color:#262523;text-align:center;padding:24px}
main{max-width:340px}h1{font-size:22px;margin:0 0 12px}
p{color:#5F6368;line-height:1.5;margin:0 0 20px}
a{display:inline-block;padding:12px 20px;border-radius:999px;background:#262523;color:#fff;text-decoration:none;font-weight:600}
small{display:block;margin-top:28px;color:#9aa0a6}
</style></head><body><main>
<h1>Esta tarjeta aún no está activada</h1>
<p>Contacta a HummingX BI para activarla o para conseguir una para tu negocio.</p>
${boton}
${code ? `<small>Tarjeta ${code}</small>` : ''}
</main></body></html>`);
}

module.exports = async (req, res) => {
  const code = String(req.query?.code || req.params?.code || '');
  if (!/^[0-9]{3,6}$/.test(code)) return paginaNoActivada(res, '', 404);

  try {
    // 1) Primero consultar en Neon PostgreSQL vía Prisma
    const card = await prisma.nfcCard.findUnique({
      where: { code }
    });

    if (card) {
      if (card.active && card.targetUrl && /^https?:\/\//i.test(card.targetUrl)) {
        // Incrementar contador de escaneos sin bloquear la redirección
        prisma.nfcCard.update({
          where: { id: card.id },
          data: {
            scanCount: { increment: 1 },
            lastScanned: new Date(),
          }
        }).catch((e) => console.error('[NFC] Error incrementando escaneo:', e.message));

        res.statusCode = 302;
        res.setHeader('Location', card.targetUrl);
        res.setHeader('Cache-Control', 'no-store');
        return res.end();
      }
      return paginaNoActivada(res, code);
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
