const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, '../data/radio.db'), (err) => {
      if (err) {
        console.error('Erro ao conectar com o banco:', err.message);
      } else {
        console.log('📦 Conectado ao banco de dados SQLite');
        this.initTables();
      }
    });
  }

  initTables() {
    // Tabela de usuários admin
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `);

    // Tabela de programação
    this.db.run(`
      CREATE TABLE IF NOT EXISTS schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_of_week INTEGER NOT NULL, -- 0=domingo, 1=segunda, etc
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        show_name TEXT NOT NULL,
        host_name TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de "tocando agora"
    this.db.run(`
      CREATE TABLE IF NOT EXISTS now_playing (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        song_title TEXT NOT NULL,
        artist TEXT NOT NULL,
        album TEXT,
        artwork_url TEXT,
        duration INTEGER, -- em segundos
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_current BOOLEAN DEFAULT 1
      )
    `);

    // Tabela de estatísticas
    this.db.run(`
      CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        listeners_count INTEGER DEFAULT 0,
        peak_listeners INTEGER DEFAULT 0,
        total_sessions INTEGER DEFAULT 0,
        avg_listen_time INTEGER DEFAULT 0, -- em segundos
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de configurações
    this.db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de notificações
    this.db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        type TEXT DEFAULT 'info', -- info, warning, success, error
        sent_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inserir dados iniciais
    this.insertInitialData();
  }

  insertInitialData() {
    // Wait a bit for tables to be created
    setTimeout(() => {
      // Configurações padrão
      const defaultSettings = [
        ['radio_name', 'Rádio Tribo FM', 'Nome da rádio'],
        ['radio_slogan', 'Sua música, sua tribo!', 'Slogan da rádio'],
        ['stream_url', 'https://stream.example.com/radio', 'URL do stream'],
        ['phone', '(11) 9999-9999', 'Telefone de contato'],
        ['email', 'contato@radiotribofm.com', 'Email de contato'],
        ['facebook', 'https://facebook.com/radiotribofm', 'Facebook URL'],
        ['instagram', 'https://instagram.com/radiotribofm', 'Instagram URL'],
        ['whatsapp', '5511999999999', 'WhatsApp number'],
      ];

      defaultSettings.forEach(([key, value, description]) => {
        this.db.run(
          'INSERT OR IGNORE INTO settings (key, value, description) VALUES (?, ?, ?)',
          [key, value, description],
          (err) => {
            if (err) console.log('Error inserting setting:', err);
          }
        );
      });

      // Programação padrão
      const defaultSchedule = [
        [1, '06:00', '10:00', 'Manhã na Tribo', 'DJ Morning', 'Desperte com energia e boa música'],
        [1, '10:00', '14:00', 'Música Sem Fronteiras', 'DJ International', 'O melhor da música internacional'],
        [1, '14:00', '18:00', 'Tarde Brasileira', 'DJ Brasil', 'Sucessos nacionais de todos os tempos'],
        [1, '18:00', '22:00', 'Night Mix', 'DJ Night', 'Hits para curtir a noite'],
        [1, '22:00', '06:00', 'Madrugada Musical', 'Programação Musical', 'Música para todas as horas'],
      ];

      defaultSchedule.forEach(([day, start, end, show, host, desc]) => {
        this.db.run(
          'INSERT OR IGNORE INTO schedule (day_of_week, start_time, end_time, show_name, host_name, description) VALUES (?, ?, ?, ?, ?, ?)',
          [day, start, end, show, host, desc],
          (err) => {
            if (err) console.log('Error inserting schedule:', err);
          }
        );
      });

      // Usuário admin padrão (senha: admin123)
      const bcrypt = require('bcryptjs');
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      
      this.db.run(
        'INSERT OR IGNORE INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        ['admin', defaultPassword, 'admin@radiotribofm.com', 'admin'],
        (err) => {
          if (err) console.log('Error inserting user:', err);
          else console.log('✅ Dados iniciais inseridos - Usuário: admin, Senha: admin123');
        }
      );
    }, 1000);
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Erro ao fechar banco:', err.message);
      } else {
        console.log('📦 Conexão com banco fechada');
      }
    });
  }
}

module.exports = new Database();