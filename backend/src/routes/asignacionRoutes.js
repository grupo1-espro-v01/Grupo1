const express = require('express');
const router = express.Router();
const { asignar, listarInvestigadores } = require('../controllers/asignacionController');
const { verificarToken, soloRoles } = require('../middlewares/auth');

router.get('/investigadores', verificarToken, listarInvestigadores);
router.post('/denuncias/:id/asignar', verificarToken, soloRoles('admin'), asignar);

module.exports = router;