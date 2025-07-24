# ⚡ Configuração Rápida do Firebase

## ✅ Frontend já configurado!
O arquivo `public/firebase-config.js` já está configurado com seus dados do Firebase.

## 🔧 Próximos passos para completar a configuração:

### 1. Habilitar Authentication
1. Acesse: https://console.firebase.google.com/project/ludoconto/authentication
2. Clique em **"Começar"**
3. Na aba **"Sign-in method"**, habilite **"Email/senha"**

### 2. Criar Firestore Database
1. Acesse: https://console.firebase.google.com/project/ludoconto/firestore
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de teste"**
4. Selecione a localização: **"southamerica-east1"**

### 3. Configurar Regras de Segurança
1. No Firestore, vá em **"Regras"**
2. Substitua o conteúdo pelas regras do arquivo `firestore.rules`
3. Clique em **"Publicar"**

### 4. Baixar Credenciais Admin SDK
1. Acesse: https://console.firebase.google.com/project/ludoconto/settings/serviceaccounts/adminsdk
2. Clique em **"Gerar nova chave privada"**
3. Baixe o arquivo JSON
4. Execute no terminal:
   ```bash
   node firebase-admin-setup.js caminho/para/arquivo-baixado.json
   ```

### 5. Testar a aplicação
```bash
npm install
npm start
```

Acesse: http://localhost:3000

## 🎯 Configuração Manual (alternativa)

Se preferir configurar manualmente, edite o arquivo `.env`:

```env
FIREBASE_PROJECT_ID=ludoconto
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ludoconto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_COMPLETA_AQUI\n-----END PRIVATE KEY-----\n"
```

## 🚀 Deploy (opcional)

Para fazer deploy no Firebase Hosting:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

**Pronto!** Seu Ludo Conto estará funcionando com Firebase! 🎉