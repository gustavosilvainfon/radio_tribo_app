# 📻 Rádio Tribo FM - App & Backend

Aplicativo completo para rádio online com painel administrativo.

## 🚀 Estrutura do Projeto

```
radio_tribo_app/
├── backend/              # API Node.js + Painel Admin
│   ├── src/
│   │   ├── routes/      # Rotas da API
│   │   ├── models/      # Banco de dados
│   │   └── server.js    # Servidor principal
│   └── public/admin/    # Painel administrativo web
├── src/                 # App React Native
│   ├── screens/         # Telas do app
│   ├── services/        # Integração com API
│   └── config/          # Configurações
└── App.js              # App principal
```

## 🛠️ Instalação

### Backend
```bash
cd backend
npm install
npm start
```

### App Mobile
```bash
npm install
npm start
```

## 📱 Funcionalidades

### App Mobile
- ▶️ Player de rádio ao vivo
- 📋 Programação da rádio
- ℹ️ Informações e contato
- 📊 Interface moderna e responsiva

### Painel Admin
- 🎵 Atualizar "Tocando Agora"
- 📅 Gerenciar programação
- ⚙️ Configurações da rádio
- 📈 Estatísticas de ouvintes

## 🔗 URLs

- **API**: `/api`
- **Painel Admin**: `/admin`
- **Login padrão**: admin / admin123

## 🏗️ Deploy

### Backend (Render.com)
1. Conectar repositório GitHub
2. Configurar como Web Service
3. Build Command: `cd backend && npm install`
4. Start Command: `cd backend && npm start`

### App Mobile
```bash
# Android APK
npx expo build:android --type apk

# iOS
eas build --platform ios
```

---
🤖 Generated with [Memex](https://memex.tech)
Co-Authored-By: Memex <noreply@memex.tech>