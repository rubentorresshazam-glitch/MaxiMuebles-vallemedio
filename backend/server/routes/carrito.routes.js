const pool = require('../config/database');

// ✅ VER CARRITO — SOLO del usuario que pide
const verCarrito = async (req, res) => {
  try {
    const { usuario_id } = req.query;
    if (!usuario_id) {
      return res.status(400).json({ ok: false, mensaje: 'Falta el ID de usuario' });
    }

    const [carrito] = await pool.query(`
      SELECT c.id, c.producto_id, p.nombre, p.precio, c.cantidad, 
             (p.precio * c.cantidad) AS subtotal
      FROM carrito c
      JOIN productos p ON c.producto_id = p.id
      WHERE c.usuario_id = ?
    `, [usuario_id]);

    res.json({ ok: true, datos: carrito });
  } catch (error) {
    console.error('❌ Error al ver carrito:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al cargar el carrito' });
  }
};

// ✅ AGREGAR PRODUCTO — con verificación
const agregar = async (req, res) => {
  try {
    const { usuario_id, producto_id, cantidad = 1 } = req.body;
    if (!usuario_id || !producto_id) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan datos' });
    }

    // Verificar si ya está en el carrito → actualizar cantidad
    const [existe] = await pool.query(
      'SELECT id, cantidad FROM carrito WHERE usuario_id = ? AND producto_id = ?',
      [usuario_id, producto_id]
    );

    if (existe.length > 0) {
      const nuevaCant = existe[0].cantidad + Number(cantidad);
      await pool.query(
        'UPDATE carrito SET cantidad = ? WHERE id = ?',
        [nuevaCant, existe[0].id]
      );
      return res.json({ ok: true, mensaje: 'Cantidad actualizada' });
    }

    // Si no existe → agregarlo
    await pool.query(
      'INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)',
      [usuario_id, producto_id, cantidad]
    );

    res.json({ ok: true, mensaje: '✅ Producto agregado al carrito' });
  } catch (error) {
    console.error('❌ Error al agregar:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al agregar producto' });
  }
};

// ✅ ACTUALIZAR CANTIDAD — SOLO del usuario correcto
const actualizar = async (req, res) => {
  try {
    const { id } = req.params; // id del producto en el carrito
    const { usuario_id, cantidad } = req.body;

    if (!usuario_id || !cantidad) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan datos' });
    }

    const [result] = await pool.query(
      'UPDATE carrito SET cantidad = ? WHERE id = ? AND usuario_id = ?',
      [cantidad, id, usuario_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    }

    res.json({ ok: true, mensaje: '✅ Cantidad actualizada' });
  } catch (error) {
    console.error('❌ Error al actualizar:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar cantidad' });
  }
};

// ✅ ELIMINAR PRODUCTO — SOLO del usuario correcto
const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ ok: false, mensaje: 'Falta el ID de usuario' });
    }

    const [result] = await pool.query(
      'DELETE FROM carrito WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    }

    res.json({ ok: true, mensaje: '✅ Producto eliminado del carrito' });
  } catch (error) {
    console.error('❌ Error al eliminar:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar producto' });
  }
};

// ✅ VACIAR CARRITO COMPLETO
const vaciar = async (req, res) => {
  try {
    const { usuario_id } = req.body;
    if (!usuario_id) {
      return res.status(400).json({ ok: false, mensaje: 'Falta el ID de usuario' });
    }

    await pool.query('DELETE FROM carrito WHERE usuario_id = ?', [usuario_id]);
    res.json({ ok: true, mensaje: '✅ Carrito vaciado' });
  } catch (error) {
    console.error('❌ Error al vaciar:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al vaciar carrito' });
  }
};

module.exports = { verCarrito, agregar, actualizar, eliminar, vaciar };