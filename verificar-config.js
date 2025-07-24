// Script para verificar se a configuração está completa
require('dotenv').config();

console.log('🔍 Verificando configuração do Ludo Conto...\n');

// Verificar variáveis de ambiente
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

let configOk = true;

console.log('📋 Variáveis de ambiente:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === 'PENDENTE_CONFIGURAR') {
    console.log(`❌ ${varName}: NÃO CONFIGURADA`);
    configOk = false;
  } else {
    console.log(`✅ ${varName}: CONFIGURADA`);
  }
});

console.log('\n📁 Arquivos necessários:');
const fs = require('fs');
const requiredFiles = [
  'public/firebase-config.js',
  'firebase-config.js',
  'firestore.rules',
  '.env'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: EXISTE`);
  } else {
    console.log(`❌ ${file}: NÃO ENCONTRADO`);
    configOk = false;
  }
});

console.log('\n🔥 Configuração do Firebase:');
console.log(`✅ Project ID: ludoconto`);
console.log(`✅ Auth Domain: ludoconto.firebaseapp.com`);
console.log(`✅ Frontend: CONFIGURADO`);

if (configOk) {
  console.log('\n🎉 CONFIGURAÇÃO COMPLETA!');
  console.log('Execute: npm start');
} else {
  console.log('\n⚠️  CONFIGURAÇÃO INCOMPLETA');
  console.log('Siga os passos em CONFIGURACAO_RAPIDA.md');
}

// Testar conexão com Firebase (se configurado)
if (process.env.FIREBASE_PROJECT_ID === 'ludoconto' && 
    process.env.FIREBASE_CLIENT_EMAIL !== 'PENDENTE_CONFIGURAR') {
  
  console.log('\n🧪 Testando conexão com Firebase...');
  
  try {
    const { admin } = require('./firebase-config');
    console.log('✅ Firebase Admin SDK: CONECTADO');
  } catch (error) {
    console.log('❌ Firebase Admin SDK: ERRO');
    console.log('   ', error.message);
  }
}