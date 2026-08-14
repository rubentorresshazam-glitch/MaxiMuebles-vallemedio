const express = require('express');
const router = express.Router();

// ✅ Nombre corregido: coincide con tu archivo "pedidoController.js"
const pedidoController = require('../controllers/pedidos.controller');

// ⚠️ Middleware de autenticación (lo creamos más adelante)
// const auth = require('../middlewares/auth');

// ✅ Rutas — por ahora SIN middleware, así funcionan de una
router.post('/', pedido.Controller.crearPedido);
router.get('/', pedido.Controller.misPedidos);
router.get('/:id', pedido.Controller.detallePedido);

module.exports = router;