require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Configuración de la base de datos
const connectDatabase = require('./config/database');

// Middlewares
const authenticate = require('./middleware/authMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const restrictedUserRoutes = require('./routes/restrictedUserRoutes');

// Inicializar la aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global
app.use(cors({
  domains: '*',
  methods: "*"
}));
app.use(bodyParser.json());

// Conectar a la base de datos
connectDatabase();

// Rutas de la API
app.use('/api/session', authRoutes);
app.use('/api/users', userRoutes);

// Middleware de autenticación para las rutas protegidas
app.use(authenticate);

// Rutas protegidas
app.use('/api/restricted_users', restrictedUserRoutes);

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});