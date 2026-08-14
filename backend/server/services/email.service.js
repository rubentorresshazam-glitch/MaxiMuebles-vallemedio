const nodemailer = require('nodemailer');

// ======================================
// 📧 SERVICIO DE CORREO - GMAIL
// ======================================

const transporte = nodemailer.createTransport({
  host: process.env.CORREO_HOST || 'smtp.gmail.com',
  port: Number(process.env.CORREO_PUERTO) || 587,
  secure: false,
  auth: {
    user: process.env.CORREO_USUARIO,
    pass: process.env.CORREO_CONTRASEÑA
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ======================================
// ✅ ENVIAR FACTURA POR CORREO
// ======================================
async function enviarFactura(factura, pdfBase64 = null) {
  try {
    if (!factura.correoCliente) {
      console.log("⚠️ Sin correo del cliente — no se envía");
      return { ok: false, mensaje: "Sin correo" };
    }

    const correoEmisor = process.env.CORREO_USUARIO;
    if (!correoEmisor) {
      console.log("⚠️ Falta configurar correo en .env");
      return { ok: false, mensaje: "Correo no configurado" };
    }

    console.log(`📧 Enviando factura N° ${factura.numeroFactura} → ${factura.correoCliente}`);

    const fecha = new Date(factura.fechaEmision).toLocaleDateString('es-AR');

    const opcionesCorreo = {
      from: `"MaxiMuebles" <${correoEmisor}>`,
      to: factura.correoCliente,
      subject: `🧾 Tu Factura N° ${factura.numeroFactura} - MaxiMuebles`,
      html: `
        <div style="font-family: Arial; max-width: 600px; padding: 20px;">
          <h2 style="color: #2c3e50;">¡Gracias por tu compra! 🎉</h2>
          <p>Te adjunto tu factura electrónica:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; font-weight: bold;">Factura N°:</td><td>${factura.numeroFactura}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Emisor:</td><td>${factura.razonSocial} - CUIT ${factura.cuitEmisor}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Importe Total:</td><td>$${factura.importeTotal}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Fecha:</td><td>${fecha}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">CAE (ARCA):</td><td>${factura.cae || 'Pendiente'}</td></tr>
          </table>
          <p>¡Esperamos verte pronto!</p>
          <p style="color: #7f8c8d;">— El equipo de MaxiMuebles</p>
        </div>
      `,
      attachments: pdfBase64 ? [
        {
          filename: `Factura-${factura.numeroFactura}.pdf`,
          content: pdfBase64,
          encoding: 'base64'
        }
      ] : []
    };

    await transporte.sendMail(opcionesCorreo);
    console.log("✅ Correo enviado correctamente");
    return { ok: true };

  } catch (error) {
    console.error("❌ ERROR enviando correo:", error.message);
    return { ok: false, error: error.message };
  }
}

module.exports = { enviarFactura };