# Presentación del Proyecto: Gestor de Contactos

## Fecha: 24 de marzo de 2026

### Equipo: Maicol (Desarrollador)

---

## 1. Introducción al Proyecto

El proyecto es un **Gestor de Contactos** que permite buscar, crear, editar y eliminar contactos desde una interfaz web moderna. Integra datos reales de **Oracle Service Cloud** con un sistema de caché local para mejorar la experiencia de usuario.

**Objetivo principal**: Proporcionar una herramienta eficiente para gestionar contactos corporativos con búsqueda avanzada y operaciones CRUD completas.

---

## 2. Arquitectura del Sistema

### Arquitectura General
- **Frontend**: Aplicación web en React.js
- **Backend**: API REST en Node.js/Express
- **Base de Datos**: 
  - Principal: Oracle Service Cloud (API externa)
  - Caché: SQLite local para offline/respaldo
- **Comunicación**: HTTP/REST con Axios

### Diagrama de Arquitectura
```
[Usuario] → [React Frontend] → [Express Backend] → [Oracle Service Cloud API]
                                      ↓
                                 [SQLite Cache]
```

---

## 3. Tecnologías Utilizadas

### Lenguajes y Frameworks
- **JavaScript**: Lenguaje principal
- **React.js**: Framework frontend con hooks (useState, useEffect)
- **Node.js**: Runtime backend
- **Express.js**: Framework web para API REST

### Librerías y Dependencias
- **Frontend**:
  - React Bootstrap: Componentes UI
  - Axios: Cliente HTTP
  - Bootstrap: Estilos CSS
- **Backend**:
  - Axios: Cliente HTTP para Oracle API
  - SQLite3: Base de datos local
  - CORS: Cross-Origin Resource Sharing
  - Body-parser: Parseo de JSON
  - Nodemon: Desarrollo con recarga automática

### Herramientas de Desarrollo
- **VS Code**: Editor de código
- **npm**: Gestor de paquetes
- **Git**: Control de versiones
- **PowerShell/Bash**: Terminales

---

## 4. Funcionalidades Principales

### Búsqueda Avanzada
- Campos: Nombre, Correo, Teléfono, Ciudad
- Filtros en backend con ROQL (Oracle Query Language)
- Caché automático para datos offline

### Operaciones CRUD
- **Crear**: Formulario modal con validación
- **Leer**: Tabla paginada con búsqueda
- **Actualizar**: Edición inline con modal
- **Eliminar**: Confirmación de eliminación

### Características Técnicas
- **Manejo de Errores**: Fallback a caché si API falla
- **Estado de Carga**: Indicadores visuales durante requests
- **Responsive**: Diseño móvil-first con Bootstrap
- **Validación**: Sanitización de datos y filtros de seguridad

---

## 5. Cambios y Mejoras Realizadas

### Problemas Iniciales Resueltos
- **Pantalla en Blanco**: Arreglado manejo de estado y errores en búsqueda
- **Filtros Ineficientes**: Implementado ROQL en backend para búsquedas precisas
- **UX Mejorada**: Agregado loading states y mensajes de error

### Personalización Visual
- **Colores de Fondo**: Gradiente rojo-gris-blanco RGB
- **Transparencia**: Efecto vidrio con backdrop-filter
- **Bordes**: Bordes rojos semitransparentes con sombra
- **Orden de Campos**: Alineado formulario de búsqueda con tabla de resultados

### Optimizaciones de Código
- **Comentarios Removidos**: Código limpio para producción
- **Estructura**: Separación clara frontend/backend
- **Manejo de Estado**: useState y useEffect para React

---

## 6. Cómo Ejecutar el Proyecto

### Prerrequisitos
- Node.js instalado
- npm o yarn
- Conexión a internet (para Oracle API)

### Pasos de Instalación

#### Backend
```bash
cd BACK-END
npm install
npm run dev  # Puerto 3001
```

#### Frontend
```bash
cd FRONT-END
npm install
npm start    # Puerto 3000
```

### Configuración
- **API Base**: `http://localhost:3001/api/contacts`
- **Oracle Credentials**: Configurados en `server.js`
- **Puerto Frontend**: 3000
- **Puerto Backend**: 3001

---

## 7. Desafíos Técnicos y Soluciones

### Desafío 1: Integración con Oracle Service Cloud
- **Problema**: API compleja con autenticación
- **Solución**: Axios con auth básica, mapeo de datos, sanitización

### Desafío 2: Búsqueda Eficiente
- **Problema**: Pantalla en blanco por errores no manejados
- **Solución**: Filtros en backend, estado de carga, fallback a caché

### Desafío 3: UI/UX Moderna
- **Problema**: Interfaz básica
- **Solución**: Bootstrap + CSS custom con gradientes y transparencias

### Desafío 4: Rendimiento
- **Problema**: Requests lentos a API externa
- **Solución**: Caché SQLite local, validaciones previas

---

## 8. Conclusiones y Próximos Pasos

### Logros Alcanzados
- ✅ Sistema funcional completo
- ✅ Integración real con Oracle
- ✅ UI moderna y responsive
- ✅ Manejo robusto de errores
- ✅ Código limpio y optimizado

### Métricas de Éxito
- Búsqueda funciona sin pantalla en blanco
- Operaciones CRUD completas
- Tiempo de respuesta < 2s con caché
- Diseño visual atractivo

### Próximos Pasos Sugeridos
- Implementar autenticación de usuarios
- Agregar paginación avanzada
- Tests unitarios con Jest
- Despliegue en producción (Heroku/Vercel)
- Notificaciones en tiempo real

---

## 9. Preguntas y Respuestas

¿Preguntas para la presentación?

---

**Fin de la Presentación**

*Proyecto desarrollado con VS Code y GitHub Copilot*</content>
<parameter name="filePath">c:\Users\Maicol\Reto\PRESENTACION.md