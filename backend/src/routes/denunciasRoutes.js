const express = require('express');
const router = express.Router();
const { registrar, listar, consultarPorCodigo, cambiarEstado } = require('../controllers/denunciasController');
const { verificarToken, soloRoles } = require('../middlewares/auth');

// Pública — sin token
router.get('/consulta/:codigo', consultarPorCodigo);

// Protegidas — requieren token
router.post('/', verificarToken, soloRoles('admin', 'recepcion'), registrar);
router.get('/', verificarToken, listar);
router.patch('/:id/estado', verificarToken, soloRoles('admin', 'recepcion'), cambiarEstado);

module.exports = router;