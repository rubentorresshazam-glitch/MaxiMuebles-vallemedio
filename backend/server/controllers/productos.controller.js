// ✅ Importamos el Model
const Producto = require('../models/Producto');

// 📌 OBTENER TODOS LOS PRODUCTOS
exports.obtenerTodos = async (req, res) => {
  try {
    // ✅ Llamamos al Model → se encarga de la consulta
    const productos = await Producto.obtenerTodos();
    res.json({ ok: true, datos: productos });
  } catch (error) {
    console.error('❌ Error al obtener productos:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};

// 📌 OBTENER UN PRODUCTO POR ID
exports.obtenerPorId = async (req, res) => {
  try {
    const id = req.params.id || req.query.id;
    if (!id) {
      return res.json({ ok: false, mensaje: 'Falta el ID del producto' });
    }

    // ✅ Llamamos al Model
    const producto = await Producto.obtenerPorId(id);
    
    if (!producto) {
      return res.json({ ok: false, mensaje: 'Producto no encontrado' });
    }
    
    res.json({ ok: true, datos: producto });
  } catch (error) {
    console.error('❌ Error al obtener producto:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};

// 📌 CREAR NUEVO PRODUCTO
exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria, imagenes } = req.body;

    if (!nombre || !precio || stock === undefined) {
      return res.json({ ok: false, mensaje: 'Faltan datos obligatorios (nombre, precio, stock)' });
    }

    // ✅ Llamamos al Model
    const productoId = await Producto.crear({
      nombre: nombre.trim(),
      descripcion,
      precio,
      stock,
      categoria,
      imagenes
    });
    
    res.status(201).json({
      ok: true,
      mensaje: '✅ Producto creado correctamente',
      id: productoId
    });
  } catch (error) {
    console.error('❌ Error al crear producto:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};

// 📌 ACTUALIZAR PRODUCTO
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria, imagenes } = req.body;

    if (!id) {
      return res.json({ ok: false, mensaje: 'Falta el ID del producto' });
    }

    // ✅ Llamamos al Model
    await Producto.actualizar(id, {
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      imagenes
    });
    
    res.json({ ok: true, mensaje: '✅ Producto actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};

// 📌 ELIMINAR PRODUCTO
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.json({ ok: false, mensaje: 'Falta el ID del producto' });
    }

    // ✅ Llamamos al Model
    await Producto.eliminar(id);
    res.json({ ok: true, mensaje: '✅ Producto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};