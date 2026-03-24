const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3002; // Different port to avoid conflicts

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./contacts-local.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    city TEXT
  )`);
  
  // Insert sample data
  const stmt = db.prepare('INSERT OR IGNORE INTO contacts (id, name, email, phone, city) VALUES (?, ?, ?, ?, ?)');
  stmt.run(uuidv4(), 'Monkey D. Luffy', 'luffy@strawhat.com', '123456', 'Foosha');
  stmt.run(uuidv4(), 'Moky D. Lufy', 'moky@test.com', '789012', 'Ciudad Test');
  stmt.run(uuidv4(), 'Test Contacto', 'test@test.com', '555555', 'Madrid');
  stmt.finalize();
});

// GET with search
app.get('/api/contacts', (req, res) => {
  const { name, email, phone, city } = req.query;
  
  let sql = 'SELECT * FROM contacts';
  const params = [];
  
  const conditions = [];
  if (name) conditions.push("LOWER(name) LIKE ?");
  if (email) conditions.push("LOWER(email) LIKE ?");
  if (phone) conditions.push("phone LIKE ?");
  if (city) conditions.push("LOWER(city) LIKE ?");
  
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' OR ');
    const searchTerm = `%${name || ''}%`;
    params.push(searchTerm, `%${email || ''}%`, `%${phone || ''}%`, `%${city || ''}%`);
  }
  
  console.log('SQL:', sql, params);
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST
app.post('/api/contacts', (req, res) => {
  const { name, email, phone, city } = req.body;
  const id = uuidv4();
  
  db.run('INSERT INTO contacts (id, name, email, phone, city) VALUES (?, ?, ?, ?, ?)',
    [id, name, email, phone, city],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, name, email, phone, city });
    }
  );
});

// PUT
app.put('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, city } = req.body;
  
  db.run('UPDATE contacts SET name = ?, email = ?, phone = ?, city = ? WHERE id = ?',
    [name, email, phone, city, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Contacto no encontrado' });
      }
      res.json({ id, name, email, phone, city });
    }
  );
});

// DELETE
app.delete('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM contacts WHERE id = ?', id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    res.json({ message: 'Eliminado correctamente' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor LOCAL running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/api/contacts?name=luffy`);
});
