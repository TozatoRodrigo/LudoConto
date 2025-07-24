# 🚀 Guia de Deploy - Ludo Conto

Este guia te ajudará a colocar o Ludo Conto em produção usando Firebase Hosting.

## 📋 Pré-requisitos

- ✅ Conta no [Firebase](https://firebase.google.com) (gratuita)
- ✅ Conta na [OpenAI](https://platform.openai.com) com API Key
- ✅ [Node.js](https://nodejs.org) 14+ instalado
- ✅ [Git](https://git-scm.com) instalado

## 🔥 Passo 1: Configurar Firebase

### 1.1 Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em **"Criar um projeto"**
3. Nome do projeto: `ludoconto` (ou outro nome)
4. Siga os passos de configuração

### 1.2 Habilitar Authentication

1. No painel Firebase, vá em **Authentication**
2. Clique em **"Começar"**
3. Na aba **"Sign-in method"**:
   - Habilite **"Email/senha"**
   - Clique em **"Salvar"**

### 1.3 Criar Firestore Database

1. No painel Firebase, vá em **Firestore Database**
2. Clique em **"Criar banco de dados"**
3. Selecione **"Iniciar no modo de teste"**
4. Escolha localização: **"southamerica-east1 (São Paulo)"**
5. Clique em **"Concluído"**

### 1.4 Configurar Regras de Segurança

1. No Firestore, vá na aba **"Regras"**
2. Substitua o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /historias/{document} {
      allow read, write: if request.auth != null && 
                         request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                    request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Clique em **"Publicar"**

### 1.5 Obter Credenciais Admin SDK

1. Vá em **Configurações do projeto** (ícone engrenagem)
2. Aba **"Contas de serviço"**
3. Clique em **"Gerar nova chave privada"**
4. Baixe o arquivo JSON (guarde com segurança!)

### 1.6 Configurar Web App

1. Em **Configurações do projeto**
2. Seção **"Seus apps"** → ícone **Web** (`</>`)
3. Nome do app: `ludo-conto-web`
4. **NÃO** marque Firebase Hosting ainda
5. Copie a configuração gerada

## 🔧 Passo 2: Configurar Projeto Local

### 2.1 Clonar Repositório

```bash
git clone https://github.com/TozatoRodrigo/LudoConto.git
cd LudoConto
npm install
```

### 2.2 Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` com suas credenciais:

```env
# OpenAI API Key
OPENAI_API_KEY=sk-proj-sua-chave-da-openai-aqui

# Porta do servidor (para desenvolvimento)
PORT=3000

# Firebase Admin SDK (do arquivo JSON baixado)
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_COMPLETA_AQUI\n-----END PRIVATE KEY-----\n"
```

### 2.3 Configurar Firebase Frontend

Edite o arquivo `public/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "sua-app-id-aqui"
};
```

### 2.4 Testar Localmente

```bash
npm start
```

Acesse `http://localhost:3000` e teste:
- ✅ Cadastro de usuário
- ✅ Login
- ✅ Geração de história
- ✅ Salvamento no Firestore

## 🌐 Passo 3: Deploy no Firebase Hosting

### 3.1 Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 3.2 Fazer Login

```bash
firebase login
```

### 3.3 Inicializar Projeto

```bash
firebase init
```

Selecione:
- ✅ **Hosting**: Configure files for Firebase Hosting
- ✅ **Firestore**: Configure security rules and indexes files

Configurações:
- **Project**: Selecione seu projeto Firebase
- **Public directory**: `public`
- **Single-page app**: `Yes`
- **Overwrite index.html**: `No`
- **Firestore rules**: Use o arquivo existente
- **Firestore indexes**: Use o arquivo existente

### 3.4 Configurar para SPA

O arquivo `firebase.json` já está configurado corretamente:

```json
{
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### 3.5 Deploy

```bash
firebase deploy
```

Após o deploy, você receberá uma URL como:
`https://seu-projeto.web.app`

## ⚙️ Passo 4: Configurar Backend (Opcional)

Para o backend funcionar em produção, você tem algumas opções:

### Opção A: Firebase Functions (Recomendado)

```bash
firebase init functions
# Migre o código do server.js para functions
firebase deploy --only functions
```

### Opção B: Heroku, Vercel, Railway

Configure as variáveis de ambiente na plataforma escolhida.

### Opção C: Servidor Próprio

Configure um servidor VPS com PM2:

```bash
npm install -g pm2
pm2 start server.js --name "ludo-conto"
pm2 startup
pm2 save
```

## 🔒 Passo 5: Configurações de Produção

### 5.1 Domínio Personalizado (Opcional)

1. No Firebase Console → Hosting
2. Clique em **"Adicionar domínio personalizado"**
3. Siga as instruções para configurar DNS

### 5.2 SSL/HTTPS

O Firebase Hosting já inclui SSL automático.

### 5.3 Monitoramento

1. Configure Google Analytics (opcional)
2. Configure Firebase Performance Monitoring
3. Configure alertas de erro

## 🧪 Passo 6: Testes de Produção

### 6.1 Checklist de Testes

- ✅ Site carrega corretamente
- ✅ Cadastro de usuário funciona
- ✅ Login funciona
- ✅ Geração de história funciona
- ✅ Histórias são salvas no Firestore
- ✅ Responsividade mobile
- ✅ Performance (PageSpeed Insights)

### 6.2 Ferramentas de Teste

```bash
# Lighthouse (performance)
npm install -g lighthouse
lighthouse https://seu-site.web.app

# Teste de responsividade
# Use DevTools do Chrome
```

## 🚨 Troubleshooting

### Erro: "Firebase project not found"
```bash
firebase use --add
# Selecione seu projeto
```

### Erro: "Permission denied"
```bash
firebase login --reauth
```

### Erro: "API Key inválida"
- Verifique se a API Key da OpenAI está correta
- Verifique se há créditos na conta OpenAI

### Erro: "Firestore permission denied"
- Verifique se as regras do Firestore estão corretas
- Verifique se o usuário está autenticado

## 📊 Monitoramento

### Firebase Console
- **Authentication**: Usuários registrados
- **Firestore**: Dados salvos
- **Hosting**: Tráfego e performance
- **Functions**: Logs e erros (se usar)

### Google Analytics
Configure para acompanhar:
- Usuários ativos
- Histórias geradas
- Taxa de conversão

## 🔄 Atualizações

Para atualizar o site:

```bash
# 1. Faça as alterações no código
# 2. Teste localmente
npm start

# 3. Deploy
firebase deploy
```

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs**: `firebase functions:log`
2. **Console do navegador**: F12 → Console
3. **Firebase Console**: Verifique erros nas seções
4. **Issues GitHub**: [Reporte bugs](https://github.com/TozatoRodrigo/LudoConto/issues)

---

## 🎉 Parabéns!

Seu Ludo Conto está agora em produção! 🚀

**Próximos passos:**
- Compartilhe com amigos e família
- Colete feedback dos usuários
- Monitore performance e erros
- Implemente novas funcionalidades

---

**🌟 Ludo Conto - Histórias mágicas em produção! ✨**