const pool = require('../config/database');

// GET /api/reportes/dashboard
const dashboard = async (req, res) => {
  try {
    // Total de denuncias
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM denuncias'
    );

    // Por estado
    const [porEstado] = await pool.query(
      `SELECT estado, COUNT(*) as cantidad 
       FROM denuncias GROUP BY estado`
    );

    // Por categoría
    const [porCategoria] = await pool.query(
      `SELECT categoria, COUNT(*) as cantidad 
       FROM denuncias GROUP BY categoria ORDER BY cantidad DESC`
    );

    // Por gravedad
    const [porGravedad] = await pool.query(
      `SELECT gravedad, COUNT(*) as cantidad 
       FROM denuncias GROUP BY gravedad`
    );

    // Denuncias últimos 7 días
    const [ultimos7dias] = await pool.query(
      `SELECT DATE(fecha_presentacion) as fecha, COUNT(*) as cantidad
       FROM denuncias
       WHERE fecha_presentacion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(fecha_presentacion)
       ORDER BY fecha ASC`
    );

    // Total usuarios activos por rol
    const [usuariosPorRol] = await pool.query(
      `SELECT rol, COUNT(*) as cantidad 
       FROM usuarios WHERE activo = 1 GROUP BY rol`
    );

    // Denuncias recientes (últimas 5)
    const [recientes] = await pool.query(
      `SELECT d.codigo_unico, d.categoria, d.estado, 
              d.gravedad, d.fecha_presentacion,
              u.nombre as fiscal_nombre
       FROM denuncias d
       LEFT JOIN usuarios u ON d.fiscal_id = u.id
       ORDER BY d.fecha_presentacion DESC
       LIMIT 5`
    );

    res.json({
      total,
      porEstado,
      porCategoria,
      porGravedad,
      ultimos7dias,
      usuariosPorRol,
      recientes
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// GET /api/reportes/exportar
const exportar = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        d.codigo_unico as Codigo,
        d.categoria as Categoria,
        d.gravedad as Gravedad,
        d.estado as Estado,
        d.anonima as Anonima,
        COALESCE(d.nombres_denunciante, 'Anonimo') as Denunciante,
        d.fecha_presentacion as Fecha,
        u.nombre as Fiscal,
        i.nombre as Investigador
       FROM denuncias d
       LEFT JOIN usuarios u ON d.fiscal_id = u.id
       LEFT JOIN asignaciones a ON d.id = a.denuncia_id
       LEFT JOIN usuarios i ON a.investigador_id = i.id
       ORDER BY d.fecha_presentacion DESC`
    );

    // Registrar en audit log
    await pool.query(
      'INSERT INTO audit_logs (usuario_id, accion, detalles_json) VALUES (?, ?, ?)',
      [req.usuario.id, 'EXPORTAR_REPORTE', JSON.stringify({ total: rows.length })]
    );

    res.json({
      total: rows.length,
      datos: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { dashboard, exportar };