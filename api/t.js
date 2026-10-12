// Redirección de tarjetas NFC/QR: hummingxbi.com/t/001 -> destino guardado en Supabase
const { createClient } = require('@supabase/supabase-js');
const { waitUntil } = require('@vercel/functions');

// Opcional: número con lada de país, solo dígitos (ej. 5215512345678). Si falta, no se muestra el botón.
const WHATSAPP_NUMBER = (process.env.NFC_WHATSAPP_NUMBER || '').replace(/\D/g, '');

let supabase;
function db() {
  if (!supabase) {
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

async function registrarEscaneo(code) {
  try {
    await db().from('escaneos').insert({ code });
  } catch (e) {
    console.error('No se pudo registrar el escaneo', e);
  }
}

module.exports = async (req, res) => {
  const code = String(req.query.code || '');
  if (!/^[0-9]{3,6}$/.test(code)) return paginaNoActivada(res, '', 404);

  try {
    const { data, error } = await db()
      .from('tarjetas')
      .select('destino_url, activa')
      .eq('code', code)
      .maybeSingle();
    if (error) throw error;

    // Registrar el escaneo sin retrasar la redirección
    if (data) waitUntil(registrarEscaneo(code));

    if (data && data.activa && /^https?:\/\//i.test(data.destino_url || '')) {
      res.statusCode = 302; // temporal: permite cambiar el destino cuando quieras
      res.setHeader('Location', data.destino_url);
      res.setHeader('Cache-Control', 'no-store');
      return res.end();
    }
    return paginaNoActivada(res, code);
  } catch (e) {
    console.error('Error en redirección NFC', e);
    return paginaNoActivada(res, code, 503);
  }
};
