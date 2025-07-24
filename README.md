# 🌟 Ludo Conto

> **Histórias Mágicas Personalizadas com IA**

Um site que gera histórias infantis personalizadas usando inteligência artificial, criado para ajudar pais a educar seus filhos através de contos mágicos e envolventes.

[![Deploy Status](https://img.shields.io/badge/deploy-firebase-orange)](https://ludoconto.web.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Demo

**🔗 [Acesse o Ludo Conto](https://ludoconto.web.app)**

## ✨ Funcionalidades

### 🎯 **Principais Recursos**
- 🔐 **Sistema de Login** - Autenticação segura com Firebase Auth
- 💾 **Histórias Salvas** - Banco de dados no Firestore
- 📚 **Minhas Histórias** - Visualizar e gerenciar histórias anteriores
- 🤖 **IA Segura** - Geração com OpenAI GPT-3.5-turbo
- 📱 **Responsivo** - Funciona em desktop e mobile
- 🎨 **Interface Moderna** - Design inspirado no StorySpark.ai

### 🛡️ **Segurança e Qualidade**
- ✅ Conteúdo 100% seguro para crianças
- ✅ Linguagem adaptada à idade (3-12 anos)
- ✅ Valores educativos positivos
- ✅ Autenticação JWT protegida
- ✅ Regras de segurança no Firestore

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Serviços      │
│   (Vanilla JS)  │◄──►│   (Express.js)  │◄──►│   Firebase      │
│                 │    │                 │    │   OpenAI        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Deploy Rápido

### **Opção 1: Firebase Hosting (Recomendado)**

```bash
# 1. Clone o repositório
git clone https://github.com/TozatoRodrigo/LudoConto.git
cd LudoConto

# 2. Instale dependências
npm install

# 3. Configure Firebase (veja DEPLOY.md)
# 4. Faça o deploy
npm run deploy
```

### **Opção 2: Desenvolvimento Local**

```bash
# 1. Clone e instale
git clone https://github.com/TozatoRodrigo/LudoConto.git
cd LudoConto
npm install

# 2. Configure .env (veja .env.example)
cp .env.example .env
# Edite .env com suas chaves

# 3. Execute
npm start
```

## 📋 Pré-requisitos

- **Node.js** 14+ 
- **Conta Firebase** (gratuita)
- **API Key OpenAI** ([obter aqui](https://platform.openai.com/api-keys))

## 📁 Estrutura do Projeto

```
ludo-conto/
├── 📁 public/              # Frontend (HTML, CSS, JS)
│   ├── index.html          # Página principal
│   ├── styles.css          # Estilos responsivos
│   ├── script.js           # Lógica principal
│   ├── auth.js             # Autenticação Firebase
│   └── firebase-config.js  # Config Firebase frontend
├── 📄 server.js            # Backend Express + OpenAI
├── 📄 firebase-config.js   # Config Firebase backend
├── 📄 package.json         # Dependências
├── 📄 firebase.json        # Config deploy Firebase
├── 📄 firestore.rules      # Regras de segurança
├── 📄 DEPLOY.md           # Guia de deploy completo
└── 📄 .env.example        # Exemplo de variáveis
```

## 🔧 Configuração

### **1. Firebase Setup**
```bash
# Habilite Authentication (Email/Password)
# Crie Firestore Database
# Baixe credenciais Admin SDK
```

### **2. Variáveis de Ambiente**
```env
# .env
OPENAI_API_KEY=sk-proj-sua-chave-aqui
PORT=3000
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE\n-----END PRIVATE KEY-----\n"
```

### **3. Firebase Web Config**
```javascript
// public/firebase-config.js
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  // ... outras configs
};
```

## 🛠️ Scripts Disponíveis

```bash
npm start          # Inicia servidor de produção
npm run dev        # Desenvolvimento com auto-reload
npm run deploy     # Deploy no Firebase Hosting
npm run check      # Verifica configuração
```

## 🎨 Tecnologias

| Categoria | Tecnologia |
|-----------|------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Authentication |
| **IA** | OpenAI GPT-3.5-turbo |
| **Deploy** | Firebase Hosting |
| **Estilo** | Google Fonts (Poppins) |

## 📊 Status do Projeto

- ✅ **MVP Completo** - Todas funcionalidades básicas
- ✅ **Sistema de Login** - Firebase Auth integrado
- ✅ **Banco de Dados** - Firestore configurado
- ✅ **Deploy Ready** - Pronto para produção
- 🔄 **Minhas Histórias** - Em desenvolvimento
- 📋 **Futuras Features** - Ver roadmap abaixo

## 🗺️ Roadmap

### **v2.1 (Próxima)**
- 🔧 Correção "Minhas Histórias"
- 📱 PWA (Progressive Web App)
- 🎨 Temas personalizáveis

### **v3.0 (Futuro)**
- 🖼️ Geração de ilustrações
- 🔊 Histórias em áudio
- 📤 Compartilhamento social
- 🌍 Múltiplos idiomas

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📞 Suporte

- 📧 **Email**: [seu-email@exemplo.com]
- 🐛 **Issues**: [GitHub Issues](https://github.com/TozatoRodrigo/LudoConto/issues)
- 📖 **Docs**: [DEPLOY.md](DEPLOY.md)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">

**🌟 Ludo Conto - Criando histórias mágicas para educar com amor ✨**

[![GitHub](https://img.shields.io/badge/GitHub-TozatoRodrigo-black?logo=github)](https://github.com/TozatoRodrigo)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange?logo=firebase)](https://firebase.google.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-green?logo=openai)](https://openai.com)

</div>