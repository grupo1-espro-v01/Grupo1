const pool = require('../config/database');

// Generar código único
const generarCodigo = async () => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as total FROM denuncias'
  );
  const num = rows[0].total + 1;
  return `DEN-${new Date().getFullYear()}-${String(num).padStart(3, '0')}`;
};

// POST /api/denuncias — registrar denuncia
const registrar = async (req, res) => {
  try {
    const {
      descripcion, categoria, gravedad,
      anonima, nombres_denunciante,
      documento_identidad, correo_electronico, telefono
    } = req.body;

    if (!descripcion || !categoria || !gravedad) {
      return res.status(400).json({ error: 'Descripción, categoría y gravedad son obligatorios.' });
    }

    const codigo = await generarCodigo();

    const [result] = await pool.query(
      `INSERT INTO denuncias 
       (codigo_unico, fiscal_id, descripcion, categoria, gravedad, anonima,
        nombres_denunciante, documento_identidad, correo_electronico, telefono)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo, req.usuario.id, descripcion, categoria, gravedad,
        anonima || false,
        anonima ? null : nombres_denunciante,
        anonima ? null : documento_identidad,
        anonima ? null : correo_electronico,
        anonima ? null : telefono,
      ]
    );

    // Audit log
    await pool.query(
      'INSERT INTO audit_logs (usuario_id, accion, denuncia_id, detalles_json) VALUES (?, ?, ?, ?)',
      [req.usuario.id, 'REGISTRO_DENUNCIA', result.insertId, JSON.stringify({ codigo })]
    );

    res.status(201).json({
      mensaje: 'Denuncia registrada exitosamente.',
      codigo,
      id: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// GET /api/denuncias — listar todas
const listar = async (req, res) => {
  try {
    const { estado, categoria } = req.query;
    let query = `
      SELECT d.*, u.nombre as fiscal_nombre, u.apellido as fiscal_apellido
      FROM denuncias d
      LEFT JOIN usuarios u ON d.fiscal_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (estado) { query += ' AND d.estado = ?'; params.push(estado); }
    if (categoria) { query += ' AND d.categoria = ?'; params.push(categoria); }

    query += ' ORDER BY d.fecha_presentacion DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// GET /api/denuncias/consulta/:codigo — consulta pública
const consultarPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const [rows] = await pool.query(
      'SELECT codigo_unico, categoria, estado, fecha_presentacion FROM denuncias WHERE codigo_unico = ?',
      [codigo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró ninguna denuncia con ese código.' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// PATCH /api/denuncias/:id/estado — cambiar estado
const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['Nueva','Asignada','En Investigacion','Resuelta','Archivada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido.' });
    }

    await pool.query('UPDATE denuncias SET estado = ? WHERE id = ?', [estado, id]);

    await pool.query(
      'INSERT INTO audit_logs (usuario_id, accion, denuncia_id, detalles_json) VALUES (?, ?, ?, ?)',
      [req.usuario.id, 'CAMBIO_ESTADO', id, JSON.stringify({ estado })]
    );

    res.json({ mensaje: `Estado actualizado a: ${estado}` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { registrar, listar, consultarPorCodigo, cambiarEstado };