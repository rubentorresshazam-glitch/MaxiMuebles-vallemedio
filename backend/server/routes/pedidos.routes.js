const express = require('express');
const router = express.Router();

const pedidoController = require('../controllers/pedidos.controller');

// ✅ TODAS las rutas con el MISMO nombre: "pedidoController"
router.post('/', pedidoController.crearPedido);
router.get('/', pedidoController.misPedidos);
router.get('/:id', pedidoController.detallePedido);

module.exports = router;