# ⚡ Quick Start - Ludo Conto

Guia rápido para colocar o Ludo Conto funcionando em 5 minutos!

## 🚀 Deploy Rápido (Recomendado)

### 1. Clone e Instale
```bash
git clone https://github.com/TozatoRodrigo/LudoConto.git
cd LudoConto
npm install
```

### 2. Configure Firebase
- Crie projeto no [Firebase Console](https://console.firebase.google.com)
- Habilite **Authentication** (Email/Password)
- Crie **Firestore Database** (modo teste)
- Baixe credenciais Admin SDK

### 3. Configure Variáveis
```bash
cp .env.example .env
# Edite .env com suas chaves
```

### 4. Configure Frontend
```javascript
// Edite public/firebase-config.js
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  // ... outras configs
};
```

### 5. Deploy
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

## 🏠 Desenvolvimento Local

### 1. Configuração Mínima
```bash
git clone https://github.com/TozatoRodrigo/LudoConto.git
cd LudoConto
npm install
cp .env.example .env
```

### 2. Editar .env
```env
OPENAI_API_KEY=sk-proj-sua-chave-aqui
PORT=3000
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE\n-----END PRIVATE KEY-----\n"
```

### 3. Executar
```bash
npm start
# Acesse http://localhost:3000
```

## 🔑 Chaves Necessárias

### OpenAI API Key
1. Acesse [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crie uma nova API Key
3. Copie para o .env

### Firebase Credentials
1. [Firebase Console](https://console.firebase.google.com) → Seu Projeto
2. Configurações → Contas de serviço
3. Gerar nova chave privada
4. Baixar JSON e extrair dados para .env

## ✅ Checklist de Funcionamento

- [ ] Site carrega sem erros
- [ ] Consegue criar conta
- [ ] Consegue fazer login
- [ ] Consegue gerar história
- [ ] História é salva no Firestore

## 🆘 Problemas Comuns

### "API Key inválida"
- Verifique se a chave OpenAI está correta
- Verifique se há créditos na conta

### "Firebase error"
- Verifique se Authentication está habilitado
- Verifique se Firestore foi criado
- Verifique se as credenciais estão corretas

### "Port already in use"
```bash
# Mude a porta no .env
PORT=8080
```

## 📚 Documentação Completa

- **Deploy Completo**: [DEPLOY.md](DEPLOY.md)
- **Configuração Firebase**: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- **README Principal**: [README.md](README.md)

---

**🌟 Em 5 minutos você terá histórias mágicas funcionando! ✨**