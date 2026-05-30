const pool = require('../config/database');

// POST /api/denuncias/:id/asignar
const asignar = async (req, res) => {
  try {
    const { id } = req.params;
    const { investigador_id } = req.body;

    if (!investigador_id) {
      return res.status(400).json({ error: 'El investigador_id es obligatorio.' });
    }

    // Verificar que el investigador existe y tiene el rol correcto
    const [investigador] = await pool.query(
      'SELECT * FROM usuarios WHERE id = ? AND rol = "investigador" AND activo = 1',
      [investigador_id]
    );

    if (investigador.length === 0) {
      return res.status(404).json({ error: 'Investigador no encontrado o no tiene el rol correcto.' });
    }

    // Verificar que la denuncia existe
    const [denuncia] = await pool.query(
      'SELECT * FROM denuncias WHERE id = ?', [id]
    );

    if (denuncia.length === 0) {
      return res.status(404).json({ error: 'Denuncia no encontrada.' });
    }

    // Generar número de expediente
    const numeroExpediente = `EXP-${new Date().getFullYear()}-${String(id).padStart(4,'0')}`;

    // Insertar asignación
    await pool.query(
      `INSERT INTO asignaciones (denuncia_id, investigador_id, numero_expediente)
       VALUES (?, ?, ?)`,
      [id, investigador_id, numeroExpediente]
    );

    // Cambiar estado de la denuncia
    await pool.query(
      'UPDATE denuncias SET estado = "Asignada" WHERE id = ?', [id]
    );

    // Audit log
    await pool.query(
      'INSERT INTO audit_logs (usuario_id, accion, denuncia_id, detalles_json) VALUES (?, ?, ?, ?)',
      [req.usuario.id, 'ASIGNACION', id, JSON.stringify({ investigador_id, numeroExpediente })]
    );

    res.json({
      mensaje: 'Denuncia asignada exitosamente.',
      numero_expediente: numeroExpediente,
      investigador: `${investigador[0].nombre} ${investigador[0].apellido}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// GET /api/asignaciones — listar investigadores disponibles
const listarInvestigadores = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.email,
        COUNT(a.id) as casos_asignados
       FROM usuarios u
       LEFT JOIN asignaciones a ON u.id = a.investigador_id
       WHERE u.rol = 'investigador' AND u.activo = 1
       GROUP BY u.id`,
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { asignar, listarInvestigadores };