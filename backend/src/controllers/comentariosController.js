const pool = require('../config/database');

// GET /api/comentarios/:denuncia_id
const listarComentarios = async (req, res) => {
  try {
    const { denuncia_id } = req.params;
    const [rows] = await pool.query(
      `SELECT c.*, u.nombre, u.apellido, u.rol 
       FROM comentarios c
       LEFT JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.denuncia_id = ?
       ORDER BY c.fecha DESC`,           // ← CORREGIDO: usa "fecha"
      [denuncia_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// POST /api/comentarios
const crearComentario = async (req, res) => {
  try {
    const { denuncia_id, texto } = req.body;

    if (!denuncia_id || !texto) {
      return res.status(400).json({ error: 'denuncia_id y texto son obligatorios.' });
    }

    const [result] = await pool.query(
      `INSERT INTO comentarios (denuncia_id, usuario_id, texto)
       VALUES (?, ?, ?)`,
      [denuncia_id, req.usuario.id, texto]
    );

    res.status(201).json({
      mensaje: 'Comentario agregado correctamente.',
      id: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { listarComentarios, crearComentario };