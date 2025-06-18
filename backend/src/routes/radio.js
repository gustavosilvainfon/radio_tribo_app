const express = require('express');
const router = express.Router();
const db = require('../models/database').db;

// GET /api/radio/info - Informações da rádio
router.get('/info', (req, res) => {
  const query = `
    SELECT key, value FROM settings 
    WHERE key IN ('radio_name', 'radio_slogan', 'stream_url', 'phone', 'email', 'facebook', 'instagram', 'whatsapp')
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const info = {};
    rows.forEach(row => {
      info[row.key] = row.value;
    });
    
    res.json(info);
  });
});

// GET /api/radio/now-playing - Música tocando agora
router.get('/now-playing', (req, res) => {
  const query = `
    SELECT * FROM now_playing 
    WHERE is_current = 1 
    ORDER BY started_at DESC 
    LIMIT 1
  `;
  
  db.get(query, [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.json({
        song_title: 'Rádio Tribo FM',
        artist: 'Transmissão ao vivo',
        album: null,
        artwork_url: null,
        started_at: new Date().toISOString()
      });
    }
    
    res.json(row);
  });
});

// GET /api/radio/schedule - Programação da rádio
router.get('/schedule', (req, res) => {
  const query = `
    SELECT * FROM schedule 
    WHERE is_active = 1 
    ORDER BY day_of_week, start_time
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const schedule = {};
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    rows.forEach(row => {
      const dayName = days[row.day_of_week];
      if (!schedule[dayName]) {
        schedule[dayName] = [];
      }
      schedule[dayName].push({
        id: row.id,
        time: `${row.start_time} - ${row.end_time}`,
        show: row.show_name,
        host: row.host_name,
        description: row.description
      });
    });
    
    res.json(schedule);
  });
});

// POST /api/radio/update-now-playing - Atualizar música tocando agora
router.post('/update-now-playing', (req, res) => {
  const { song_title, artist, album, artwork_url, duration } = req.body;
  
  if (!song_title || !artist) {
    return res.status(400).json({ error: 'Título da música e artista são obrigatórios' });
  }
  
  // Desmarcar a música atual
  db.run('UPDATE now_playing SET is_current = 0', [], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Inserir nova música
    const insertQuery = `
      INSERT INTO now_playing (song_title, artist, album, artwork_url, duration, is_current)
      VALUES (?, ?, ?, ?, ?, 1)
    `;
    
    db.run(insertQuery, [song_title, artist, album, artwork_url, duration], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ 
        success: true, 
        id: this.lastID,
        message: 'Música atualizada com sucesso' 
      });
    });
  });
});

module.exports = router;