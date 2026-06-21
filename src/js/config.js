/**
 * ================================================================
 * CONFIGURACIÓN — Datos de contacto y endpoints
 * Edita aquí los datos de contacto del cliente.
 * ================================================================
 */

export const CONFIG = {
  /**
   * WHATSAPP: Números en formato internacional sin '+' ni espacios.
   */
  WA_NUMBER_1: '5215519802943',
  WA_NUMBER_2: '525568905795',

  /**
   * INSTAGRAM: Nombre de usuario SIN el @
   */
  IG_USERNAME: 'hummingx.bi',

  /**
   * FACEBOOK: Link de la página oficial
   */
  FB_PAGE_URL: 'https://www.facebook.com/profile.php?id=61590401354021',

  /**
   * EMAIL: Dirección de correo electrónico donde recibirás solicitudes
   */
  EMAIL_ADDRESS: 'colibrixbi@gmail.com',

  /**
   * NOMBRE DE LA EMPRESA (para mensajes pre-llenados)
   */
  COMPANY_NAME: 'HummingX-BI',

  /**
   * UMBRAL DEL SCROLL para activar el estilo "scrolled" de la navbar.
   */
  NAVBAR_SCROLL_THRESHOLD: 60,

  /**
   * ENDPOINT SERVERLESS — Lead Ingestion API
   */
  LEAD_ENDPOINT: '/api/leads/ingest',

  /**
   * TIMEOUT para la llamada fetch (ms).
   */
  FETCH_TIMEOUT_MS: 8000,
};
