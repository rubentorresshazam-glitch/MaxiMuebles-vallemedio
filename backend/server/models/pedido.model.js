const db = require('../config/database');

class Pedido {
  // Crear pedido
  static async crear(datos) {
    const { usuario_id, total, direccion_entrega, mp_pago_id, estado = 'pendiente' } = datos;
    const [res] = await db.query(
      'INSERT INTO pedidos (usuario_id, total, direccion_entrega, estado, mp_pago_id) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, total, direccion_entrega, estado, mp_pago_id]
    );
    return res.insertId;
  }

  // Agregar detalle del pedido
  static async agregarDetalle(pedido_id, productos) {
    for (const item of productos) {
      await db.query(
        'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedido_id, item.producto_id || item.id, item.cantidad, item.precio]
      );
    }
    return true;
  }

  // Ver mis pedidos
  static async verPorUsuario(usuario_id) {
    const [filas] = await db.query(`
      SELECT id, total, direccion_entrega, estado, mp_pago_id, created_at 
      FROM pedidos 
      WHERE usuario_id = ? 
      ORDER BY created_at DESC
    `, [usuario_id]);
    return filas;
  }

  // Ver detalle de un pedido
  static async detalle(id, usuario_id) {
    const [pedido] = await db.query('SELECT * FROM pedidos WHERE id = ? AND usuario_id = ?', [id, usuario_id]);
    const [detalle] = await db.query(`
      SELECT dp.*, prod.nombre, prod.imagenes 
      FROM detalle_pedido dp
      JOIN productos prod ON dp.producto_id = prod.id
      WHERE dp.pedido_id = ?
    `, [id]);
    return { pedido: pedido[0], detalle };
  }

  // Actualizar estado
  static async cambiarEstado(id, estado) {
    await db.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
    return true;
  }
}

module.exports = Pedido;