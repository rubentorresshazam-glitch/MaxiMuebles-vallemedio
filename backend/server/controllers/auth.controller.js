```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'MaxiMuebles_2026_Secreto';

// Registro
exports.registro = async (req, res) => {
  try {
    const { nombre, correo, telefono, clave } = req.body;

    if (!nombre || !correo || !clave) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios' });
    }

    const correoLimpio = correo.trim().toLowerCase();

    const [existe] = await db.query('SELECT id FROM usuarios WHERE correo = ?', [correoLimpio]);
    if (existe.length > 0) {
      return res.status(400).json({ ok: false, mensaje: 'Este correo ya está registrado' });
    }

    const claveEncriptada = await bcrypt.hash(clave.trim(), 10);

    const sql = 'INSERT INTO usuarios (nombre, correo, telefono, clave) VALUES (?, ?, ?, ?)';
    const [resultado] = await db.query(sql, [
      nombre.trim(),
      correoLimpio,
      telefono?.trim() || null,
      claveEncriptada
    ]);

    res.status(201).json({
      ok: true,
      mensaje: 'Cuenta creada correctamente',
      datos: { id: resultado.insertId, nombre: nombre.trim(), correo: correoLimpio }
    });

  } catch (error) {
    console.error('❌ ERROR REGISTRO:', error);
    res.status(500).json({ ok: false, mensaje: 'Error en el servidor' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { correo, clave } = req.body;

    const correoLimpio = correo.trim().toLowerCase();
    const claveLimpia = clave.trim();

    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correoLimpio]);
    if (usuarios.length === 0) {
      return res.status(401).json({ ok: false, mensaje: 'Correo o contraseña incorrectos' });
    }

    const usuario = usuarios[0];
    const claveValida = await bcrypt.compare(claveLimpia, usuario.clave);
    if (!claveValida) {
      return res.status(401).json({ ok: false, mensaje: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      ok: true,
      mensaje: '¡Bienvenido!',
      datos: {
        token,
        usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo }
      }
    });

  } catch (error) {
    console.error('❌ ERROR LOGIN:', error);
    res.status(500).json({ ok: false, mensaje: 'Error en el servidor' });
  }
};
```