const express = require('express');
const router = express.Router();

// ✅ Nombre corregido: coincide con tu archivo "usuarioController.js"
const usuarioController = require('../controllers/usuarios.controller');

// ⚠️ Middleware de autenticación (lo creamos enseguida)
// const auth = require('../middlewares/auth');

// ✅ Rutas públicas
router.post('/registro', usuarioController.registro);
router.post('/login', usuarioController.login);

// ✅ Rutas protegidas — por ahora SIN auth, después le sacás los //
router.get('/perfil', usuarioController.obtenerPerfil);
router.put('/perfil', usuarioController.actualizarPerfil);

// Cuando tengas el middleware listo, queda así:
// router.get('/perfil', auth, usuarioController.obtenerPerfil);
// router.put('/perfil', auth, usuarioController.actualizarPerfil);

module.exports = router;