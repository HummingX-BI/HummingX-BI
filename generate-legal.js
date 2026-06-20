const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');

function createPage(filename, contentBody, title) {
    let template = indexHtml;
    
    // Change nav links
    template = template.replace(/href="#inicio"/g, 'href="index.html#inicio"');
    template = template.replace(/href="#servicios"/g, 'href="index.html#servicios"');
    template = template.replace(/href="#soluciones"/g, 'href="index.html#soluciones"');
    template = template.replace(/href="#metodologia"/g, 'href="index.html#metodologia"');
    template = template.replace(/href="#nosotros"/g, 'href="index.html#nosotros"');
    template = template.replace(/href="#faqs"/g, 'href="index.html#faqs"');
    template = template.replace(/href="#contacto"/g, 'href="index.html#contacto"');
    
    // Change title
    template = template.replace(/<title>.*?<\/title>/, `<title>${title} | HummingX BI</title>`);
    
    // Remove preloader block
    template = template.replace(/<!-- PRELOADER:[\s\S]*?<!-- Cursor magnético/g, '<!-- Cursor magnético');
    
    // Markers
    const heroStart = '<section class="hero" id="inicio"';
    const footerStart = '<footer class="footer" role="contentinfo">';
    
    const startIndex = template.indexOf(heroStart);
    const endIndex = template.indexOf(footerStart);
    
    if (startIndex !== -1 && endIndex !== -1) {
        // Find the line comment right before HERO to make it cleaner
        const beforeHeroContent = template.substring(0, startIndex - 80);
        const footerContent = template.substring(endIndex);
        
        let newContent = beforeHeroContent + contentBody + '\n\n    ' + footerContent;
        
        fs.writeFileSync(filename, newContent, 'utf8');
        console.log(`Created ${filename}`);
    } else {
        console.log("Could not find markers using indexOf");
    }
}

const avisoContent = `
    <!-- CONTENIDO LEGAL -->
    <main class="legal-page container" style="margin-top: 120px; padding-bottom: 80px;">
      <!-- BORRADOR — pendiente de revisión por asesoría legal antes de publicación oficial. -->
      <h1>Aviso de Privacidad</h1>
      <span class="legal-date">Última actualización: 19 de Junio de 2026</span>

      <h2>Identidad y Domicilio del Responsable</h2>
      <p><strong>HummingX BI</strong> (en adelante "el Responsable" o "Nosotros"), con zona de operación principal en la Ciudad de México (CDMX) y Estado de México, México; es el responsable del uso, protección y tratamiento de sus datos personales, en estricto apego a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.</p>

      <h2>Datos Personales Recabados</h2>
      <p>Para llevar a cabo las finalidades descritas en el presente aviso, recabaremos de manera directa a través de nuestros formularios de contacto, vía correo electrónico o WhatsApp Business, los siguientes datos personales:</p>
      <ul>
        <li>Nombre completo.</li>
        <li>Correo electrónico.</li>
        <li>Número de teléfono / celular.</li>
        <li>Nombre de la empresa que representa o en la que labora.</li>
        <li>Contenido del mensaje, requerimientos y/o detalles de su proyecto.</li>
      </ul>
      <p><em>HummingX BI no recaba bajo ninguna circunstancia datos personales catalogados como sensibles.</em></p>

      <h2>Finalidades del Tratamiento</h2>
      <p>Los datos personales recabados serán utilizados para las siguientes finalidades:</p>
      <p><strong>Finalidades Primarias</strong> (necesarias para la relación jurídica y de servicio):</p>
      <ul>
        <li>Dar seguimiento a sus solicitudes de información, contacto o cotización.</li>
        <li>Proveer los servicios contratados relacionados con desarrollo de software, automatización, IA e inteligencia de negocios.</li>
        <li>Gestión administrativa, facturación y mantenimiento de la relación comercial.</li>
      </ul>
      <p><strong>Finalidades Secundarias</strong> (no necesarias para el servicio, pero de utilidad para mejorar su experiencia):</p>
      <ul>
        <li>Envío de material de marketing, newsletters y contenido de valor sobre tecnología y negocios.</li>
        <li>Invitaciones a eventos exclusivos o webinars.</li>
        <li>Aplicación de encuestas de calidad y satisfacción del servicio.</li>
      </ul>

      <h2>Mecanismo para Negativa de Finalidades Secundarias (Opt-out)</h2>
      <p>Si usted no desea que sus datos personales sean tratados para las Finalidades Secundarias, puede manifestar su negativa desde este momento enviando un correo a <strong>contacto@hummingx.com</strong>. La negativa para el uso de sus datos personales para estas finalidades secundarias no será motivo para que le neguemos los servicios principales que solicita o contrata con nosotros.</p>

      <h2>Transferencias de Datos a Terceros</h2>
      <p>Sus datos personales no serán vendidos ni transferidos a terceros con fines de comercialización. Únicamente realizamos transferencias de información a proveedores tecnológicos de estricta confianza (ej. plataformas de hosting, sistemas de CRM, WhatsApp Business/Meta y herramientas de analítica web) que operan bajo rigurosas políticas de privacidad, de manera exclusiva para poder brindarle nuestros servicios, administrar nuestra plataforma técnica o atender su comunicación, tal como lo exige el desarrollo de nuestra operación comercial.</p>

      <h2>Derechos ARCO (Acceso, Rectificación, Cancelación u Oposición)</h2>
      <p>Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Es su derecho solicitar la corrección de su información en caso de estar desactualizada, ser inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos (Cancelación); así como oponerse al uso de sus datos para fines específicos (Oposición).</p>
      <p>Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva a través del correo electrónico <strong>contacto@hummingx.com</strong>. La solicitud deberá incluir su nombre completo, documento de identificación oficial y la descripción clara de los datos sobre los que busca ejercer algún derecho. Le daremos respuesta oficial en un plazo no mayor a 20 días hábiles.</p>

      <h2>Uso de Cookies y Tecnologías de Rastreo</h2>
      <p>Le informamos que en nuestro sitio web (hummingxbi.com) utilizamos cookies y analíticas web básicas estrictamente necesarias para el correcto funcionamiento del sitio, la medición del tráfico técnico y el rendimiento del servidor. No utilizamos tecnologías invasivas para monitorear su comportamiento de navegación cruzada ni perfilar a los usuarios con fines publicitarios de terceros.</p>

      <h2>Cambios al Aviso de Privacidad</h2>
      <p>El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales, de nuestras propias necesidades operativas o de cambios en nuestro modelo de negocio. Toda modificación a este aviso será publicada en esta misma página web.</p>
    </main>
    <!-- FIN: CONTENIDO LEGAL -->
`;

const terminosContent = `
    <!-- CONTENIDO LEGAL -->
    <main class="legal-page container" style="margin-top: 120px; padding-bottom: 80px;">
      <!-- BORRADOR — pendiente de revisión por asesoría legal antes de publicación oficial. -->
      <h1>Términos y Condiciones</h1>
      <span class="legal-date">Última actualización: 19 de Junio de 2026</span>

      <h2>1. Objeto y Aceptación</h2>
      <p>Los presentes Términos y Condiciones regulan el acceso y uso del sitio web <strong>hummingxbi.com</strong> (en adelante, "el Sitio") y la relación informativa entre el usuario y HummingX BI. Al navegar por este Sitio y/o solicitar información de nuestros servicios, usted acepta tácita e incondicionalmente estos Términos y Condiciones.</p>

      <h2>2. Descripción de los Servicios</h2>
      <p>HummingX BI es una firma de tecnología enfocada en inteligencia de negocios, desarrollando soluciones como:</p>
      <ul>
        <li>Software empresarial a la medida.</li>
        <li>Integración de agentes IA y automatización inteligente.</li>
        <li>Ecosistemas web y plataformas transaccionales.</li>
        <li>Tarjetas NFC y programas de lealtad (loyalty).</li>
        <li>Digital Signage (señalización digital inteligente).</li>
        <li>Business Intelligence y analítica de datos.</li>
      </ul>
      <p><strong>Nota importante:</strong> La información contenida en el Sitio tiene un carácter exclusivamente informativo y referencial. Estos términos NO sustituyen ni representan un contrato de prestación de servicios. Todo servicio técnico o desarrollo quedará estrictamente regido por su respectiva propuesta, cotización y/o contrato de servicios formalmente firmado entre el cliente y HummingX BI.</p>

      <h2>3. Condiciones de Uso del Sitio Web</h2>
      <p>El usuario se compromete a hacer un uso lícito, diligente y responsable del Sitio y de su contenido. Queda estrictamente prohibido:</p>
      <ul>
        <li>Realizar ingeniería inversa, descompilar o intentar extraer el código fuente del Sitio o de sus integraciones.</li>
        <li>Ejecutar técnicas de <em>web scraping</em>, minería de datos o uso de bots automatizados no autorizados.</li>
        <li>Utilizar el Sitio para transmitir malware, virus o llevar a cabo ciberataques.</li>
        <li>Hacerse pasar por otra persona o entidad al enviar formularios de contacto.</li>
      </ul>

      <h2>4. Propiedad Intelectual e Industrial</h2>
      <p>La marca "HummingX BI", los logotipos, textos, diseños, código fuente, componentes visuales, metodologías de trabajo descritas y todo el contenido del Sitio son propiedad exclusiva de HummingX BI o de terceros que han autorizado su uso. El usuario no adquiere ningún derecho de propiedad intelectual, derecho de uso comercial ni licencia sobre las metodologías internas o el diseño tecnológico de HummingX BI por el simple hecho de navegar por el Sitio.</p>

      <h2>5. Cotizaciones, Modelos Tiered y Contratación</h2>
      <p>HummingX BI ofrece soluciones estructuradas bajo un modelo <em>Tiered</em> (ej. niveles Silver, Gold, Platinum, Elite). Cualquier precio, estimación o característica general de este modelo mencionada en el Sitio es únicamente ilustrativa. Toda cotización solicitada carece de carácter vinculante hasta que se emita una propuesta formal validada, firmada y acompañada del pago o anticipo correspondiente. Los entregables técnicos exactos, garantías, plazos de ejecución y condiciones de facturación se definirán de forma exclusiva en el contrato de cada proyecto individual.</p>

      <h2>6. Confidencialidad</h2>
      <p>En HummingX BI entendemos la naturaleza crítica de los datos de nuestros clientes. Garantizamos el estricto manejo confidencial de toda información, idea, modelo de negocio o infraestructura técnica compartida por el cliente durante el proceso comercial o de evaluación, incluso antes de la firma de un contrato formal o Acuerdo de Confidencialidad (NDA).</p>

      <h2>7. Limitación de Responsabilidad</h2>
      <ul>
        <li><strong>Disponibilidad:</strong> Nos esforzamos por mantener el Sitio accesible en todo momento; sin embargo, no nos hacemos responsables por caídas temporales del servidor, mantenimientos o errores técnicos fuera de nuestro control.</li>
        <li><strong>Exactitud:</strong> La información publicada busca ser lo más precisa posible, pero puede estar sujeta a actualizaciones sin previo aviso.</li>
        <li><strong>Resultados de Negocio:</strong> Las herramientas tecnológicas y metodologías (como IA o BI) son aceleradores operativos; HummingX BI no garantiza retornos de inversión (ROI) específicos ni resultados comerciales directos, ya que estos dependen enteramente de la ejecución estratégica y operativa propia del cliente, independientemente del software entregado.</li>
      </ul>

      <h2>8. Enlaces a Terceros</h2>
      <p>El Sitio puede contener hipervínculos a plataformas externas (como WhatsApp Business, redes sociales u otros proveedores). HummingX BI no controla ni asume responsabilidad por el contenido, políticas de privacidad ni prácticas de seguridad de dichos sitios externos.</p>

      <h2>9. Modificaciones y Vigencia</h2>
      <p>Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento, de acuerdo con las necesidades operativas de la firma. Los cambios entrarán en vigor de manera inmediata al ser publicados en el Sitio.</p>

      <h2>10. Ley Aplicable y Jurisdicción</h2>
      <p>Para la interpretación, cumplimiento y ejecución de los presentes Términos y Condiciones, así como para la resolución de cualquier controversia que pudiera derivarse del uso del Sitio, las partes se someten a las leyes vigentes de los Estados Unidos Mexicanos y a los tribunales competentes en la Ciudad de México (CDMX), renunciando a cualquier otro fuero que pudiera corresponderles en razón de su domicilio presente o futuro.</p>

      <h2>11. Contacto</h2>
      <p>Para cualquier duda, comentario o notificación legal respecto a estos Términos y Condiciones, por favor envíe un correo electrónico a <strong>contacto@hummingx.com</strong>.</p>
    </main>
    <!-- FIN: CONTENIDO LEGAL -->
`;

createPage('aviso-de-privacidad.html', avisoContent, 'Aviso de Privacidad');
createPage('terminos-y-condiciones.html', terminosContent, 'Términos y Condiciones');
