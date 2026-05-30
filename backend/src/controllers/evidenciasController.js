const pool = require('../config/database');
const path = require('path');

// POST /api/evidencias/:denuncia_id
const subirEvidencia = async (req, res) => {
  try {
    const { denuncia_id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }

    // Verificar que la denuncia existe
    const [denuncia] = await pool.query(
      'SELECT * FROM denuncias WHERE id = ?', [denuncia_id]
    );

    if (denuncia.length === 0) {
      return res.status(404).json({ error: 'Denuncia no encontrada.' });
    }

    const archivo_url = `/uploads/evidencias/${req.file.filename}`;
    const tipo = path.extname(req.file.originalname).slice(1).toUpperCase();
    const tamano = req.file.size;

    await pool.query(
      'INSERT INTO evidencias (denuncia_id, archivo_url, tipo, tamano) VALUES (?, ?, ?, ?)',
      [denuncia_id, archivo_url, tipo, tamano]
    );

    await pool.query(
      'INSERT INTO audit_logs (usuario_id, accion, denuncia_id, detalles_json) VALUES (?, ?, ?, ?)',
      [req.usuario.id, 'SUBIR_EVIDENCIA', denuncia_id,
        JSON.stringify({ archivo: req.file.originalname, tipo, tamano })]
    );

    res.status(201).json({
      mensaje: 'Evidencia subida exitosamente.',
      archivo_url,
      tipo,
      tamano
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// GET /api/evidencias/:denuncia_id
const listarEvidencias = async (req, res) => {
  try {
    const { denuncia_id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM evidencias WHERE denuncia_id = ? ORDER BY fecha_subida DESC',
      [denuncia_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { subirEvidencia, listarEvidencias };