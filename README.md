# API de YoutubeKids - Documentación

## Descripción
Esta API REST proporciona funcionalidades para la gestión de usuarios, sesiones y perfiles restringidos para una plataforma de streaming, con énfasis en la seguridad y mejores prácticas modernas.

## Características principales
- Autenticación y autorización con JWT y sistema de revocación de tokens
- Registro de usuarios con confirmación por correo electrónico
- Hash seguro de contraseñas con bcrypt
- Creación de perfiles restringidos por PIN
- Validación de permisos basada en roles
- Arquitectura modular y mantenible

## Tecnologías utilizadas
- Node.js
- Express.js
- MongoDB con Mongoose
- JSON Web Tokens (JWT)
- bcrypt para hash seguro de contraseñas
- Nodemailer para envío de correos

## Estructura de carpetas
```
/
├── config/
│   └── database.js               # Configuración de conexión a la BD
│
├── controllers/
│   ├── sessionController.js      # Lógica para manejo de sesiones
│   ├── userController.js         # Lógica para manejo de usuarios
│   ├── restricted_usersController.js  # Lógica para perfiles restringidos
│   └── views/
│       └── confirmation.html     # Plantilla para confirmación de email
│
├── middleware/
│   ├── authMiddleware.js         # Middleware de autenticación
│   └── errorMiddleware.js        # Middleware para manejo de errores
│
├── models/
│   ├── blacklistedTokenModel.js  # Modelo para tokens revocados
│   ├── restricted_usersModel.js  # Modelo para perfiles restringidos
│   ├── sessionModel.js           # Modelo para sesiones 
│   └── userModel.js              # Modelo para usuarios
│
├── routes/
│   ├── authRoutes.js             # Rutas de autenticación
│   ├── restrictedUserRoutes.js   # Rutas para perfiles restringidos
│   └── userRoutes.js             # Rutas para usuarios
│
├── .env                          
├── .gitignore                    
├── index.js                      
└── package.json                  
```

## Instalación

1. Clonar el repositorio
2. Ejecutar `npm install` para instalar las dependencias
3. Crear un archivo `.env` con las siguientes variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/streaming_app
   JWT_SECRET=mi_secreto_super_seguro
   GMAIL_USER=tu_correo@gmail.com
   GMAIL_PASS=tu_contraseña_app
   ```
4. Ejecutar `npm start` para iniciar el servidor en producción o `npm run dev` para modo desarrollo con nodemon

## Seguridad mejorada

- **Hash de contraseñas**: Implementación de bcrypt para almacenamiento seguro de contraseñas
- **Revocación de tokens JWT**: Sistema para invalidar tokens después del cierre de sesión
- **Limpieza automática**: Los tokens revocados se eliminan automáticamente después de su expiración
- **Validación robusta**: Verificación de datos de entrada y manejo consistente de errores
- **Middleware de autenticación**: Protección centralizada de rutas sensibles

## Patrones de diseño implementados

- **MVC (Modelo-Vista-Controlador)**: Separación clara entre modelos de datos, lógica de negocio y rutas
- **Middleware**: Uso de middleware para funcionalidades transversales
- **Configuración centralizada**: Variables de entorno y configuración de base de datos en ubicaciones específicas
- **Manejo de errores**: Sistema centralizado para captura y procesamiento de errores

## Rutas disponibles

### Autenticación
- `POST /api/users` - Registro de usuario
- `GET /api/users/confirm` - Confirmación de correo electrónico
- `POST /api/session` - Inicio de sesión
- `DELETE /api/session` - Cierre de sesión (revoca el token JWT)

### Usuarios
- `GET /api/users` - Obtener todos los usuarios (requiere autenticación)
- `GET /api/users?id={userId}` - Obtener usuario por ID (requiere autenticación)
- `PATCH /api/users?id={userId}` - Actualizar usuario (requiere autenticación y permisos)
- `DELETE /api/users?id={userId}` - Eliminar usuario (requiere autenticación y permisos)

### Usuarios restringidos
- `POST /api/restricted_users` - Crear usuario restringido (requiere autenticación)
- `GET /api/restricted_users` - Obtener todos los usuarios restringidos del administrador (requiere autenticación)
- `GET /api/restricted_users?id={restrictedUserId}` - Obtener usuario restringido por ID (requiere autenticación y permisos)
- `GET /api/restricted_users?pin={pin}` - Obtener perfil restringido por PIN
- `PATCH /api/restricted_users?id={restrictedUserId}` - Actualizar usuario restringido (requiere autenticación y permisos)
- `DELETE /api/restricted_users?id={restrictedUserId}` - Eliminar usuario restringido (requiere autenticación y permisos)