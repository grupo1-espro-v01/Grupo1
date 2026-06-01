const express = require('express');
const router = express.Router();
const { dashboard, exportar } = require('../controllers/reportesController');
const { verificarToken, soloRoles } = require('../middlewares/auth');

router.get('/dashboard', verificarToken, dashboard);
router.get('/exportar', verificarToken, soloRoles('admin'), exportar);

module.exports = router;