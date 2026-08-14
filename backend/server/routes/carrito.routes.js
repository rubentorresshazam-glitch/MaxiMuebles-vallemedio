const express = require('express');
const router = express.Router();

// ✅ Nombre corregido para que coincida con tu archivo
const carritoController = require('../controllers/carrito.controller');

// ⚠️ Si todavía NO tenés el middleware de autenticación, comenta la línea de abajo
const auth = require('../middlewares/auth');

// ✅ Rutas — Si no usás middleware todavía, borra "auth," y dejá solo el controlador
router.get('/', carritoController.verCarrito);
router.post('/', carritoController.agregar);
router.put('/:id', carritoController.actualizar);
router.delete('/:id', carritoController.eliminar);
router.delete('/vaciar', carritoController.vaciar); // ✅ Corregida la ruta

module.exports = router;