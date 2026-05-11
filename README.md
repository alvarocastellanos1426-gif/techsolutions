# TechSolutions - Sistema de Gestión Empresarial

Sistema web full-stack para la gestión de clientes, proyectos y tareas de la empresa TechSolutions S.A.

## 🌐 URLs del Sistema

- **Frontend:** https://techsolutions-frontend.vercel.app
- **Backend:** https://techsolutions-jsrv.onrender.com

## 📋 Descripción

Sistema web empresarial que permite centralizar la información, automatizar procesos básicos y mejorar la toma de decisiones de la empresa TechSolutions S.A.

## ✅ Funcionalidades

- Autenticación de usuarios con JWT
- Roles: Administrador y Usuario
- Gestión completa de Clientes (CRUD)
- Gestión completa de Proyectos (CRUD)
- Gestión completa de Tareas (CRUD)
- Interfaz responsiva y moderna

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- React Hook Form

### Backend
- Node.js
- Express
- JSON Web Token (JWT)
- Bcryptjs
- Supabase JS

### Base de Datos
- Supabase (PostgreSQL en la nube)

### Despliegue
- Frontend: Vercel
- Backend: Render

## 🚀 Instalación Local

### Requisitos previos
- Node.js v18 o superior
- Git

### Clonar el repositorio

```bash
git clone https://github.com/alvarocastellanos1426-gif/techsolutions.git
cd techsolutions
```

### Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` con las siguientes variables:

```
PORT=3000
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_key_de_supabase
JWT_SECRET=tu_jwt_secret
```

Iniciar el servidor:

```bash
npm run dev
```

### Configurar el Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🗄️ Estructura de la Base de Datos

### Tabla: usuarios
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| nombre | VARCHAR | Nombre del usuario |
| correo | VARCHAR | Correo electrónico |
| password | VARCHAR | Contraseña encriptada |
| rol | VARCHAR | admin / usuario |

### Tabla: clientes
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| nombre | VARCHAR | Nombre del cliente |
| correo | VARCHAR | Correo electrónico |
| telefono | VARCHAR | Teléfono |
| empresa | VARCHAR | Empresa |
| estado | VARCHAR | activo / inactivo |

### Tabla: proyectos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| nombre | VARCHAR | Nombre del proyecto |
| descripcion | TEXT | Descripción |
| fecha_inicio | DATE | Fecha de inicio |
| fecha_fin | DATE | Fecha de fin |
| estado | VARCHAR | pendiente / en progreso / completado |
| cliente_id | UUID | Referencia al cliente |

### Tabla: tareas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| nombre | VARCHAR | Nombre de la tarea |
| responsable | VARCHAR | Responsable |
| prioridad | VARCHAR | alta / media / baja |
| estado | VARCHAR | pendiente / en progreso / completado |
| proyecto_id | UUID | Referencia al proyecto |

## 📁 Estructura del Proyecto

```
techsolutions/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── clientes.js
│   │   │   ├── proyectos.js
│   │   │   └── tareas.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── index.js
│   │   └── supabase.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Clientes.jsx
    │   │   ├── Proyectos.jsx
    │   │   └── Tareas.jsx
    │   ├── api.js
    │   └── App.jsx
    └── package.json
```

## 🔐 Credenciales de Prueba

- **Correo:** admin@techsolutions.com
- **Contraseña:** admin123
- **Rol:** Administrador

## 📡 Endpoints de la API

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/registro | Registrar usuario |
| POST | /api/auth/login | Iniciar sesión |

### Clientes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/clientes | Listar clientes |
| POST | /api/clientes | Crear cliente |
| PUT | /api/clientes/:id | Editar cliente |
| DELETE | /api/clientes/:id | Eliminar cliente |

### Proyectos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/proyectos | Listar proyectos |
| POST | /api/proyectos | Crear proyecto |
| PUT | /api/proyectos/:id | Editar proyecto |
| DELETE | /api/proyectos/:id | Eliminar proyecto |

### Tareas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/tareas | Listar tareas |
| POST | /api/tareas | Crear tarea |
| PUT | /api/tareas/:id | Editar tarea |
| DELETE | /api/tareas/:id | Eliminar tarea |

## 👨‍💻 Autor

Alvaro Jose Castellanos de la Cruz
