// ✅ Importamos el Model
const Facturacion = require('../models/Facturacion');

// 📌 SOLICITAR / GUARDAR CORREO PARA FACTURA
exports.solicitarFactura = async (req, res) => {
  try {
    const { correo, pago_id } = req.body;

    // ✅ Validaciones básicas
    if (!correo || !correo.includes('@')) {
      return res.json({ ok: false, mensaje: 'Correo electrónico inválido' });
    }
    if (!pago_id || pago_id === '—') {
      return res.json({ ok: false, mensaje: 'Falta el número de operación' });
    }

    // ✅ Llamamos al Model → guarda el correo
    const guardado = await Facturacion.guardarCorreo(pago_id, correo);

    if (!guardado) {
      return res.json({ ok: false, mensaje: 'No se encontró el pedido' });
    }

    console.log(`📧 Factura pedida: Pago ${pago_id} → ${correo.trim().toLowerCase()}`);

    res.json({
      ok: true,
      mensaje: `✅ ¡Listo! Tu factura será enviada a: ${correo}`
    });

  } catch (error) {
    console.error('❌ Error al solicitar factura:', error.message);
    res.json({ ok: false, mensaje: 'Error al guardar la solicitud' });
  }
};

// 📌 OBTENER DATOS DE UN PEDIDO PARA FACTURACIÓN
exports.datosParaFactura = async (req, res) => {
  try {
    const pago_id = req.params.pago_id || req.query.pago_id;
    if (!pago_id) {
      return res.json({ ok: false, mensaje: 'Falta el número de operación' });
    }

    // ✅ Llamamos al Model → trae todo: pedido + detalle
    const resultado = await Facturacion.obtenerPorPagoId(pago_id);

    if (!resultado) {
      return res.json({ ok: false, mensaje: 'Pedido no encontrado' });
    }

    res.json({
      ok: true,
      datos: {
        pedido: resultado.pedido,
        items: resultado.detalle
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener datos de factura:', error.message);
    res.json({ ok: false, mensaje: 'Error al obtener datos de factura' });
  }
};

// 📌 LISTAR TODAS LAS SOLICITUDES DE FACTURACIÓN (PARA VOS / ADMIN)
exports.listarSolicitudes = async (req, res) => {
  try {
    // ✅ Llamamos al Model
    const pedidos = await Facturacion.listarSolicitudes();

    res.json({ ok: true, datos: pedidos });
  } catch (error) {
    console.error('❌ Error al listar facturas:', error.message);
    res.json({ ok: false, mensaje: 'Error al listar solicitudes' });
  }
};