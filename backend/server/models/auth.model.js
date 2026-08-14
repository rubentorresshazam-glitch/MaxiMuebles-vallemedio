// Modelo de Autenticación / Usuarios
const db = require('../config/database');

class Auth {
    // Buscar usuario por correo
    static async buscarPorCorreo(correo) {
        const [usuarios] = await db.query(
            "SELECT * FROM usuarios WHERE correo = ?",
            [correo]
        );
        return usuarios[0];
    }

    // Crear nuevo usuario
    static async crear(datos) {
        const { nombre, correo, contraseña, telefono, direccion } = datos;
        const [resultado] = await db.query(
            "INSERT INTO usuarios (nombre, correo, contraseña, telefono, direccion) VALUES (?, ?, ?, ?, ?)",
            [nombre, correo, contraseña, telefono || null, direccion || null]
        );
        return resultado.insertId;
    }

    // Obtener usuario por ID
    static async buscarPorId(id) {
        const [usuarios] = await db.query(
            "SELECT id, nombre, correo, telefono, direccion, creado_en FROM usuarios WHERE id = ?",
            [id]
        );
        return usuarios[0];
    }
}

module.exports = Auth;