require('dotenv').config();
require('./src/config/database');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares globales
app.use(cors({
  origin: [
    'https://grupo1-espro-v01.github.io',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (evidencias subidas)
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Rutas
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);
const denunciasRoutes = require('./src/routes/denunciasRoutes');
app.use('/api/denuncias', denunciasRoutes);
const asignacionRoutes = require('./src/routes/asignacionRoutes');
app.use('/api', asignacionRoutes);
const auditoriaRoutes = require('./src/routes/auditoriaRoutes');
app.use('/api/auditoria', auditoriaRoutes);
const evidenciasRoutes = require('./src/routes/evidenciasRoutes');
app.use('/api/evidencias', evidenciasRoutes);
const usuariosRoutes = require('./src/routes/usuariosRoutes');
app.use('/api/usuarios', usuariosRoutes);
const reportesRoutes = require('./src/routes/reportesRoutes');
app.use('/api/reportes', reportesRoutes);
const comentariosRoutes = require('./src/routes/comentariosRoutes');
app.use('/api/comentarios', comentariosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API Sistema de Denuncias FGR - funcionando' });
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});