const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/database').db;

const JWT_SECRET = process.env.JWT_SECRET || 'radio-tribo-secret-key';

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// POST /api/admin/login - Login do admin
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  }

  const query = 'SELECT * FROM users WHERE username = ?';
  
  db.get(query, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Atualizar último login
    db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  });
});

// GET /api/admin/dashboard - Dashboard data
router.get('/dashboard', authenticateToken, (req, res) => {
  const queries = {
    totalListeners: 'SELECT COUNT(*) as count FROM stats WHERE date = date("now")',
    todayStats: 'SELECT * FROM stats WHERE date = date("now") LIMIT 1',
    recentSongs: 'SELECT * FROM now_playing ORDER BY started_at DESC LIMIT 10',
    activeShows: 'SELECT COUNT(*) as count FROM schedule WHERE is_active = 1'
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    if (key === 'recentSongs') {
      db.all(query, [], (err, rows) => {
        results[key] = err ? [] : rows;
        completed++;
        if (completed === total) {
          res.json(results);
        }
      });
    } else {
      db.get(query, [], (err, row) => {
        results[key] = err ? null : row;
        completed++;
        if (completed === total) {
          res.json(results);
        }
      });
    }
  });
});

// GET /api/admin/settings - Buscar todas as configurações
router.get('/settings', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM settings ORDER BY key';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = {
        value: row.value,
        description: row.description,
        updated_at: row.updated_at
      };
    });
    
    res.json(settings);
  });
});

// PUT /api/admin/settings - Atualizar configurações
router.put('/settings', authenticateToken, (req, res) => {
  const settings = req.body;
  
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Configurações inválidas' });
  }

  const updatePromises = Object.entries(settings).map(([key, value]) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT OR REPLACE INTO settings (key, value, updated_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `;
      
      db.run(query, [key, value], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  Promise.all(updatePromises)
    .then(() => {
      res.json({ success: true, message: 'Configurações atualizadas com sucesso' });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

// GET /api/admin/schedule - Buscar programação
router.get('/schedule', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM schedule ORDER BY day_of_week, start_time';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/admin/schedule - Criar nova programação
router.post('/schedule', authenticateToken, (req, res) => {
  const { day_of_week, start_time, end_time, show_name, host_name, description } = req.body;
  
  if (!day_of_week || !start_time || !end_time || !show_name) {
    return res.status(400).json({ error: 'Campos obrigatórios: day_of_week, start_time, end_time, show_name' });
  }

  const query = `
    INSERT INTO schedule (day_of_week, start_time, end_time, show_name, host_name, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [day_of_week, start_time, end_time, show_name, host_name, description], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({ 
      success: true, 
      id: this.lastID,
      message: 'Programação criada com sucesso' 
    });
  });
});

// PUT /api/admin/schedule/:id - Atualizar programação
router.put('/schedule/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { day_of_week, start_time, end_time, show_name, host_name, description, is_active } = req.body;
  
  const query = `
    UPDATE schedule 
    SET day_of_week = ?, start_time = ?, end_time = ?, show_name = ?, host_name = ?, description = ?, is_active = ?
    WHERE id = ?
  `;
  
  db.run(query, [day_of_week, start_time, end_time, show_name, host_name, description, is_active, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Programação não encontrada' });
    }
    
    res.json({ success: true, message: 'Programação atualizada com sucesso' });
  });
});

// DELETE /api/admin/schedule/:id - Deletar programação
router.delete('/schedule/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM schedule WHERE id = ?';
  
  db.run(query, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Programação não encontrada' });
    }
    
    res.json({ success: true, message: 'Programação deletada com sucesso' });
  });
});

module.exports = router;