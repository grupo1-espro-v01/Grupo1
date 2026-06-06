const express = require('express');
const router = express.Router();
const { registrar, listar, consultarPorCodigo, cambiarEstado, listarMisAsignadas } = require('../controllers/denunciasController');
const { verificarToken, soloRoles } = require('../middlewares/auth');

// Pública — sin token
router.get('/consulta/:codigo', consultarPorCodigo);

// Protegidas — requieren token
router.post('/', verificarToken, soloRoles('admin', 'recepcion'), registrar);
router.get('/', verificarToken, listar);
router.patch('/:id/estado', verificarToken, soloRoles('admin', 'recepcion'), cambiarEstado);

// Pública — sin token, para ciudadanos
router.post('/publica', async (req, res) => {
  req.usuario = { id: 1 }; // fiscal por defecto
  const { registrar } = require('../controllers/denunciasController');
  return registrar(req, res);
});

router.get('/mis-asignadas', verificarToken, soloRoles('investigador'), listarMisAsignadas);

module.exports = router;