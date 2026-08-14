const express = require('express');
const router = express.Router();
const { registro, login, obtenerPerfil, actualizarPerfil } = require('../controllers/usuarios.controller');

router.post('/registro', registro);
router.post('/login', login);
router.get('/mi-perfil', obtenerPerfil);
router.put('/mi-perfil', actualizarPerfil);

module.exports = router;