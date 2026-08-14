const express = require('express');
const { enviarMensaje } = require('./../controllers/contacto.controller'); // ✅ Bien con puntos

const router = express.Router();

router.post('/enviar-contacto', enviarMensaje);

module.exports = router;