# API de YoutubeKids - Documentación

## Descripción
Esta API REST proporciona funcionalidades para la gestión de usuarios, sesiones, perfiles restringidos, playlists y videos para una plataforma de streaming infantil, con énfasis en la seguridad y mejores prácticas modernas.

## Características principales
- Autenticación y autorización con JWT y sistema de revocación de tokens
- Registro de usuarios con confirmación por correo electrónico
- Hash seguro de contraseñas con bcrypt
- Creación de perfiles restringidos por PIN
- Sistema de playlists y videos asociados a perfiles
- Validación de permisos basada en roles
- Arquitectura modular y mantenible
- Sistema de búsqueda de videos
- Verificación de edad mínima (18 años) para registro

## Tecnologías utilizadas
- Node.js
- Express.js
- MongoDB con Mongoose
- JSON Web Tokens (JWT)
- bcrypt para hash seguro de contraseñas
- Nodemailer para envío de correos
- CORS para acceso entre dominios

## Estructura de carpetas
```
/
├── config/
│   └── database.js               # Configuración de conexión a la BD
│
├── controllers/
│   ├── playlistController.js     # Lógica para manejo de playlists
│   ├── sessionController.js      # Lógica para manejo de sesiones
│   ├── userController.js         # Lógica para manejo de usuarios
│   ├── videoController.js        # Lógica para manejo de videos
│   ├── restricted_usersController.js  # Lógica para perfiles restringidos
│   └── views/
│       └── confirmation.html     # Plantilla para confirmación de email
│
├── middleware/
│   ├── authMiddleware.js         # Middleware de autenticación
│   ├── restrictedUserMiddleware.js # Middleware de autenticación por PIN
│   └── errorMiddleware.js        # Middleware para manejo de errores
│
├── models/
│   ├── blacklistedTokenModel.js  # Modelo para tokens revocados
│   ├── playlistModel.js          # Modelo para playlists
│   ├── restricted_usersModel.js  # Modelo para perfiles restringidos
│   ├── sessionModel.js           # Modelo para sesiones 
│   ├── userModel.js              # Modelo para usuarios
│   └── videoModel.js             # Modelo para videos
│
├── routes/
│   ├── authRoutes.js             # Rutas de autenticación
│   ├── playlistRoutes.js         # Rutas para playlists
│   ├── publicRoutes.js           # Rutas públicas
│   ├── restrictedUserRoutes.js   # Rutas para perfiles restringidos
│   ├── userRoutes.js             # Rutas para usuarios
│   └── videoRoutes.js            # Rutas para videos
│
├── .env                          # Variables de entorno (no incluido en repositorio)
├── .gitignore                    
├── index.js                      # Punto de entrada de la aplicación
└── package.json                  # Dependencias y scripts
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
   PORT=3000
   ```
4. Ejecutar `npm start` para iniciar el servidor en producción

## Seguridad mejorada

- **Hash de contraseñas**: Implementación de bcrypt para almacenamiento seguro de contraseñas
- **Revocación de tokens JWT**: Sistema para invalidar tokens después del cierre de sesión
- **Limpieza automática**: Los tokens revocados se eliminan automáticamente después de su expiración
- **Validación robusta**: Verificación de datos de entrada y manejo consistente de errores
- **Middleware de autenticación**: Protección centralizada de rutas sensibles
- **Verificación de PIN**: Sistema de acceso para perfiles infantiles mediante PIN
- **Confirmación por correo**: Verificación de cuentas mediante enlaces de activación

## Patrones de diseño implementados

- **MVC (Modelo-Vista-Controlador)**: Separación clara entre modelos de datos, lógica de negocio y rutas
- **Middleware**: Uso de middleware para funcionalidades transversales
- **Configuración centralizada**: Variables de entorno y configuración de base de datos en ubicaciones específicas
- **Manejo de errores**: Sistema centralizado para captura y procesamiento de errores
- **Rutas anidadas**: Estructura de rutas para APIs RESTful con distintos niveles de autenticación

## Estructura de la API

La API está dividida en tres grupos principales de rutas:

1. **Rutas públicas**: No requieren autenticación (registro, login, confirmación email)
2. **Rutas para administradores**: Requieren autenticación JWT (creación y gestión de perfiles, playlists y videos)
3. **Rutas para perfiles restringidos**: Accesibles mediante PIN (visualización y búsqueda de contenido)

## Gestión de contenido

- **Playlists**: Colecciones de videos que pueden asociarse a perfiles restringidos
- **Videos**: Elementos con referencias a URL de YouTube, asociados a playlists
- **Perfiles restringidos**: Cuentas para niños con acceso controlado mediante PIN

## Funcionalidades de búsqueda

La API ofrece capacidades de búsqueda de videos por nombre y descripción, limitando los resultados según el perfil que realiza la búsqueda (administrador o perfil restringido).

## Modelos de datos

- **Usuario**: Información del adulto administrador con datos de registro y acceso
- **Usuario restringido**: Perfil infantil con acceso limitado mediante PIN
- **Playlist**: Colección de videos asociada a un administrador y a perfiles restringidos
- **Video**: Elemento multimedia con referencias a YouTube
- **Token revocado**: Almacena tokens JWT invalidados hasta su expiración
- **Sesión**: Información sobre sesiones activas

## Colección de Postman

Para facilitar las pruebas de la API, se incluyen archivos de configuración para Postman:

- `KidsTube API.postman_collection.json`: Colección de endpoints organizados por categorías
- `KidsTube API.postman_environment.json`: Variables de entorno necesarias para las pruebas

### Configuración de Postman

1. Descarga e instala [Postman](https://www.postman.com/downloads/)
2. Importa la colección: `Archivo > Importar > Selecciona KidsTube API.postman_collection.json`
3. Importa el entorno: `Archivo > Importar > Selecciona KidsTube API.postman_environment.json`
4. Selecciona el entorno "KidsTube API" en el desplegable de entornos (esquina superior derecha)

### Estructura de la colección

La colección está organizada en 5 categorías principales:

1. **Autenticación**: Registro, confirmación, login y logout
2. **Perfiles Restringidos**: CRUD de perfiles infantiles
3. **Playlists**: CRUD de listas de reproducción
4. **Videos**: CRUD de videos y búsqueda
5. **Acceso Perfiles Restringidos**: Endpoints para acceso mediante PIN

### Flujo de prueba recomendado

1. Registra un usuario padre (Autenticación > Registro de Usuario)
2. Inicia sesión para obtener un token JWT (Autenticación > Login)
3. Crea un perfil restringido (Perfiles Restringidos > Crear Perfil Restringido)
4. Crea una playlist y asígnala al perfil (Playlists > Crear Playlist)
5. Añade videos a la playlist (Videos > Agregar Video a Playlist)
6. Prueba el acceso con PIN (Acceso Perfiles Restringidos > Verificar PIN de Perfil)

### Notas importantes

- Los scripts de prueba de Postman guardan automáticamente IDs, tokens y PINs en variables de entorno
- Las pruebas están encadenadas para facilitar el flujo completo sin necesidad de copiar/pegar IDs manualmente
- Cada endpoint incluye una descripción detallada de su funcionamiento

## Contribución

Las contribuciones son bienvenidas. Por favor, haz un fork del repositorio y crea un pull request para proponer cambios.