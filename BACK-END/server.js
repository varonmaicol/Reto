// Importación de módulos necesarios para el servidor
const express = require('express'); // Framework web para Node.js
const axios = require('axios'); // Cliente HTTP para hacer peticiones a APIs externas
const sqlite3 = require('sqlite3').verbose(); // Biblioteca para interactuar con bases de datos SQLite
const cors = require('cors'); // Middleware para permitir solicitudes CORS

// Creación de la aplicación Express
const app = express();
const PORT = 3001; // Puerto en el que el servidor escuchará

// Configuración de middlewares
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Parsea el cuerpo de las peticiones como JSON

// URL base de la API de Oracle Service Cloud para contactos
const ORACLE_BASE = 'https://imaginecx--tst2.custhelp.com/services/rest/connect/v1.3/contacts';

// Credenciales de autenticación para la API de Oracle
const AUTH = {
  username: 'ICXCandidate',
  password: 'Welcome2024'
};

// Inicialización de la base de datos SQLite local para caché
const db = new sqlite3.Database('./contacts.db', (err) => {
  if (err) console.error('SQLite open error:', err.message);
});

// Creación de la tabla de contactos si no existe
db.run(`CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT
)`);

// Función para sanitizar valores (eliminar espacios en blanco)
const sanitize = (value = '') => String(value).trim();

// Función para parsear nombres en first y last
const parseName = (rawName = '') => {
  const cleaned = sanitize(rawName);
  const [first = '', ...rest] = cleaned.split(' ').filter(Boolean);
  return { first, last: rest.join(' ') };
};

// Función para mapear datos de contacto desde Oracle a nuestro formato
const mapOracleContact = (item = {}) => ({
  id: item.id,
  name: sanitize(
    item.lookupName || // Usa lookupName si existe
    [item.name?.first, item.name?.last].filter(Boolean).join(' ') // O combina first y last
  ),
  email: sanitize(
    item.emails?.[0]?.address || // Primer email del array
    item['emails[0].address'] || // Formato alternativo
    ''
  ),
  phone: sanitize(
    item.phones?.[0]?.number || // Primer teléfono del array
    item['phones[0].number'] || // Formato alternativo
    ''
  ),
  city: sanitize(
    item.address?.city || // Ciudad de la dirección
    item['address.city'] || // Formato alternativo
    ''
  )
});

// Función para validar si un nombre de contacto es válido (filtra datos inválidos)
const isValidContactName = (name = '') => {
  if (!name) return false; // Nombre vacío no es válido
  if (name.includes('【') || name.includes('JNDqun')) return false; // Filtra caracteres específicos inválidos
  if (/\p{Script=Han}/u.test(name)) return false; // Filtra caracteres chinos
  if (name.length > 80) return false; // Longitud máxima
  if (/\d{6,}/.test(name)) return false; // Evita nombres con muchos números
  return true;
};

// Función para escapar caracteres especiales en consultas ROQL
const escapeRoql = (value = '') =>
  String(value)
    .replace(/'/g, "\\'") // Escapa comillas simples
    .replace(/\\/g, '\\\\') // Escapa barras invertidas
    .trim();

// Función para construir la consulta ROQL basada en parámetros de búsqueda
const buildRoql = (params = {}) => {
  const filters = []; // Array para almacenar filtros
  console.log('QUERY PARAMS:', params); // Log para debugging

  // Filtro por nombre: busca cada palabra en lookupName
  // Filtro por nombre: busca cada palabra en lookupName
  if (params.name) {
    const words = params.name.toLowerCase().trim().split(/\\s+/).filter(Boolean);
    words.forEach(word => {
      const value = escapeRoql(word);
      filters.push(`LOWER(lookupName) LIKE '%${value}%'`);
    });
  }

  // Filtro por email: busca en la tabla relacionada Emails
  if (params.email) {
    const value = escapeRoql(params.email.toLowerCase().trim());
    filters.push(`EXISTS (SELECT 1 FROM Contact.Emails e WHERE LOWER(e.Address) LIKE '%${value}%')`);
  }

  // Filtro por teléfono: busca en la tabla relacionada Phones
  if (params.phone) {
    const value = escapeRoql(params.phone.trim());
    filters.push(`EXISTS (SELECT 1 FROM Contact.Phones p WHERE p.Number LIKE '%${value}%')`);
  }

  // Filtro por ciudad: busca en address.city
  if (params.city) {
    const value = escapeRoql(params.city.toLowerCase().trim());
    filters.push(`LOWER(address.city) LIKE '%${value}%'`);
  }

  // Construcción de la consulta base
  let query = `
    SELECT 
      id,
      lookupName,
      emails,
      phones,
      address
    FROM Contact
  `;

  // Agrega filtros si existen, usando OR para mejor coincidencia
  if (filters.length) {
    query += ` WHERE ${filters.join(' OR ')}`; // OR instead of AND for better matching
  }

  return query;
};

// Función para aplicar filtros adicionales a los contactos (usada para caché)
const applyFilters = (contacts = [], query = {}) =>
  contacts.filter((contact) => {
    if (query.name && !contact.name.toLowerCase().includes(query.name.trim().toLowerCase())) return false;
    if (query.email && !contact.email.toLowerCase().includes(query.email.trim().toLowerCase())) return false;
    if (query.phone && !contact.phone.includes(query.phone.trim())) return false;
    if (query.city && !contact.city.toLowerCase().includes(query.city.trim().toLowerCase())) return false;
    return true;
  });

// Función para guardar contactos en la caché local (SQLite)
const saveCache = (contacts = []) => {
  db.serialize(() => {
    db.run('DELETE FROM contacts'); // Borra datos anteriores
    const stmt = db.prepare('INSERT INTO contacts VALUES (?, ?, ?, ?, ?)'); // Prepara inserción
    contacts.forEach((c) => stmt.run(c.id, c.name, c.email, c.phone, c.city)); // Inserta cada contacto
    stmt.finalize(); // Finaliza la declaración
  });
};

// Función para obtener contactos desde la API de Oracle
const fetchFromOracle = async (params = {}) => {
  const where = buildRoql(params); // Construye la consulta ROQL

  console.log('ROQL:', where); // Log de la consulta

  const oracleUrl = `${ORACLE_BASE}?q=${encodeURIComponent(where)}`; // URL completa

  const response = await axios.get(oracleUrl, { auth: AUTH }); // Petición GET con autenticación

  const items = Array.isArray(response.data?.items) ? response.data.items : []; // Extrae items

  console.log('ITEM REAL:', JSON.stringify(items[0], null, 2)); // Log del primer item para debug

  return items
    .map(mapOracleContact) // Mapea a nuestro formato
    .filter((c) => isValidContactName(c.name)); // Filtra nombres válidos
};

// Función para obtener contactos desde la caché
const getCache = (res) => {
  db.all('SELECT * FROM contacts', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'No se puede acceder a la cache local' });
    }
    return res.json(rows || []);
  });
};

// Ruta GET para obtener contactos (con búsqueda)
app.get('/api/contacts', async (req, res) => {
  try {
    const oracleContacts = await fetchFromOracle(req.query); // Obtiene de Oracle
    const filteredContacts = applyFilters(oracleContacts, req.query); // Aplica filtros adicionales
    saveCache(filteredContacts); // Guarda en caché
    return res.json(filteredContacts); // Responde con los contactos
  } catch (err) {
    console.error('GET error:', err?.response?.data || err.message || err);
    // Si falla Oracle, obtiene de caché y filtra
    db.all('SELECT * FROM contacts', (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'No se puede acceder a la cache local' });
      }
      const filtered = applyFilters(rows || [], req.query);
      res.json(filtered);
    });
  }
});

// Ruta GET para obtener solo la caché (sin filtros)
app.get('/api/contacts/cache', (req, res) => getCache(res));

// Ruta POST para crear un nuevo contacto
app.post('/api/contacts', async (req, res) => {
  const { name, email, phone, city } = req.body; // Extrae datos del cuerpo

  const nameParts = parseName(name); // Parsea el nombre

  const newContact = {
    id: Date.now(), // ID local temporal
    name: sanitize(name),
    email: sanitize(email),
    phone: sanitize(phone),
    city: sanitize(city)
  };

  try {
    // Intenta crear en Oracle
    const response = await axios.post(ORACLE_BASE, {
      name: nameParts,
      emails: email ? [{ address: sanitize(email), addressType: { id: 0 } }] : [],
      phones: phone ? [{ number: sanitize(phone), phoneType: { id: 0 } }] : [],
      address: city ? { city: sanitize(city) } : undefined
    }, { auth: AUTH });
    console.log('Oracle POST success:', response.data.id);
    newContact.id = response.data.id; // Actualiza ID con el de Oracle
  } catch (oracleErr) {
    console.error('Oracle POST failed, using local:', oracleErr.message);
  }

  // Siempre guarda en caché local
  db.serialize(() => {
    const stmt = db.prepare('INSERT INTO contacts VALUES (?, ?, ?, ?, ?)');
    stmt.run(newContact.id, newContact.name, newContact.email, newContact.phone, newContact.city);
    stmt.finalize();
  });

  res.json(newContact); // Responde con el contacto creado
});

// Ruta PUT para actualizar un contacto
app.put('/api/contacts/:id', async (req, res) => {
  const { id } = req.params; // ID del contacto a actualizar
  const { name, email, phone, city } = req.body; // Nuevos datos

  const updatedContact = {
    id: parseInt(id),
    name: sanitize(name),
    email: sanitize(email),
    phone: sanitize(phone),
    city: sanitize(city)
  };

  try {
    // Intenta actualizar en Oracle
    const nameParts = parseName(name);
    const payload = {
      name: nameParts,
      emails: email ? [{ address: sanitize(email), addressType: { id: 1 } }] : [],
      phones: phone ? [{ number: sanitize(phone), phoneType: { id: 1 } }] : [],
      address: city ? { city: sanitize(city) } : undefined
    };
    const response = await axios.patch(`${ORACLE_BASE}/${id}`, payload, { auth: AUTH });
    console.log('Oracle PUT success');
  } catch (oracleErr) {
    console.error('Oracle PUT failed, updating local:', oracleErr.message);
  }

  // Siempre actualiza en caché local
  db.run('UPDATE contacts SET name = ?, email = ?, phone = ?, city = ? WHERE id = ?', 
    updatedContact.name, updatedContact.email, updatedContact.phone, updatedContact.city, id);

  res.json(updatedContact); // Responde con el contacto actualizado
});

// Ruta DELETE para eliminar un contacto
app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params; // ID del contacto a eliminar

  try {
    // Intenta eliminar en Oracle
    await axios.delete(`${ORACLE_BASE}/${id}`, { auth: AUTH });
    console.log('Oracle DELETE success');
  } catch (oracleErr) {
    console.error('Oracle DELETE failed, removing local:', oracleErr.message);
  }

  // Siempre elimina de caché local
  db.run('DELETE FROM contacts WHERE id = ?', id, function(err) {
    if (err) {
      console.error('Local DELETE error:', err);
    }
  });

  res.json({ message: 'Eliminado (Oracle/Local)' }); // Responde con mensaje de éxito
});

// Inicia el servidor en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor BACK-END running on port ${PORT}`);
});    