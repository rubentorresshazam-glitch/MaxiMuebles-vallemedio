const express = require('express');
const router = express.Router();

// ✅ Nombre corregido: coincide con tu archivo "productoController.js"
const productoController = require('../controllers/productos.controller');

// ⚠️ Middleware de autenticación (lo creamos enseguida)
// const auth = require('../middlewares/auth');

// ✅ Rutas PÚBLICAS (cualquiera puede ver los productos)
router.get('/', productoController.obtenerTodos);
router.get('/:id', productoController.obtenerPorId);

// ✅ Rutas PROTEGIDAS (solo administradores)
// Por ahora SIN auth → funcionan mientras terminamos todo
router.post('/', productoController.crear);
router.put('/:id', productoController.actualizar);
router.delete('/:id', productoController.eliminar);

// Cuando quieras protegerlas, solo agregá "auth," así:
// router.post('/', auth, productoController.crear);

module.exports = router;