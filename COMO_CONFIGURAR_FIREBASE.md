# 🔥 Como Configurar Firebase - Passo a Passo

## Passo 1: Habilitar Authentication
1. Acesse: https://console.firebase.google.com/project/ludoconto/authentication
2. Clique no botão **"Começar"**
3. Vá na aba **"Sign-in method"**
4. Clique em **"Email/senha"**
5. **Ative** a primeira opção (Email/senha)
6. Clique em **"Salvar"**

## Passo 2: Criar Firestore Database
1. Acesse: https://console.firebase.google.com/project/ludoconto/firestore
2. Clique em **"Criar banco de dados"**
3. Selecione **"Iniciar no modo de teste"**
4. Escolha a localização: **"southamerica-east1 (São Paulo)"**
5. Clique em **"Concluído"**

## Passo 3: Configurar Regras de Segurança
1. No Firestore, clique na aba **"Regras"**
2. **Substitua** todo o conteúdo por:
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

## Passo 4: Obter Credenciais Admin SDK
1. Acesse: https://console.firebase.google.com/project/ludoconto/settings/serviceaccounts/adminsdk
2. Clique no botão **"Gerar nova chave privada"**
3. Confirme clicando em **"Gerar chave"**
4. Um arquivo JSON será baixado automaticamente

## Passo 5: Configurar as Credenciais
1. **Abra** o arquivo JSON baixado
2. **Copie** as seguintes informações:
   - `project_id`
   - `client_email` 
   - `private_key`

3. **Edite** o arquivo `.env` e substitua:
```env
FIREBASE_PROJECT_ID=ludoconto
FIREBASE_CLIENT_EMAIL=valor_do_client_email_do_json
FIREBASE_PRIVATE_KEY="valor_completo_da_private_key_do_json"
```

**Importante:** A `FIREBASE_PRIVATE_KEY` deve incluir as aspas e quebras de linha `\n`

## Passo 6: Testar
```bash
npm run check
npm start
```

Acesse: http://localhost:3000

---

**Pronto!** Seu Ludo Conto estará funcionando completamente! 🎉