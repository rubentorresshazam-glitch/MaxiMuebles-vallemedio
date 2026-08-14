// ✅ Importamos el Model
const Usuario = require('../models/usuario.model');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'MaxiMuebles_2026_Secreto';

// 📌 REGISTRO
exports.registro = async (req, res) => {
  try {
    const { nombre, correo, telefono, clave, direccion } = req.body;

    if (!nombre || !correo || !clave) {
      return res.json({ ok: false, mensaje: 'Faltan datos obligatorios' });
    }

    const correoLimpio = correo.trim().toLowerCase();

    // ✅ Llamamos al Model
    const existe = await Usuario.buscarPorCorreo(correoLimpio);
    if (existe) {
      return res.json({ ok: false, mensaje: 'Correo ya registrado' });
    }

    const usuarioId = await Usuario.crear({
      nombre: nombre.trim(),
      correo: correoLimpio,
      clave: clave.trim(),
      telefono: telefono?.trim(),
      direccion: direccion?.trim()
    });

    res.json({ ok: true, mensaje: '✅ Cuenta creada con éxito', id: usuarioId });

  } catch (error) {
    console.error('❌ Registro:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};

// 📌 LOGIN
exports.login = async (req, res) => {
  try {
    const { correo, clave } = req.body;
    const correoLimpio = correo.trim().toLowerCase();
    const claveLimpia = clave.trim();

    const usuario = await Usuario.buscarPorCorreo(correoLimpio);

    if (!usuario || usuario.clave !== claveLimpia) {
      return res.json({ ok: false, mensaje: 'Correo o clave incorrectos' });
    }

    const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      ok: true,
      mensaje: '✅ Bienvenido',
      datos: {
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo
        }
      }
    });

  } catch (error) {
    console.error('❌ Login:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};

// 📌 OBTENER PERFIL
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuarioId || req.query.usuario_id;
    if (!usuarioId) {
      return res.json({ ok: false, mensaje: 'Falta el ID de usuario' });
    }

    const usuario = await Usuario.buscarPorId(usuarioId);
    if (!usuario) {
      return res.json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    res.json({ ok: true, datos: usuario });

  } catch (error) {
    console.error('❌ Perfil:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};

// 📌 ACTUALIZAR PERFIL
exports.actualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuarioId || req.body.usuario_id;
    if (!usuarioId) {
      return res.json({ ok: false, mensaje: 'Falta el ID de usuario' });
    }

    const { nombre, telefono, direccion } = req.body;

    await Usuario.actualizar(usuarioId, { nombre, telefono, direccion });

    res.json({ ok: true, mensaje: '✅ Perfil actualizado' });

  } catch (error) {
    console.error('❌ Actualizar perfil:', error.message);
    res.json({ ok: false, mensaje: error.message });
  }
};