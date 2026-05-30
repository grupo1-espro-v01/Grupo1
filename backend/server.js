require('dotenv').config();
require('./src/config/database');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares globales
app.use(cors());
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

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API Sistema de Denuncias FGR - funcionando' });
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});