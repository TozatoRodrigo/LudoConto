const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

console.log('🚀 Iniciando Ludo Conto...');
console.log('📊 Variáveis de ambiente carregadas');

const app = express();
const PORT = process.env.PORT || 8080;

console.log(`🔧 Configurando servidor na porta ${PORT}`);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint para App Hosting
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Ludo Conto API',
    port: PORT,
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Ludo Conto API está funcionando!',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Configuração OpenAI
console.log('🔑 Verificando API Key da OpenAI...');
let openai = null;
if (process.env.OPENAI_API_KEY) {
  console.log('✅ API Key encontrada:', process.env.OPENAI_API_KEY.substring(0, 20) + '...');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.log('⚠️ OPENAI_API_KEY não encontrada - algumas funcionalidades podem não funcionar');
}

// Inicialização do Firebase (segura)
let db = null;
let auth = null;

try {
  console.log('🔥 Inicializando Firebase...');
  const firebaseConfig = require('./firebase-config');
  db = firebaseConfig.db;
  auth = firebaseConfig.auth;
  console.log('✅ Firebase inicializado com sucesso');
} catch (error) {
  console.log('⚠️ Firebase não inicializado:', error.message);
  console.log('📝 Algumas funcionalidades podem não funcionar');
}

// Middleware para verificar autenticação
async function verificarAuth(req, res, next) {
  try {
    if (!auth) {
      return res.status(500).json({ error: 'Firebase Auth não inicializado' });
    }

    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação necessário' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
}

// Rota para gerar história (protegida)
app.post('/api/gerar-historia', verificarAuth, async (req, res) => {
  try {
    if (!openai) {
      return res.status(500).json({ error: 'OpenAI não configurada' });
    }
    if (!db) {
      return res.status(500).json({ error: 'Firebase não configurado' });
    }

    const { nome, idade, preferencias, valor, desafio } = req.body;
    const userId = req.user.uid;

    // Validação básica
    if (!nome || !idade || !preferencias || !valor) {
      return res.status(400).json({ 
        error: 'Todos os campos obrigatórios devem ser preenchidos' 
      });
    }

    const prompt = `Você é um contador de histórias infantis encantador, inspirado por autores como Antoine de Saint-Exupéry, J.K. Rowling, Roald Dahl e os Irmãos Grimm.

Crie uma história cativante com base nas seguintes informações:
Nome da criança: ${nome}
Idade: ${idade}
Preferências: ${preferencias}
Valor a ser ensinado: ${valor}
${desafio ? `Desafio atual: ${desafio}` : ''}

Regras:
- A história deve ser 100% segura para crianças, sem qualquer conteúdo inapropriado, político, ideológico, sexual, violento ou sensível.
- A linguagem deve ser adaptada à idade da criança.
- A história deve ter início, meio e fim, com uma lição de moral positiva no final.
- O estilo deve lembrar obras como "O Pequeno Príncipe" e "A Fantástica Fábrica de Chocolate".
- A história deve ser mágica, leve, divertida e encantadora.
- Escreva em até 600 palavras.
- Comece com um título lúdico e conte a história no estilo de um autor infantil cuidadoso e empático.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em criar histórias infantis educativas e encantadoras."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.8
    });

    const historia = completion.choices[0].message.content;

    // Salvar história no Firestore
    const historiaData = {
      userId,
      nome,
      idade,
      preferencias,
      valor,
      desafio: desafio || '',
      historia,
      criadaEm: new Date(),
      userEmail: req.user.email
    };

    const docRef = await db.collection('historias').add(historiaData);

    res.json({ 
      historia,
      historiaId: docRef.id
    });

  } catch (error) {
    console.error('❌ Erro detalhado ao gerar história:');
    console.error('Tipo do erro:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor. Tente novamente.',
      details: error.message
    });
  }
});

// Rota para buscar histórias do usuário
app.get('/api/minhas-historias', verificarAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    console.log(`🔍 Buscando histórias para usuário: ${userId}`);
    
    // Consulta mais simples sem offset para evitar problemas de índice
    const snapshot = await db.collection('historias')
      .where('userId', '==', userId)
      .orderBy('criadaEm', 'desc')
      .limit(50) // Aumentar limite para pegar mais histórias
      .get();

    console.log(`📊 Encontradas ${snapshot.size} histórias`);

    const historias = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`📖 História encontrada: ${doc.id} - ${data.nome}`);
      
      historias.push({
        id: doc.id,
        nome: data.nome,
        idade: data.idade,
        preferencias: data.preferencias,
        valor: data.valor,
        criadaEm: data.criadaEm.toDate(),
        preview: data.historia ? data.historia.substring(0, 200) + '...' : 'Sem conteúdo'
      });
    });

    console.log(`✅ Retornando ${historias.length} histórias`);
    res.json({ historias });

  } catch (error) {
    console.error('❌ Erro detalhado ao buscar histórias:');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Erro ao buscar histórias',
      details: error.message 
    });
  }
});

// Rota para buscar uma história específica
app.get('/api/historia/:id', verificarAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const historiaId = req.params.id;

    const doc = await db.collection('historias').doc(historiaId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'História não encontrada' });
    }

    const data = doc.data();

    // Verificar se a história pertence ao usuário
    if (data.userId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    res.json({
      id: doc.id,
      ...data,
      criadaEm: data.criadaEm.toDate()
    });

  } catch (error) {
    console.error('Erro ao buscar história:', error);
    res.status(500).json({ error: 'Erro ao buscar história' });
  }
});

// Rota para deletar história
app.delete('/api/historia/:id', verificarAuth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const historiaId = req.params.id;

    const doc = await db.collection('historias').doc(historiaId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'História não encontrada' });
    }

    const data = doc.data();

    // Verificar se a história pertence ao usuário
    if (data.userId !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await db.collection('historias').doc(historiaId).delete();

    res.json({ message: 'História deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar história:', error);
    res.status(500).json({ error: 'Erro ao deletar história' });
  }
});

console.log('🚀 Iniciando servidor...');

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 API: http://localhost:${PORT}/api/`);
  console.log('🎉 Ludo Conto está online!');
});

server.on('error', (error) => {
  console.error('❌ Erro no servidor:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} já está em uso`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Recebido SIGTERM, fechando servidor graciosamente...');
  server.close(() => {
    console.log('✅ Servidor fechado com sucesso');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Recebido SIGINT, fechando servidor...');
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});