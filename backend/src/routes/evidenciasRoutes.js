const express = require('express');
const router = express.Router();
const { subirEvidencia, listarEvidencias } = require('../controllers/evidenciasController');
const { verificarToken, soloRoles } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/:denuncia_id',
  verificarToken,
  soloRoles('admin', 'recepcion'),
  upload.single('archivo'),
  subirEvidencia
);

router.get('/:denuncia_id', verificarToken, listarEvidencias);

module.exports = router;