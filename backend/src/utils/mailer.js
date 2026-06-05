const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // false para puerto 587
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

  const mensajes = {
    'Nueva': 'Tu denuncia ha sido recibida y está pendiente de revisión.',
    'Asignada': 'Tu denuncia ha sido asignada a un investigador.',
    'En Investigacion': 'Tu denuncia está siendo investigada activamente.',
    'Resuelta': '¡Tu denuncia ha sido resuelta! Gracias por tu colaboración.',
    'Archivada': 'Tu denuncia ha sido archivada.'
  };

  const mensaje = mensajes[nuevoEstado] || 'El estado de tu denuncia ha cambiado.';

  const mailOptions = {
    from: '"FGR El Salvador - Sistema de Denuncias" <notificaciones.fgr.sv@gmail.com>',
    to: denuncia.correo_electronico,
    subject: `Actualización de tu denuncia ${denuncia.codigo_unico}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0D2137;">Fiscalía General de la República</h2>
        <p>Hola,</p>
        <p>Te informamos que el estado de tu denuncia <strong>${denuncia.codigo_unico}</strong> ha cambiado a:</p>
        
        <div style="background: #f0f4f8; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <strong style="font-size: 18px; color: #0D2137;">${nuevoEstado}</strong>
        </div>
        
        <p>${mensaje}</p>
        
        <p>Puedes consultar el estado de tu denuncia aquí:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="https://grupo1-espro-v01.github.io/Grupo1/src/consulta.html" 
             style="background: #C0392B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Consultar mi denuncia
          </a>
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #666;">
          Este es un correo automático del Sistema de Denuncias de la FGR El Salvador.<br>
          Por favor no respondas a este mensaje.
        </p>
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