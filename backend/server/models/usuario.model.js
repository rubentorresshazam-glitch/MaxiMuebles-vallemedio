const db = require('../config/database');

class Usuario {
  // Buscar por correo
  static async buscarPorCorreo(correo) {
    const [filas] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    return filas[0];
  }

  // Buscar por ID
  static async buscarPorId(id) {
    const [filas] = await db.query('SELECT id, nombre, correo, telefono, direccion, created_at FROM usuarios WHERE id = ?', [id]);
    return filas[0];
  }

  // Crear nuevo usuario
  static async crear(datos) {
    const { nombre, correo, clave, telefono, direccion } = datos;
    const [res] = await db.query(
      'INSERT INTO usuarios (nombre, correo, clave, telefono, direccion) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo, clave, telefono || null, direccion || null]
    );
    return res.insertId;
  }

  // Actualizar perfil
  static async actualizar(id, datos) {
    const { nombre, telefono, direccion } = datos;
    await db.query(
      'UPDATE usuarios SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?',
      [nombre, telefono || null, direccion || null, id]
    );
    return true;
  }
}

module.exports = Usuario;