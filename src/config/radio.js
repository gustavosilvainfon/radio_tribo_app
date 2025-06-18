// Configurações da Rádio Tribo FM
export const RADIO_CONFIG = {
  // URL da API - SUBSTITUA pela URL do seu backend hospedado
  API_URL: __DEV__ ? 'http://localhost:3001/api' : 'https://seu-backend.render.com/api',
  
  // URL do stream da rádio - será carregada da API
  STREAM_URL: 'https://stream.example.com/radio', // fallback
  
  // Informações da rádio - serão carregadas da API
  NAME: 'Rádio Tribo FM',
  SLOGAN: 'Sua música, sua tribo!',
  
  // Configurações do player
  PLAYER: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000, // 2 segundos
    BUFFER_SIZE: 1024 * 1024, // 1MB
  },
  
  // Cores do tema
  COLORS: {
    PRIMARY: '#ff6b6b',
    SECONDARY: '#4ecdc4',
    ACCENT: '#45b7d1',
    BACKGROUND: '#1a1a1a',
    SURFACE: '#2d2d2d',
    TEXT: '#ffffff',
    TEXT_SECONDARY: '#cccccc',
    TEXT_MUTED: '#888888',
  }
};

// Programação da rádio
export const SCHEDULE = [
  {
    time: '06:00 - 10:00',
    show: 'Manhã na Tribo',
    description: 'Desperte com energia e boa música',
    host: 'DJ Morning'
  },
  {
    time: '10:00 - 14:00',
    show: 'Música Sem Fronteiras',
    description: 'O melhor da música internacional',
    host: 'DJ International'
  },
  {
    time: '14:00 - 18:00',
    show: 'Tarde Brasileira',
    description: 'Sucessos nacionais de todos os tempos',
    host: 'DJ Brasil'
  },
  {
    time: '18:00 - 22:00',
    show: 'Night Mix',
    description: 'Hits para curtir a noite',
    host: 'DJ Night'
  },
  {
    time: '22:00 - 06:00',
    show: 'Madrugada Musical',
    description: 'Música para todas as horas',
    host: 'Programação Musical'
  }
];