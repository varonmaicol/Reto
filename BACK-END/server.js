const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const ORACLE_BASE = 'https://imaginecx--tst2.custhelp.com/services/rest/connect/v1.3/contacts';

const AUTH = {
  username: 'ICXCandidate',
  password: 'Welcome2024'
};

const db = new sqlite3.Database('./contacts.db', (err) => {
  if (err) console.error('SQLite open error:', err.message);
});

db.run(`CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT
)`);

const sanitize = (value = '') => String(value).trim();

const parseName = (rawName = '') => {
  const cleaned = sanitize(rawName);
  const [first = '', ...rest] = cleaned.split(' ').filter(Boolean);
  return { first, last: rest.join(' ') };
};

// 🔥 MAPPER CORREGIDO (FUNCIONA PARA AMBOS CASOS)
const mapOracleContact = (item = {}) => ({
  id: item.id,
  name: sanitize(
    item.lookupName ||
    [item.name?.first, item.name?.last].filter(Boolean).join(' ')
  ),
  email: sanitize(
    item.emails?.[0]?.address ||
    item['emails[0].address'] ||
    ''
  ),
  phone: sanitize(
    item.phones?.[0]?.number ||
    item['phones[0].number'] ||
    ''
  ),
  city: sanitize(
    item.address?.city ||
    item['address.city'] ||
    ''
  )
});

const isValidContactName = (name = '') => {
  if (!name) return false;
  if (name.includes('【') || name.includes('JNDqun')) return false;
  if (/\p{Script=Han}/u.test(name)) return false;
  if (name.length > 80) return false;
  if (/\d{6,}/.test(name)) return false;
  return true;
};

const escapeRoql = (value = '') =>
  String(value)
    .replace(/'/g, "\\'")
    .replace(/\\/g, '\\\\')
    .trim();

// 🔥 ROQL CORREGIDO (CLAVE)
const buildRoql = (params = {}) => {
  const filters = [];

  if (params.name) {
    const value = escapeRoql(params.name.toLowerCase().trim());
    filters.push(`LOWER(lookupName) LIKE '%${value}%'`);
  }

  if (params.email) {
    const value = escapeRoql(params.email.toLowerCase().trim());
    filters.push(`LOWER(emails.address) LIKE '%${value}%'`);
  }

  if (params.phone) {
    const value = escapeRoql(params.phone.trim());
    filters.push(`phones.number LIKE '%${value}%'`);
  }

  if (params.city) {
    const value = escapeRoql(params.city.toLowerCase().trim());
    filters.push(`LOWER(address.city) LIKE '%${value}%'`);
  }

  let query = `
    SELECT 
      id,
      lookupName,
      emails,
      phones,
      address
    FROM Contact
  `;

  if (filters.length) {
    query += ` WHERE ${filters.join(' AND ')}`;
  }

  return query;
};

// FILTROS
const applyFilters = (contacts = [], query = {}) =>
  contacts.filter((contact) => {
    if (query.email && !contact.email.toLowerCase().includes(query.email.trim().toLowerCase())) return false;
    if (query.phone && !contact.phone.includes(query.phone.trim())) return false;
    if (query.city && !contact.city.toLowerCase().includes(query.city.trim().toLowerCase())) return false;
    return true;
  });

const saveCache = (contacts = []) => {
  db.serialize(() => {
    db.run('DELETE FROM contacts');
    const stmt = db.prepare('INSERT INTO contacts VALUES (?, ?, ?, ?, ?)');
    contacts.forEach((c) => stmt.run(c.id, c.name, c.email, c.phone, c.city));
    stmt.finalize();
  });
};

// 🔥 FETCH
const fetchFromOracle = async (params = {}) => {
  const where = buildRoql(params);

  console.log('ROQL:', where);

  const oracleUrl = `${ORACLE_BASE}?q=${encodeURIComponent(where)}`;

  const response = await axios.get(oracleUrl, { auth: AUTH });

  const items = Array.isArray(response.data?.items) ? response.data.items : [];

  console.log('ITEM REAL:', JSON.stringify(items[0], null, 2)); // 👈 DEBUG

  return items
    .map(mapOracleContact)
    .filter((c) => isValidContactName(c.name));
};

const getCache = (res) => {
  db.all('SELECT * FROM contacts', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'No se puede acceder a la cache local' });
    }
    return res.json(rows || []);
  });
};

// GET
app.get('/api/contacts', async (req, res) => {
  try {
    const oracleContacts = await fetchFromOracle(req.query);
    const filteredContacts = applyFilters(oracleContacts, req.query);
    saveCache(filteredContacts);
    return res.json(filteredContacts);
  } catch (err) {
    console.error('GET error:', err?.response?.data || err.message || err);
    return getCache(res);
  }
});

app.get('/api/contacts/cache', (req, res) => getCache(res));

// POST
app.post('/api/contacts', async (req, res) => {
  const { name, email, phone, city } = req.body;

  const nameParts = parseName(name);

  const payload = {
    name: nameParts,
    emails: email
      ? [{ address: sanitize(email), addressType: { id: 0 } }]
      : [],
    phones: phone
      ? [{ number: sanitize(phone), phoneType: { id: 0 } }]
      : [],
    address: city ? { city: sanitize(city) } : undefined
  };

  try {
    const response = await axios.post(ORACLE_BASE, payload, { auth: AUTH });
    return res.json(response.data);
  } catch (err) {
    console.error('POST error:', JSON.stringify(err?.response?.data, null, 2));
    return res.status(500).json({ error: 'No se pudo crear el contacto' });
  }
});

// PUT
app.put('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, city } = req.body;

  const nameParts = parseName(name);

  const payload = {
    name: nameParts,
    emails: email
      ? [{ address: sanitize(email), addressType: { id: 1 } }]
      : [],
    phones: phone
      ? [{ number: sanitize(phone), phoneType: { id: 1 } }]
      : [],
    address: city ? { city: sanitize(city) } : undefined
  };

  try {
    const response = await axios.patch(`${ORACLE_BASE}/${id}`, payload, { auth: AUTH });
    return res.json(response.data);
  } catch (err) {
    console.error('PUT error:', JSON.stringify(err?.response?.data, null, 2));
    return res.status(500).json({ error: 'No se pudo actualizar el contacto' });
  }
});

// DELETE
app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await axios.delete(`${ORACLE_BASE}/${id}`, { auth: AUTH });
    return res.json({ message: 'Eliminado' });
  } catch (err) {
    console.error('DELETE error:', err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'No se pudo eliminar el contacto' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor BACK-END running on port ${PORT}`);
});    