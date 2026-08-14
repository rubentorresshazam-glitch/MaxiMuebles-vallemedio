// ✅ CORRECTO — con /promise al final
const mysql = require('mysql2/promise');

// ✅ Usamos POOL (mejor para Render) y variables con respaldo
const conexion = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USUARIO || process.env.DB_USER,
  password: process.env.DB_CONTRASENA || process.env.DB_PASSWORD,
  database: 'maximuebles',
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

// ✅ Verificamos la conexión
async function probarConexion() {
  try {
    await conexion.getConnection();
    console.log('✅ CONECTADO A BASE DE DATOS EN LA NUBE');
  } catch (error) {
    console.log('❌ ERROR CONEXIÓN BASE DE DATOS:', error.message);
  }
}
probarConexion();

module.exports = conexion;