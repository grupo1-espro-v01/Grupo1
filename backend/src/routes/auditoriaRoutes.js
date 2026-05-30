const express = require('express');
const router = express.Router();
const { listarLogs } = require('../controllers/auditoriaController');
const { verificarToken, soloRoles } = require('../middlewares/auth');

router.get('/', verificarToken, soloRoles('admin'), listarLogs);

module.exports = router;