const fs = require('fs');
const path = require('path');
const { configARCA } = require('../server.js');

// ======================================
// 🔑 SERVICIO DE CONEXIÓN CON ARCA/AFIP
// ======================================

// URLs oficiales de AFIP (cambiar a producción cuando todo esté probado)
const WSAA_URL = "https://wsaahomo.afip.gov.ar/wsaa/services/LoginTicket";
const WSFE_URL = "https://wsfe1.afip.gov.ar/ws/services/FConsulta";

// Cache del token para no pedirlo en cada factura
let tokenCache = {
  token: null,
  sign: null,
  vencimiento: null
};

// ======================================
// 🔑 PASO 1: OBTENER TOKEN DE ACCESO
// ======================================
async function obtenerTokenAFIP() {
  try {
    // Si el token sigue vigente, lo reutilizamos
    if (tokenCache.token && new Date() < new Date(tokenCache.vencimiento)) {
      return { ok: true, token: tokenCache.token, sign: tokenCache.sign };
    }

    console.log("🔑 Solicitando token a AFIP — CUIT:", configARCA.cuit);

    // Validar que existan certificado y clave
    if (!configARCA.certificado || !configARCA.clavePrivada) {
      throw new Error("Certificado o clave privada no cargados en server.js");
    }

    // Fechas de validez del ticket
    const fecha = new Date();
    const generacion = fecha.toISOString();
    const vencimiento = new Date(fecha.getTime() + 12 * 60 * 60 * 1000).toISOString(); // 12 hs

    // XML de solicitud
    const xmlSolicitud = `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${Date.now().toString().slice(-10)}</uniqueId>
    <generationTime>${generacion}</generationTime>
    <expirationTime>${vencimiento}</expirationTime>
  </header>
  <service>wsfe</service>
</loginTicketRequest>`;

    // ⚠️ La lógica de firma con clave privada se agrega aquí
    // Por ahora devolvemos estructura lista para conectar
    console.log("✅ XML armado, certificado listo para firmar");

    // Guardamos datos simulados hasta agregar la conexión SOAP
    tokenCache = {
      token: "TOKEN_EN_PRUEBA",
      sign: "SIGN_EN_PRUEBA",
      vencimiento: vencimiento
    };

    return {
      ok: true,
      token: tokenCache.token,
      sign: tokenCache.sign,
      mensaje: "Configuración lista — conexión SOAP pendiente de activar"
    };

  } catch (error) {
    console.error("❌ ERROR en obtenerTokenAFIP:", error.message);
    return { ok: false, error: error.message };
  }
}

// ======================================
// 📄 PASO 2: GENERAR FACTURA ELECTRÓNICA EN AFIP
// ======================================
async function generarFacturaAFIP(datosPedido, tipoFactura = 'CF') {
  try {
    const tokenResp = await obtenerTokenAFIP();
    if (!tokenResp.ok) throw new Error(tokenResp.error);

    // Tipos de comprobante según AFIP
    const TIPOS = { CF: 1, MO: 11, RI: 1 };
    const tipoCbte = TIPOS[tipoFactura] || 1;

    console.log(`📄 Generando factura Tipo ${tipoFactura} — Pedido #${datosPedido.id}`);

    // ⚠️ Conexión real con AFIP se agrega aquí
    // Por ahora devolvemos factura de prueba con estructura oficial
    const numeroFactura = Math.floor(Math.random() * 900000) + 100000;

    const factura = {
      ok: true,
      numeroFactura: numeroFactura,
      cuitEmisor: configARCA.cuit,
      razonSocial: configARCA.nombreEmpresa,
      puntoVenta: configARCA.puntoVenta,
      tipoComprobante: tipoCbte,
      tipoFactura: tipoFactura,
      importeTotal: datosPedido.total,
      fechaEmision: new Date().toISOString(),
      correoCliente: datosPedido.correo_cliente || datosPedido.correoCliente,
      cae: "PENDIENTE_CONEXION_AFIP", // ← Acá vendrá el CAE real
      vencimientoCAE: null,
      estado: "PRUEBA — CAE PENDIENTE"
    };

    console.log(`✅ Factura generada: N° ${factura.numeroFactura}`);
    return factura;

  } catch (error) {
    console.error("❌ ERROR en generarFacturaAFIP:", error.message);
    return { ok: false, error: error.message };
  }
}

module.exports = { obtenerTokenAFIP, generarFacturaAFIP };