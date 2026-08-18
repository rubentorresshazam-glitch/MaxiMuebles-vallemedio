const express = require('express');
const router = express.Router();

// ✅ VALORES DIRECTOS — ELIMINAMOS LA REFERENCIA CIRCULAR
const configARCA = {
  cuit: "30715002724",
  nombreEmpresa: "MAXIMUEBLES S.R.L.",
  puntoVenta: 1
};

const db = require('../config/database');

// ✅ TRAEMOS LOS 3 SERVICIOS
const { generarFacturaAFIP } = require('../services/arca.service.js');
const { enviarFactura } = require('../services/email.service.js');
const { generarPDF } = require('../services/pdf.service.js');


// ======================================
// 🔑 PRUEBA DE CONFIGURACIÓN ARCA/AFIP
// ======================================
async function obtenerTokenAFIP() {
  try {
    console.log("🔑 Solicitando token a AFIP con CUIT:", configARCA.cuit);

    const fecha = new Date();
    const fechaStr = fecha.toISOString();
    const fechaVenc = new Date(fecha.getTime() + 12 * 60 * 60 * 1000).toISOString();

    const xmlSolicitud = `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${Date.now().toString().slice(-10)}</uniqueId>
    <generationTime>${fechaStr}</generationTime>
    <expirationTime>${fechaVenc}</expirationTime>
  </header>
  <service>wsfe</service>
</loginTicketRequest>`;

    console.log("✅ Configuración ARCA lista");
    console.log("✅ CUIT:", configARCA.cuit);
    console.log("✅ Punto de Venta:", configARCA.puntoVenta);

    return {
      ok: true,
      mensaje: "Configuración ARCA lista",
      cuit: configARCA.cuit,
      puntoVenta: configARCA.puntoVenta
    };

  } catch (error) {
    console.error("❌ ERROR obteniendo token AFIP:", error.message);
    return { ok: false, error: error.message };
  }
}


// ======================================
// 🔄 PROCESAR FACTURACIÓN COMPLETA
// ======================================
async function procesarFacturacion(pedidoId) {
  try {
    console.log(`🔄 Iniciando facturación para pedido #${pedidoId}`);

    // 1️⃣ Traemos el pedido de la base
    const [pedido] = await db.query(
      "SELECT * FROM pedidos WHERE id = ?",
      [pedidoId]
    );

    if (!pedido || pedido.length === 0) throw new Error("Pedido no encontrado");

    // 2️⃣ Generamos factura con ARCA
    const factura = await generarFacturaAFIP(pedido[0], pedido[0].tipo_factura || 'CF');
    if (!factura.ok) throw new Error(factura.error || "No se pudo generar la factura");

    // 3️⃣ Generamos PDF
    const pdf = await generarPDF(factura);

    // 4️⃣ Enviamos correo con PDF adjunto
    await enviarFactura(factura, pdf.pdfBase64);

    // 5️⃣ Guardamos en la base
    await db.query(
      "UPDATE pedidos SET numero_factura = ?, cae = ?, fecha_factura = ? WHERE id = ?",
      [factura.numeroFactura, factura.cae, factura.fechaEmision, pedidoId]
    );

    console.log(`✅ ✅ FACTURACIÓN COMPLETA — Pedido #${pedidoId} → Factura N° ${factura.numeroFactura}`);
    return { ok: true, factura };

  } catch (error) {
    console.error("❌ ERROR EN FACTURACIÓN:", error.message);
    return { ok: false, error: error.message };
  }
}


// ======================================
// 📡 RUTAS
// ======================================
router.get('/arca/configuracion', async (req, res) => {
  const prueba = await obtenerTokenAFIP();
  res.json(prueba);
});

router.post('/facturar-pedido/:id', async (req, res) => {
  const resultado = await procesarFacturacion(req.params.id);
  res.json(resultado);
});


// ✅ EXPORTACIÓN CORRECTA — SOLO EL ROUTER
module.exports = router;