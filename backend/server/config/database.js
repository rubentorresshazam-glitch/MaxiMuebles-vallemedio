const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'maximuebles',  // ← ESCRIBIMOS EL NOMBRE A MANO ASÍ NO FALLA
  ssl: { rejectUnauthorized: false }
});

conexion.connect((error) => {
  if (error) {
    console.log('❌ ERROR CONEXIÓN BASE DE DATOS:', error.message);
    return;
  }
  console.log('✅ CONECTADO A BASE DE DATOS EN LA NUBE');
});

module.exports = conexion;