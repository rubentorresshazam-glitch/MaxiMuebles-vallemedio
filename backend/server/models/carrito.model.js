const db = require('../config/database');

class Carrito {
  // Ver carrito de un usuario
  static async ver(usuario_id) {
    const [filas] = await db.query(`
      SELECT c.id, c.cantidad, p.nombre, p.precio, p.imagenes 
      FROM carrito c 
      JOIN productos p ON c.producto_id = p.id 
      WHERE c.usuario_id = ?
    `, [usuario_id]);
    return filas;
  }

  // Verificar si ya existe
  static async existe(usuario_id, producto_id) {
    const [filas] = await db.query(
      'SELECT id, cantidad FROM carrito WHERE usuario_id = ? AND producto_id = ?',
      [usuario_id, producto_id]
    );
    return filas[0];
  }

  // Agregar
  static async agregar(usuario_id, producto_id, cantidad) {
    const existe = await this.existe(usuario_id, producto_id);
    
    if (existe) {
      await db.query(
        'UPDATE carrito SET cantidad = cantidad + ? WHERE id = ?',
        [cantidad, existe.id]
      );
    } else {
      await db.query(
        'INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)',
        [usuario_id, producto_id, cantidad]
      );
    }
    return true;
  }

  // Actualizar cantidad
  static async actualizar(id, usuario_id, cantidad) {
    await db.query(
      'UPDATE carrito SET cantidad = ? WHERE id = ? AND usuario_id = ?',
      [cantidad, id, usuario_id]
    );
    return true;
  }

  // Eliminar
  static async eliminar(id, usuario_id) {
    await db.query(
      'DELETE FROM carrito WHERE id = ? AND usuario_id = ?',
      [id, usuario_id]
    );
    return true;
  }

  // Vaciar
  static async vaciar(usuario_id) {
    await db.query('DELETE FROM carrito WHERE usuario_id = ?', [usuario_id]);
    return true;
  }
}

module.exports = Carrito;