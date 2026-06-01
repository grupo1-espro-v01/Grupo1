const express = require('express');
const router = express.Router();
const { listar, crear, cambiarEstado } = require('../controllers/usuariosController');
const { verificarToken, soloRoles } = require('../middlewares/auth');

router.get('/', verificarToken, soloRoles('admin'), listar);
router.post('/', verificarToken, soloRoles('admin'), crear);
router.patch('/:id/estado', verificarToken, soloRoles('admin'), cambiarEstado);

module.exports = router;