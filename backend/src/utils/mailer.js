const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function enviarNotificacionCambioEstado(denuncia, nuevoEstado) {
  if (denuncia.anonima || !denuncia.correo_electronico) {
    console.log('📧 Denuncia anónima o sin correo. No se envía notificación.');
    return;
  }

  const nombre = denuncia.nombres_denunciante || 'Usuario';

  const mensajes = {
    'Nueva': 'Tu denuncia ha sido recibida correctamente y se encuentra en revisión inicial.',
    'Asignada': 'Tu denuncia ha sido asignada a un investigador de la Fiscalía.',
    'En Investigacion': 'Tu denuncia está siendo investigada activamente por nuestro equipo.',
    'Resuelta': 'Tu denuncia ha sido resuelta. Agradecemos tu colaboración con la justicia.',
    'Archivada': 'Tu denuncia ha sido archivada. Si necesitas más información, puedes consultar el estado.'
  };

  const mensaje = mensajes[nuevoEstado] || 'El estado de tu denuncia ha sido actualizado.';

  const mailOptions = {
    from: '"FGR El Salvador - Sistema de Denuncias" <notificaciones.fgr.sv@gmail.com>',
    to: denuncia.correo_electronico,
    replyTo: 'notificaciones.fgr.sv@gmail.com',
    subject: `Actualización de tu denuncia ${denuncia.codigo_unico}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <h2 style="color: #0D2137; margin-top: 0;">Fiscalía General de la República</h2>
          <p style="font-size: 15px; color: #333;">El Salvador</p>

          <p>Hola <strong>${nombre}</strong>,</p>

          <p>Te informamos que el estado de tu denuncia <strong>${denuncia.codigo_unico}</strong> ha cambiado a:</p>

          <div style="background: #0D2137; color: white; padding: 12px 20px; border-radius: 8px; text-align: center; margin: 20px 0; font-size: 18px; font-weight: bold;">
            ${nuevoEstado}
          </div>

          <p style="font-size: 15px; line-height: 1.6;">${mensaje}</p>

          <!-- Aviso importante de emergencias -->
          <div style="background: #fff3cd; border-left: 5px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 6px;">
            <strong style="color: #856404;">⚠️ Importante:</strong><br>
            Si se trata de una <strong>emergencia</strong> o tu integridad está en riesgo, 
            <strong>llama inmediatamente a la Policía Nacional Civil</strong> al <strong>911</strong>.<br><br>
            Si eres mujer y estás sufriendo violencia, puedes comunicarte con la 
            <strong>Línea 126</strong> (Línea de Atención a la Violencia contra las Mujeres).
          </div>

          <p>Puedes consultar el estado actualizado de tu denuncia en cualquier momento aquí:</p>

          <p style="text-align: center; margin: 25px 0;">
            <a href="https://grupo1-espro-v01.github.io/Grupo1/src/consulta.html" 
               style="background: #C0392B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Consultar estado de mi denuncia
            </a>
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 13px; color: #555; line-height: 1.5;">
            <strong>Nota:</strong> Este es un correo automático generado por el Sistema de Denuncias de la Fiscalía General de la República.<br>
            Este correo <strong>no recibe respuestas</strong>. Sin embargo, si respondes a este mensaje, tu correo llegará a 
            <strong>notificaciones.fgr.sv@gmail.com</strong>.
          </p>

          <p style="font-size: 12px; color: #888; margin-top: 25px;">
            Fiscalía General de la República de El Salvador<br>
            Sistema de Denuncias en Línea
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Correo enviado a ${denuncia.correo_electronico} - Estado: ${nuevoEstado}`);
  } catch (error) {
    console.error('❌ Error enviando correo:', error.message);
  }
}

module.exports = { enviarNotificacionCambioEstado };