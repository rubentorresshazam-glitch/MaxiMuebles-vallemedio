const Pedido = require('../models/pedido.model');
const Carrito = require('../models/carrito.model');
const Producto = require('../models/producto.model');
const db = require('../config/database'); // ✅ Mantenemos para la transacción

// 📌 Crear pedido desde el carrito
exports.crearPedido = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const usuario_id = req.usuarioId || req.body.usuario_id;
    const { direccion_entrega } = req.body;

    if (!usuario_id) {
      await connection.rollback();
      return res.json({ ok: false, mensaje: 'Falta el ID de usuario' });
    }

    // ✅ Traer productos del carrito
    const [carrito] = await connection.query(`
      SELECT c.producto_id, c.cantidad, p.precio, p.stock, p.nombre
      FROM carrito c JOIN productos p ON c.producto_id = p.id
      WHERE c.usuario_id = ?
    `, [usuario_id]);

    if (carrito.length === 0) {
      await connection.rollback();
      return res.json({ ok: false, mensaje: 'El carrito está vacío' });
    }

    // ✅ Calcular total y verificar stock
    let total = 0;
    for (const item of carrito) {
      if (item.cantidad > item.stock) {
        await connection.rollback();
        return res.json({ 
          ok: false, 
          mensaje: `Sin stock suficiente para: ${item.nombre || 'Producto'} (Disponible: ${item.stock})` 
        });
      }
      total += item.cantidad * item.precio;
    }

    // ✅ Crear pedido usando el Model
    const pedido_id = await Pedido.crear({
      usuario_id,
      total,
      direccion_entrega: direccion_entrega || 'Sin dirección',
      estado: 'pendiente'
    });

    // ✅ Guardar detalle y descontar stock
    for (const item of carrito) {
      await connection.query(
        'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedido_id, item.producto_id, item.cantidad, item.precio]
      );
      await connection.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [item.cantidad, item.producto_id]
      );
    }

    // ✅ Vaciar carrito usando el Model
    await Carrito.vaciar(usuario_id);

    await connection.commit();
    res.json({ 
      ok: true, 
      mensaje: '✅ Pedido creado correctamente', 
      pedido_id, 
      total 
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error al crear pedido:', error.message);
    res.json({ ok: false, mensaje: error.message });
  } finally {
    connection.release();
  }
};

// 📌 Ver mis pedidos
exports.misPedidos = async (req, res) => {
  try {
    const usuario_id = req.usuarioId || req.query.usuario_id;
    if (!usuario_id) {
      return res.json({ ok: false, mensaje: 'Falta el ID de usuario' });
    }

    // ✅ Llamamos al Model
    const pedidos = await Pedido.verPorUsuario(usuario_id);
    res.json({ ok: true, datos: pedidos });

  } catch (error) {
    console.error('❌ Error al listar pedidos:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};

// 📌 Ver detalle de un pedido
exports.detallePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuarioId || req.query.usuario_id;

    // ✅ Llamamos al Model
    const resultado = await Pedido.detalle(id, usuario_id);
    
    if (!resultado.pedido) {
      return res.json({ ok: false, mensaje: 'Pedido no encontrado' });
    }

    res.json({ ok: true, datos: resultado.detalle });

  } catch (error) {
    console.error('❌ Error al ver detalle:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};