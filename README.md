# API de YoutubeKids - Documentación

## Descripción
Esta API REST proporciona funcionalidades para la gestión de usuarios, sesiones y perfiles restringidos para una plataforma de streaming.

## Características principales
- Autenticación y autorización con JWT
- Registro de usuarios con confirmación por correo electrónico
- Gestión de sesiones de usuario
- Creación de perfiles restringidos por PIN
- Validación de permisos basada en roles

## Tecnologías utilizadas
- Node.js
- Express.js
- MongoDB con Mongoose
- JSON Web Tokens
- CryptoJS para encriptación
- Nodemailer para envío de correos

## Estructura de carpetas
```
/
├── controllers/
│   ├── sessionController.js
│   ├── userController.js
│   ├── restricted_usersController.js
│   └── views/
│       └── confirmation.html
├── models/
│   ├── userModel.js
│   ├── sessionModel.js
│   └── restricted_usersModel.js
├── .env
├── index.js

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
4. Ejecutar `node index.js` o `npm start` para iniciar el servidor

## Rutas disponibles

### Autenticación
- `POST /api/users` - Registro de usuario
- `GET /api/users/confirm` - Confirmación de correo electrónico
- `POST /api/session` - Inicio de sesión
- `DELETE /api/session` - Cierre de sesión

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
