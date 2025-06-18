const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Muitas requisições, tente novamente em 15 minutos.'
});

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar para o painel admin funcionar
}));
app.use(cors());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (painel admin)
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas da API
app.use('/api/radio', require('./routes/radio'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stats', require('./routes/stats'));

// Rota principal da API
app.get('/api', (req, res) => {
  res.json({
    message: 'API Rádio Tribo FM',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      radio: '/api/radio',
      admin: '/api/admin',
      stats: '/api/stats'
    }
  });
});

// Rota para o painel admin
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Inicializar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Painel Admin: http://localhost:${PORT}/admin`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

module.exports = app;