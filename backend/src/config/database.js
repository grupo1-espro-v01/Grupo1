const mysql2 = require('mysql2/promise');

const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Verificar conexión al iniciar
pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a MySQL - Base de datos:', process.env.DB_NAME);
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err.message);
  });

module.exports = pool;