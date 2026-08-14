// ✅ Importamos el Model
const Carrito = require('../models/carrito.model');

// 📌 Ver carrito
exports.verCarrito = async (req, res) => {
  try {
    const usuario_id = req.usuarioId || req.query.usuario_id;
    if (!usuario_id) {
      return res.json({ ok: false, mensaje: 'Falta el ID de usuario' });
    }

    // ✅ Llamamos al Model
    const carrito = await Carrito.ver(usuario_id);
    res.json({ ok: true, datos: carrito });

  } catch (error) {
    console.error('❌ Error al leer carrito:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};

// 📌 Agregar al carrito
exports.agregar = async (req, res) => {
  try {
    const { producto_id, cantidad = 1 } = req.body;
    const usuario_id = req.usuarioId || req.body.usuario_id;

    if (!usuario_id || !producto_id) {
      return res.json({ ok: false, mensaje: 'Faltan datos obligatorios' });
    }

    // ✅ Llamamos al Model → maneja "ya existe" o "agregar nuevo"
    await Carrito.agregar(usuario_id, producto_id, cantidad);

    res.json({ ok: true, mensaje: '✅ Agregado al carrito' });

  } catch (error) {
    console.error('❌ Error al agregar al carrito:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};

// 📌 Actualizar cantidad
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;
    const usuario_id = req.usuarioId || req.body.usuario_id;

    if (!cantidad || cantidad < 1) {
      return res.json({ ok: false, mensaje: 'Cantidad inválida' });
    }

    // ✅ Llamamos al Model
    await Carrito.actualizar(id, usuario_id, cantidad);

    res.json({ ok: true, mensaje: '✅ Cantidad actualizada' });

  } catch (error) {
    console.error('❌ Error al actualizar carrito:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};

// 📌 Eliminar del carrito
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuarioId || req.query.usuario_id;

    // ✅ Llamamos al Model
    await Carrito.eliminar(id, usuario_id);

    res.json({ ok: true, mensaje: '✅ Eliminado del carrito' });

  } catch (error) {
    console.error('❌ Error al eliminar del carrito:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};

// 📌 Vaciar carrito
exports.vaciar = async (req, res) => {
  try {
    const usuario_id = req.usuarioId || req.query.usuario_id;

    // ✅ Llamamos al Model
    await Carrito.vaciar(usuario_id);

    res.json({ ok: true, mensaje: '✅ Carrito vaciado' });

  } catch (error) {
    console.error('❌ Error al vaciar carrito:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};