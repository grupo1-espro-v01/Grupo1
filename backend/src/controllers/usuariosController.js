const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// GET /api/usuarios
const listar = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, apellido, email, rol, activo, creado_en FROM usuarios ORDER BY creado_en DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// POST /api/usuarios
const crear = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol } = req.body;

    if (!nombre || !apellido || !email || !password || !rol) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const rolesValidos = ['admin', 'recepcion', 'investigador'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido.' });
    }

    // Verificar si el email ya existe
    const [existe] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?', [email]
    );
    if (existe.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, email, hash, rol]
    );

    await pool.query(
      'INSERT INTO audit_logs (usuario_id, accion, detalles_json) VALUES (?, ?, ?)',
      [req.usuario.id, 'CREAR_USUARIO', JSON.stringify({ email, rol })]
    );

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente.',
      id: result.insertId,
      email,
      rol
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// PATCH /api/usuarios/:id/estado
const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (activo === undefined) {
      return res.status(400).json({ error: 'El campo activo es obligatorio.' });
    }

    // No puede desactivarse a sí mismo
    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes desactivar tu propio usuario.' });
    }

    await pool.query(
      'UPDATE usuarios SET activo = ? WHERE id = ?', [activo, id]
    );

    await pool.query(
      'INSERT INTO audit_logs (usuario_id, accion, detalles_json) VALUES (?, ?, ?)',
      [req.usuario.id, activo ? 'ACTIVAR_USUARIO' : 'DESACTIVAR_USUARIO',
        JSON.stringify({ usuario_id: id })]
    );

    res.json({ mensaje: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente.` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { listar, crear, cambiarEstado };