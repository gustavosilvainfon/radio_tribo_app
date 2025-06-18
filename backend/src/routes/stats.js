const express = require('express');
const router = express.Router();
const db = require('../models/database').db;

// GET /api/stats/listeners - Estatísticas de ouvintes
router.get('/listeners', (req, res) => {
  const query = `
    SELECT date, listeners_count, peak_listeners, total_sessions, avg_listen_time
    FROM stats 
    ORDER BY date DESC 
    LIMIT 30
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/stats/listener-join - Registrar novo ouvinte
router.post('/listener-join', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Verificar se já existe registro para hoje
  db.get('SELECT * FROM stats WHERE date = ?', [today], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (row) {
      // Atualizar estatísticas existentes
      const query = `
        UPDATE stats 
        SET listeners_count = listeners_count + 1,
            peak_listeners = MAX(peak_listeners, listeners_count + 1),
            total_sessions = total_sessions + 1
        WHERE date = ?
      `;
      
      db.run(query, [today], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Ouvinte registrado' });
      });
    } else {
      // Criar novo registro
      const query = `
        INSERT INTO stats (date, listeners_count, peak_listeners, total_sessions)
        VALUES (?, 1, 1, 1)
      `;
      
      db.run(query, [today], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Primeiro ouvinte do dia registrado' });
      });
    }
  });
});

// POST /api/stats/listener-leave - Registrar saída de ouvinte
router.post('/listener-leave', (req, res) => {
  const { listen_time } = req.body; // em segundos
  const today = new Date().toISOString().split('T')[0];
  
  db.get('SELECT * FROM stats WHERE date = ?', [today], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (row) {
      const newListenerCount = Math.max(0, row.listeners_count - 1);
      const newAvgTime = listen_time ? 
        Math.round((row.avg_listen_time * row.total_sessions + listen_time) / row.total_sessions) :
        row.avg_listen_time;
      
      const query = `
        UPDATE stats 
        SET listeners_count = ?, avg_listen_time = ?
        WHERE date = ?
      `;
      
      db.run(query, [newListenerCount, newAvgTime, today], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Saída de ouvinte registrada' });
      });
    } else {
      res.json({ success: true, message: 'Nenhum registro encontrado para hoje' });
    }
  });
});

// GET /api/stats/summary - Resumo das estatísticas
router.get('/summary', (req, res) => {
  const queries = {
    today: `
      SELECT listeners_count, peak_listeners, total_sessions, avg_listen_time
      FROM stats 
      WHERE date = date('now')
    `,
    week: `
      SELECT 
        SUM(total_sessions) as total_sessions,
        AVG(peak_listeners) as avg_peak,
        AVG(avg_listen_time) as avg_time
      FROM stats 
      WHERE date >= date('now', '-7 days')
    `,
    month: `
      SELECT 
        SUM(total_sessions) as total_sessions,
        MAX(peak_listeners) as max_peak,
        AVG(avg_listen_time) as avg_time
      FROM stats 
      WHERE date >= date('now', '-30 days')
    `
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, [], (err, row) => {
      results[key] = err ? null : (row || {});
      completed++;
      if (completed === total) {
        res.json(results);
      }
    });
  });
});

module.exports = router;