require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });const bcrypt = require('bcryptjs');
const pool = require('./database');

const crearUsuarios = async () => {
  try {
    const usuarios = [
      {
        nombre: 'Administrador',
        apellido: 'Principal',
        email: 'admin@fgr.gob.sv',
        password: 'Admin123!',
        rol: 'admin'
      },
      {
        nombre: 'Fiscal',
        apellido: 'Auxiliar',
        email: 'fiscal1@fgr.gob.sv',
        password: 'Fiscal123!',
        rol: 'recepcion'
      },
      {
        nombre: 'Juan',
        apellido: 'Investigador',
        email: 'investigador1@fgr.gob.sv',
        password: 'Invest123!',
        rol: 'investigador'
      },
    ];

    for (const u of usuarios) {
      const hash = await bcrypt.hash(u.password, 10);
      await pool.query(
        `UPDATE usuarios SET password_hash = ? WHERE email = ?`,
        [hash, u.email]
      );
      console.log(`✅ Usuario actualizado: ${u.email}`);
    }

    console.log('✅ Todos los usuarios tienen contraseña hasheada.');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

crearUsuarios();
