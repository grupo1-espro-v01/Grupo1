const pool = require('../config/database');

// GET /api/auditoria
const listarLogs = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        a.id, a.accion, a.timestamp, a.detalles_json, a.ip,
        u.nombre, u.apellido, u.email,
        d.codigo_unico
       FROM audit_logs a
       LEFT JOIN usuarios u ON a.usuario_id = u.id
       LEFT JOIN denuncias d ON a.denuncia_id = d.id
       ORDER BY a.timestamp DESC
       LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { listarLogs };