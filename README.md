# 🚀 GESTOR DE CONTACTOS - Oracle + React

[![Status](https://img.shields.io/badge/Status-Production-green.svg)]() [![React](https://img.shields.io/badge/React-18-blue.svg)]() [![Node.js](https://img.shields.io/badge/Node-20-green.svg)]()

**Gestión completa de contactos con búsqueda inteligente y Oracle ROQL.**

## ✨ DEMO

```
Backend: http://localhost:3001/api/contacts
Frontend: http://localhost:3002
```

## 📋 Características

✅ **Búsqueda avanzada** (Nombre/Email/Teléfono/Ciudad - OR múltiple)
✅ **CRUD completo** (Oracle + SQLite fallback)
✅ **Responsive** Bootstrap 5
✅ **Offline-first** caché local
✅ **50+ contactos** Oracle

## 🏗️ Arquitectura

```
Frontend (React) → Express API → Oracle ROQL + SQLite Cache
```

## 🚀 Instalación Rápida

```bash
# Backend
cd BACK-END
npm install
npm start  # Puerto 3001

# Frontend (nuevo terminal)
cd FRONT-END  
npm install
npm start   # Puerto 3002
```

## 🔧 Comandos

| Acción | Comando |
|--------|---------|
| Backend | `cd BACK-END && npm start` |
| Frontend | `cd FRONT-END && npm start` |

## 🛠️ Endpoints API

```bash
GET /api/contacts?name=texto&email=... # Lista filtrada
GET /api/contacts/cache # Caché local
POST /api/contacts # Crear
PUT /api/contacts/:id # Editar
DELETE /api/contacts/:id # Borrar
```

## 📊 Performance

| Operación | Tiempo |
|-----------|--------|
| Inicial | ~800ms |
| Búsqueda | ~300ms |
| CRUD | ~1.5s |

## 🧪 Datos Prueba

```
Sandra Giraldo
Ángela Monroy  
Hugo Casas
... +47 más
```

## 🎨 Tecnologías

![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node-20-green) 
![Oracle](https://img.shields.io/badge/Oracle-RightNow-orange)
![SQLite](https://img.shields.io/badge/SQLite-Cache-yellow)


---

