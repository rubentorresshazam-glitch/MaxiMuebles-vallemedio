// ======================================
// 📄 SERVICIO DE GENERACIÓN DE PDF
// ======================================
// ⚠️ Para generar PDF real instalar: npm install pdfkit
// Por ahora devuelve estructura lista para activar

async function generarPDF(factura) {
  try {
    console.log(`📄 Generando PDF para factura N° ${factura.numeroFactura}`);

    const fecha = new Date(factura.fechaEmision).toLocaleDateString('es-AR');

    // ⚠️ Aquí se genera el PDF real con la librería PDFKit
    // Por ahora devolvemos estructura y datos listos
    const datosPDF = {
      numeroFactura: factura.numeroFactura,
      emisor: `${factura.razonSocial} - CUIT ${factura.cuitEmisor}`,
      puntoVenta: factura.puntoVenta,
      tipo: factura.tipoFactura,
      fecha: fecha,
      total: factura.importeTotal,
      cae: factura.cae,
      vencimientoCAE: factura.vencimientoCAE
    };

    console.log("✅ Datos del PDF generados correctamente");
    return {
      ok: true,
      datos: datosPDF,
      pdfBase64: null // ← Acá irá el PDF codificado en Base64
    };

  } catch (error) {
    console.error("❌ ERROR generando PDF:", error.message);
    return { ok: false, error: error.message };
  }
}

module.exports = { generarPDF };