const db = require('../config/database');

class Producto {
  // Traer todos
  static async obtenerTodos() {
    const [filas] = await db.query('SELECT * FROM productos ORDER BY id DESC');
    return filas;
  }

  // Traer uno por ID
  static async obtenerPorId(id) {
    const [filas] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
    return filas[0];
  }

  // Crear
  static async crear(datos) {
    const { nombre, descripcion, precio, stock, imagenes, categoria } = datos;
    const [res] = await db.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, imagenes, categoria) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, descripcion || null, precio, stock || 0, imagenes || null, categoria || null]
    );
    return res.insertId;
  }

  // Actualizar
  static async actualizar(id, datos) {
    const { nombre, descripcion, precio, stock, imagenes, categoria } = datos;
    await db.query(
      'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, imagenes = ?, categoria = ? WHERE id = ?',
      [nombre, descripcion || null, precio, stock || 0, imagenes || null, categoria || null, id]
    );
    return true;
  }

  // Eliminar
  static async eliminar(id) {
    await db.query('DELETE FROM productos WHERE id = ?', [id]);
    return true;
  }

  // Descontar stock
  static async descontarStock(id, cantidad) {
    await db.query(
      'UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [cantidad, id, cantidad]
    );
    return true;
  }
}

module.exports = Producto;