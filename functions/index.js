const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const {onCall} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

// Inicializar Firebase Admin
admin.initializeApp();

setGlobalOptions({maxInstances: 10});

// Função para gerar história
exports.gerarHistoria = onCall(async (request) => {
  try {
    logger.info("🚀 Iniciando geração de história", {
      userId: request.auth ? request.auth.uid : null,
      data: request.data,
    });

    // Verificar autenticação
    if (!request.auth) {
      logger.error("❌ Usuário não autenticado");
      throw new Error("Usuário não autenticado");
    }

    const {nome, idade, preferencias, valor, desafio} = request.data;
    const userId = request.auth.uid;

    // Validação básica
    if (!nome || !idade || !preferencias || !valor) {
      throw new Error("Todos os campos obrigatórios devem ser preenchidos");
    }

    // Configurar OpenAI
    const OpenAI = require("openai");
    const apiKey = "sk-proj-vkvwEwjjLc093TlpbxTxED1utMkGM3FNAOXHedogpp-" +
      "mqdxFMRYeSqBv7HjhRx03VJ_5aTp3gkT3BlbkFJmSmo9p8R7V59gw82IWaWUXy19AZjmT_" +
      "-FFqL799YyNfRiC8w86YexflBPGOU0krUhMJ6t9dIMA";

    const openai = new OpenAI({apiKey});

    logger.info("🤖 Configurando OpenAI e gerando prompt...");

    const promptText = `Você é um contador de histórias infantis encantador, 
inspirado por autores como Antoine de Saint-Exupéry, J.K. Rowling, 
Roald Dahl e os Irmãos Grimm.

Crie uma história cativante com base nas seguintes informações:
Nome da criança: ${nome}
Idade: ${idade}
Preferências: ${preferencias}
Valor a ser ensinado: ${valor}
${desafio ? `Desafio atual: ${desafio}` : ""}

Regras:
- A história deve ser 100% segura para crianças, sem qualquer conteúdo 
inapropriado, político, ideológico, sexual, violento ou sensível.
- A linguagem deve ser adaptada à idade da criança.
- A história deve ter início, meio e fim, com uma lição de moral positiva.
- O estilo deve lembrar "O Pequeno Príncipe" e "A Fantástica Fábrica de 
Chocolate".
- A história deve ser mágica, leve, divertida e encantadora.
- Escreva em até 600 palavras.
- Comece com um título lúdico e conte a história no estilo de um autor 
infantil cuidadoso e empático.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em criar histórias infantis " +
            "educativas e encantadoras.",
        },
        {
          role: "user",
          content: promptText,
        },
      ],
      max_tokens: 800,
      temperature: 0.8,
    });

    const historia = completion.choices[0].message.content;

    logger.info("✅ História gerada com sucesso", {
      historiaLength: historia.length,
      preview: historia.substring(0, 100),
    });

    // Gerar prompt para a imagem baseado na história
    logger.info("🎨 Gerando imagem ilustrativa...");

    const imagePrompt = `Create a whimsical children's book illustration ` +
      `in the style of Nicole Rubel, William Steig, and Sven Nordqvist. ` +
      `The illustration should depict: a ${idade}-year-old child named ` +
      `${nome} in a magical story about ${preferencias}. ` +
      `The scene should teach about ${valor}. ` +
      `Style: colorful, warm, hand-drawn feel, soft watercolor-like ` +
      `textures, expressive characters, cozy and inviting atmosphere. ` +
      `The illustration should be suitable for children aged ${idade}, ` +
      `with bright colors, friendly characters, and a storybook quality. ` +
      `No text or words in the image.`;

    let imagemUrl = null;
    try {
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural",
      });

      imagemUrl = imageResponse.data[0].url;
      logger.info("✅ Imagem gerada com sucesso", {imagemUrl});

      // Fazer download da imagem e salvar no Firebase Storage
      const fetch = require("node-fetch");
      const imageBuffer = await fetch(imagemUrl).then((res) => res.buffer());

      const bucket = admin.storage().bucket();
      const fileName = `historias/${userId}/${Date.now()}_` +
        `${nome.replace(/\s+/g, "_")}.png`;
      const file = bucket.file(fileName);

      await file.save(imageBuffer, {
        metadata: {
          contentType: "image/png",
          metadata: {
            historiaId: "temp", // Será atualizado depois
            userId: userId,
            nome: nome,
          },
        },
      });

      // Tornar a imagem pública
      await file.makePublic();

      // URL pública da imagem
      imagemUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      logger.info("✅ Imagem salva no Storage", {imagemUrl});
    } catch (imageError) {
      logger.error("⚠️ Erro ao gerar imagem:", imageError);
      // Continuar sem imagem se houver erro
    }

    // Salvar história no Firestore
    const historiaData = {
      userId,
      nome,
      idade,
      preferencias,
      valor,
      desafio: desafio || "",
      historia,
      imagemUrl: imagemUrl || null,
      criadaEm: admin.firestore.FieldValue.serverTimestamp(),
      userEmail: request.auth.token.email,
    };

    const docRef = await admin.firestore()
        .collection("historias").add(historiaData);

    // Atualizar metadata da imagem com o ID da história
    if (imagemUrl) {
      try {
        const bucket = admin.storage().bucket();
        const fileName = imagemUrl.split("/").pop();
        const file = bucket.file(`historias/${userId}/${fileName}`);
        await file.setMetadata({
          metadata: {
            historiaId: docRef.id,
            userId: userId,
            nome: nome,
          },
        });
      } catch (metaError) {
        logger.warn("⚠️ Erro ao atualizar metadata da imagem:", metaError);
      }
    }

    return {
      historia,
      imagemUrl,
      historiaId: docRef.id,
    };
  } catch (error) {
    logger.error("Erro ao gerar história:", error);
    throw new Error("Erro interno do servidor. Tente novamente.");
  }
});

// Função para buscar histórias do usuário
exports.minhasHistorias = onCall(async (request) => {
  try {
    logger.info("🔍 Iniciando busca de histórias", {
      userId: request.auth ? request.auth.uid : null,
    });

    if (!request.auth) {
      logger.error("❌ Usuário não autenticado");
      throw new Error("Usuário não autenticado");
    }

    const userId = request.auth.uid;

    logger.info("📚 Buscando histórias no Firestore", {userId});

    // Buscar histórias sem orderBy para evitar problemas de índice
    const snapshot = await admin.firestore()
        .collection("historias")
        .where("userId", "==", userId)
        .limit(50)
        .get();

    const historias = [];
    snapshot.forEach((doc) => {
      try {
        const data = doc.data();
        historias.push({
          id: doc.id,
          nome: data.nome || "Nome não informado",
          idade: data.idade || 0,
          preferencias: data.preferencias || "Não informado",
          valor: data.valor || "Não informado",
          criadaEm: data.criadaEm ? data.criadaEm.toDate() : new Date(),
          preview: data.historia ?
            data.historia.substring(0, 200) + "..." : "Sem conteúdo",
          imagemUrl: data.imagemUrl || null,
        });
      } catch (docError) {
        logger.error("Erro ao processar documento", {
          docId: doc.id,
          error: docError.message,
        });
      }
    });

    // Ordenar manualmente se não conseguiu ordenar no Firestore
    historias.sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm));

    logger.info("✅ Histórias encontradas", {
      count: historias.length,
      userId,
    });

    return {historias};
  } catch (error) {
    logger.error("❌ Erro ao buscar histórias:", {
      error: error.message,
      stack: error.stack,
      userId: request.auth ? request.auth.uid : null,
    });
    throw new Error("Erro ao buscar histórias: " + error.message);
  }
});

// Função para obter uma história específica
exports.obterHistoria = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new Error("Usuário não autenticado");
    }

    const {historiaId} = request.data;
    const userId = request.auth.uid;

    if (!historiaId) {
      throw new Error("ID da história é obrigatório");
    }

    const doc = await admin.firestore()
        .collection("historias")
        .doc(historiaId)
        .get();

    if (!doc.exists) {
      throw new Error("História não encontrada");
    }

    const data = doc.data();

    // Verificar se a história pertence ao usuário
    if (data.userId !== userId) {
      throw new Error("Acesso negado");
    }

    return {
      historia: data.historia,
      imagemUrl: data.imagemUrl || null,
      id: doc.id,
      nome: data.nome,
      idade: data.idade,
      preferencias: data.preferencias,
      valor: data.valor,
      criadaEm: data.criadaEm ? data.criadaEm.toDate() : null,
    };
  } catch (error) {
    logger.error("Erro ao obter história:", error);
    throw new Error("Erro ao carregar história");
  }
});

// Função para deletar história
exports.deletarHistoria = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new Error("Usuário não autenticado");
    }

    const {historiaId} = request.data;
    const userId = request.auth.uid;

    if (!historiaId) {
      throw new Error("ID da história é obrigatório");
    }

    const doc = await admin.firestore()
        .collection("historias")
        .doc(historiaId)
        .get();

    if (!doc.exists) {
      throw new Error("História não encontrada");
    }

    const data = doc.data();

    // Verificar se a história pertence ao usuário
    if (data.userId !== userId) {
      throw new Error("Acesso negado");
    }

    await admin.firestore().collection("historias").doc(historiaId).delete();

    logger.info("História deletada com sucesso", {historiaId, userId});

    return {message: "História deletada com sucesso"};
  } catch (error) {
    logger.error("Erro ao deletar história:", error);
    throw new Error("Erro ao deletar história");
  }
});

// Health check
exports.health = onRequest((req, res) => {
  cors(req, res, () => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "Ludo Conto Functions",
    });
  });
});
