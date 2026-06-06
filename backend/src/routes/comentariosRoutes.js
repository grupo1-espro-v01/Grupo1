const express = require('express');
const router = express.Router();
const { listarComentarios, crearComentario } = require('../controllers/comentariosController');
const { verificarToken, soloRoles } = require('../middlewares/auth');

// Solo investigadores y admin pueden ver y crear comentarios
router.get('/:denuncia_id', verificarToken, soloRoles('investigador', 'admin'), listarComentarios);
router.post('/', verificarToken, soloRoles('investigador', 'admin'), crearComentario);

module.exports = router;