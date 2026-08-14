// Modelo de Formulario de Contacto
const db = require('../config/database');

class Contacto {
    // Guardar mensaje recibido
    static async guardar(datos) {
        const { nombre, correo, telefono, asunto, mensaje } = datos;
        const [resultado] = await db.query(
            "INSERT INTO mensajes_contacto (nombre, correo, telefono, asunto, mensaje, fecha) VALUES (?, ?, ?, ?, ?, NOW())",
            [nombre, correo, telefono || null, asunto, mensaje]
        );
        return resultado.insertId;
    }

    // Obtener todos los mensajes
    static async obtenerTodos() {
        const [mensajes] = await db.query(
            "SELECT * FROM mensajes_contacto ORDER BY fecha DESC"
        );
        return mensajes;
    }
}

module.exports = Contacto;