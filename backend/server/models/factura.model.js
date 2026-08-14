const db = require('../config/database');

class Facturacion {
  // Guardar correo de facturación
  static async guardarCorreo(pago_id, correo) {
    const [res] = await db.query(
      "UPDATE pedidos SET correo_factura = ? WHERE mp_pago_id = ?",
      [correo.trim().toLowerCase(), pago_id]
    );
    return res.affectedRows > 0;
  }

  // Obtener datos para factura
  static async obtenerPorPagoId(pago_id) {
    const [pedidos] = await db.query(`
      SELECT p.*, u.nombre as usuario_nombre, u.correo as usuario_correo, u.telefono, u.direccion
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.mp_pago_id = ?
      LIMIT 1
    `, [pago_id]);

    if (pedidos.length === 0) return null;

    const pedido = pedidos[0];
    const [detalle] = await db.query(`
      SELECT dp.*, prod.nombre, prod.imagenes
      FROM detalle_pedido dp
      JOIN productos prod ON dp.producto_id = prod.id
      WHERE dp.pedido_id = ?
    `, [pedido.id]);

    return { pedido, detalle };
  }

  // Listar todas las solicitudes de factura
  static async listarSolicitudes() {
    const [filas] = await db.query(`
      SELECT id, usuario_id, total, direccion_entrega, correo_factura, 
             mp_pago_id, estado, created_at
      FROM pedidos 
      WHERE correo_factura IS NOT NULL AND correo_factura != ''
      ORDER BY created_at DESC
    `);
    return filas;
  }
}

module.exports = Facturacion;