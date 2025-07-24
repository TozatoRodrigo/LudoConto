// Script para configurar Firebase Admin SDK
// Execute este script após baixar o arquivo JSON das credenciais

const fs = require('fs');
const path = require('path');

console.log('🔥 Configuração do Firebase Admin SDK');
console.log('=====================================');
console.log('');
console.log('Para completar a configuração, você precisa:');
console.log('');
console.log('1. Ir para o Firebase Console: https://console.firebase.google.com/project/ludoconto');
console.log('2. Clicar em "Configurações do projeto" (ícone de engrenagem)');
console.log('3. Ir na aba "Contas de serviço"');
console.log('4. Clicar em "Gerar nova chave privada"');
console.log('5. Baixar o arquivo JSON');
console.log('6. Executar: node configure-firebase.js caminho/para/arquivo.json');
console.log('');
console.log('Ou você pode configurar manualmente no arquivo .env:');
console.log('');
console.log('FIREBASE_PROJECT_ID=ludoconto');
console.log('FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@ludoconto.iam.gserviceaccount.com');
console.log('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nSUA_CHAVE_PRIVADA_AQUI\\n-----END PRIVATE KEY-----\\n"');
console.log('');

// Se um arquivo JSON foi fornecido como argumento
if (process.argv[2]) {
  try {
    const serviceAccountPath = process.argv[2];
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    // Ler o arquivo .env atual
    let envContent = '';
    if (fs.existsSync('.env')) {
      envContent = fs.readFileSync('.env', 'utf8');
    }
    
    // Atualizar ou adicionar as variáveis do Firebase
    const firebaseVars = {
      FIREBASE_PROJECT_ID: serviceAccount.project_id,
      FIREBASE_CLIENT_EMAIL: serviceAccount.client_email,
      FIREBASE_PRIVATE_KEY: `"${serviceAccount.private_key}"`
    };
    
    Object.entries(firebaseVars).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    });
    
    // Salvar o arquivo .env
    fs.writeFileSync('.env', envContent);
    
    console.log('✅ Configuração do Firebase Admin SDK concluída!');
    console.log('✅ Arquivo .env atualizado com sucesso!');
    console.log('');
    console.log('Agora você pode executar: npm start');
    
  } catch (error) {
    console.error('❌ Erro ao configurar Firebase:', error.message);
    console.log('');
    console.log('Certifique-se de que o caminho do arquivo JSON está correto.');
  }
}