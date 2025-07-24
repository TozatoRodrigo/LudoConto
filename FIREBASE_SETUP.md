# 🔥 Configuração do Firebase

## Passo 1: Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar um projeto"
3. Escolha um nome para seu projeto (ex: `ludo-conto`)
4. Siga os passos de configuração

## Passo 2: Configurar Authentication

1. No painel do Firebase, vá em **Authentication**
2. Clique em **Começar**
3. Na aba **Sign-in method**, habilite:
   - **Email/Password** (ativar)

## Passo 3: Configurar Firestore Database

1. No painel do Firebase, vá em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha **Iniciar no modo de teste** (por enquanto)
4. Selecione uma localização (ex: `southamerica-east1`)

## Passo 4: Configurar Firebase Admin SDK

1. No painel do Firebase, vá em **Configurações do projeto** (ícone de engrenagem)
2. Vá na aba **Contas de serviço**
3. Clique em **Gerar nova chave privada**
4. Baixe o arquivo JSON

## Passo 5: Configurar Variáveis de Ambiente

1. Abra o arquivo JSON baixado
2. Copie as informações para o arquivo `.env`:

```env
OPENAI_API_KEY=sua_chave_da_openai_aqui
PORT=3000

# Firebase Admin SDK
FIREBASE_PROJECT_ID=valor_do_project_id
FIREBASE_CLIENT_EMAIL=valor_do_client_email
FIREBASE_PRIVATE_KEY="valor_da_private_key_completa"
```

**Importante:** A `FIREBASE_PRIVATE_KEY` deve incluir as quebras de linha `\n`

## Passo 6: Configurar Firebase Web App

1. No painel do Firebase, vá em **Configurações do projeto**
2. Na seção **Seus apps**, clique no ícone **Web** (`</>`)
3. Registre o app com um nome (ex: `ludo-conto-web`)
4. Copie a configuração gerada

## Passo 7: Atualizar Configuração Frontend

Edite o arquivo `public/firebase-config.js` com suas configurações:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "sua-app-id"
};
```

## Passo 8: Configurar Regras de Segurança do Firestore

No Firestore Database, vá em **Regras** e substitua por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regra para coleção de histórias
    match /historias/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Passo 9: Testar a Configuração

1. Execute o projeto:
   ```bash
   npm install
   npm start
   ```

2. Acesse `http://localhost:3000`
3. Teste o cadastro e login
4. Gere uma história e verifique se foi salva

## Estrutura do Banco de Dados

### Coleção: `historias`
```javascript
{
  userId: "uid_do_usuario",
  userEmail: "email@usuario.com",
  nome: "Nome da Criança",
  idade: 6,
  preferencias: "dragões, aventuras",
  valor: "coragem",
  desafio: "medo do escuro",
  historia: "Era uma vez...",
  criadaEm: Timestamp
}
```

## Deploy no Firebase Hosting (Opcional)

1. Instale o Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Faça login:
   ```bash
   firebase login
   ```

3. Inicialize o projeto:
   ```bash
   firebase init hosting
   ```

4. Configure para usar a pasta `public`

5. Faça o deploy:
   ```bash
   firebase deploy
   ```

## Troubleshooting

### Erro de CORS
Se houver erro de CORS, verifique se o domínio está autorizado no Firebase Authentication.

### Erro de Permissão
Verifique se as regras do Firestore estão corretas e se o usuário está autenticado.

### Erro de Token
Certifique-se de que o token está sendo enviado corretamente no header Authorization.

---

**Pronto!** Seu Ludo Conto agora está integrado com Firebase! 🎉