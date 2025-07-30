const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const {onCall} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions"); // eslint-disable-line
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

// Inicializar Firebase Admin
admin.initializeApp();

setGlobalOptions({maxInstances: 10});

/**
 * Função para contar histórias do usuário no mês atual
 * @param {string} userId - ID do usuário
 * @return {number} Número de histórias do mês
 */
async function contarHistoriasUsuarioMesAtual(userId) {
  try {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    const snapshot = await admin.firestore()
        .collection("historias")
        .where("userId", "==", userId)
        .where("criadaEm", ">=", inicioMes)
        .get();
    return snapshot.size;
  } catch (error) {
    logger.error("Erro ao contar histórias do mês:", error);
    return 0;
  }
}

/**
 * Função para contar histórias do usuário (total)
 * @param {string} userId - ID do usuário
 * @return {number} Número total de histórias
 */
async function contarHistoriasUsuario(userId) {
  try {
    const snapshot = await admin.firestore()
        .collection("historias")
        .where("userId", "==", userId)
        .get();
    return snapshot.size;
  } catch (error) {
    logger.error("Erro ao contar histórias:", error);
    return 0;
  }
}

/**
 * Função para verificar plano do usuário
 * @param {string} userId - ID do usuário
 * @return {Object} Informações do plano
 */
async function verificarPlanoUsuario(userId) {
  try {
    const userDoc = await admin.firestore()
        .collection("usuarios")
        .doc(userId)
        .get();

    if (!userDoc.exists) {
      // Criar usuário com plano gratuito
      await admin.firestore()
          .collection("usuarios")
          .doc(userId)
          .set({
            plano: "gratuito",
            historiaComImagemUsada: false,
            stripeCustomerId: null,
            subscriptionId: null,
            criadoEm: admin.firestore.FieldValue.serverTimestamp(),
          });
      return {plano: "gratuito", historiaComImagemUsada: false};
    }

    const userData = userDoc.data();
    return {
      plano: userData.plano || "gratuito",
      historiaComImagemUsada: userData.historiaComImagemUsada || false,
    };
  } catch (error) {
    logger.error("Erro ao verificar plano:", error);
    return {plano: "gratuito", historiaComImagemUsada: false};
  }
}

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

    // Verificar plano do usuário
    const planoInfo = await verificarPlanoUsuario(userId);
    logger.info("📋 Plano do usuário:", planoInfo);

    // Configurar OpenAI
    const OpenAI = require("openai");
    const apiKey = "sk-proj-vkvwEwjjLc093TlpbxTxED1utMkGM3FNAOXHedogpp-" +
      "mqdxFMRYeSqBv7HjhRx03VJ_5aTp3gkT3BlbkFJmSmo9p8R7V59gw82IWaWUXy19AZjmT_" +
      "-FFqL799YyNfRiC8w86YexflBPGOU0krUhMJ6t9dIMA";

    const openai = new OpenAI({apiKey});

    logger.info("🤖 Configurando OpenAI e gerando prompt...");

    const promptText = `Você é um contador de histórias infantis seguro e ` +
      `empático, inspirado por Antoine de Saint‑Exupéry, Roald Dahl, ` +
      `J.K. Rowling e contos clássicos.

Gere uma história personalizada com base:
- Nome da criança: ${nome}
- Idade: ${idade}
- Preferências: ${preferencias}
- Virtude: ${valor}
- Desafio atual: ${desafio || "Nenhum desafio específico"}

### Diretrizes por Idade:
${idade <= 3 ? `
**2-3 anos:** Frases curtas, repetição, vocabulário concreto, ` +
      `180-300 palavras, moral explícita.
- Use padrões repetitivos ("E então... E então...")
- Personagens simples e familiares
- Ações concretas e visuais
- Final feliz óbvio com moral clara
` : idade <= 5 ? `
**4-5 anos:** Parágrafos curtos, 250-450 palavras, humor leve, ` +
      `moral clara e contextualizada.
- Diálogos simples entre personagens
- Pequenos problemas com soluções claras
- Elementos de fantasia leve
- Moral integrada à ação
` : `
**6-8 anos:** Narrativa mais longa (até 600 palavras), ` +
      `mini-arcos de superação, 1 reviravolta leve, moral integrada ao desfecho.
- Desenvolvimento de personagem
- Conflito mais elaborado
- Reviravolta positiva
- Moral sutil mas clara
`}

### Estrutura Obrigatória:
1. **Início:** Apresentar ${nome} e cenário com ${preferencias}
2. **Meio:** Conflito ou desafio relacionado à virtude ${valor}
3. **Fim:** Resolução positiva + moral integrada

### Segurança:
- 100% seguro: proibido conteúdo adulto, ideológico, assustador, ` +
      `violento ou político
- Linguagem positiva e encorajadora
- Personagens diversos e inclusivos

### Final Obrigatório:
Inclua um box separado:
**💡 Dicas para o Adulto:**
- 1-2 perguntas para leitura dialogada adequadas à idade ${idade}
- Sugestões de conversa sobre a virtude ${valor}

**Agora gere a história personalizada começando com um título criativo.**`;

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

    // Verificar limite de histórias no plano gratuito (3 histórias por mês)
    if (planoInfo.plano === "gratuito") {
      const historiasCount = await contarHistoriasUsuarioMesAtual(userId);
      if (historiasCount >= 3) {
        throw new Error("LIMITE_HISTORIAS_ATINGIDO");
      }
    }

    // Determinar se deve gerar imagem baseado no plano
    let deveGerarImagem = false;
    let imagemUrl = null;

    if (planoInfo.plano === "premium") {
      deveGerarImagem = true;
      logger.info("✨ Usuário premium - gerando imagem");
    } else if (planoInfo.plano === "gratuito" &&
               !planoInfo.historiaComImagemUsada) {
      deveGerarImagem = true;
      logger.info("🎁 Primeira história gratuita - gerando imagem");
    } else {
      logger.info("🚫 Plano gratuito - limite de imagem atingido");
    }

    // Gerar imagem se permitido
    if (deveGerarImagem) {
      logger.info("🎨 Gerando imagem ilustrativa...");

      // Criar prompt mais seguro para crianças
      const safePreferences = preferencias
          .replace(/dragão|dragões/gi, "friendly dragon")
          .replace(/luta|guerra|batalha/gi, "adventure")
          .replace(/arma|espada/gi, "magic wand");

      const imagePrompt = `A cheerful children's book illustration showing ` +
        `a happy young child in a magical storybook scene with ` +
        `${safePreferences}. The art style should be warm, colorful, ` +
        `and whimsical like classic children's picture books. ` +
        `Soft watercolor textures, bright friendly colors, ` +
        `cozy atmosphere, hand-drawn feel. The scene should be ` +
        `completely safe and appropriate for young children, ` +
        `with smiling characters and a joyful mood. ` +
        `No text or words in the image.`;
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
        logger.error("⚠️ Erro ao gerar imagem:", {
          error: imageError.message,
          code: imageError.code,
          type: imageError.type,
        });

        // Tentar novamente com prompt mais simples se for erro de política
        if (imageError.code === "content_policy_violation") {
          try {
            logger.info("🔄 Tentando novamente com prompt simplificado...");

            const simplePrompt = `A happy child reading a magical storybook ` +
            `in a cozy library setting. Warm colors, friendly atmosphere, ` +
            `children's book illustration style, watercolor textures. ` +
            `Safe and appropriate for young children.`;

            const retryResponse = await openai.images.generate({
              model: "dall-e-3",
              prompt: simplePrompt,
              n: 1,
              size: "1024x1024",
              quality: "standard",
              style: "natural",
            });

            imagemUrl = retryResponse.data[0].url;
            logger.info("✅ Imagem gerada com prompt simplificado", {imagemUrl});

            // Salvar a imagem de retry
            const fetch = require("node-fetch");
            const imageBuffer = await fetch(imagemUrl)
                .then((res) => res.buffer());

            const bucket = admin.storage().bucket();
            const fileName = `historias/${userId}/${Date.now()}_` +
            `${nome.replace(/\s+/g, "_")}_retry.png`;
            const file = bucket.file(fileName);

            await file.save(imageBuffer, {
              metadata: {
                contentType: "image/png",
                metadata: {
                  historiaId: "temp",
                  userId: userId,
                  nome: nome,
                },
              },
            });

            await file.makePublic();
            imagemUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          } catch (retryError) {
            logger.error("⚠️ Erro no retry da imagem:", retryError);
            imagemUrl = null;
          }
        }
      }
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

    // Atualizar status do usuário se usou a imagem gratuita
    if (imagemUrl && planoInfo.plano === "gratuito" &&
        !planoInfo.historiaComImagemUsada) {
      await admin.firestore()
          .collection("usuarios")
          .doc(userId)
          .update({
            historiaComImagemUsada: true,
          });
      logger.info("🎁 Primeira imagem gratuita utilizada");
    }

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
      planoUsuario: planoInfo.plano,
      podeGerarMaisImagens: planoInfo.plano === "premium" ||
        (planoInfo.plano === "gratuito" &&
         !planoInfo.historiaComImagemUsada),
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
          favorita: data.favorita || false,
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
// Configuração do Stripe (com fallback)
let stripe;
try {
  stripe = require("stripe")(
      functions.config().stripe && functions.config().stripe.secret_key ?
        functions.config().stripe.secret_key : "sk_test_placeholder",
  );
} catch (error) {
  logger.warn("Stripe não configurado:", error.message);
}

// Função para criar sessão de checkout
exports.criarCheckoutSession = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new Error("Usuário não autenticado");
    }

    const userId = request.auth.uid;
    const userEmail = request.auth.token.email;

    logger.info("💳 Criando sessão de checkout", {userId, userEmail});

    // Verificar se já existe customer no Stripe
    let customerId = null;
    const userDoc = await admin.firestore()
        .collection("usuarios")
        .doc(userId)
        .get();

    if (userDoc.exists && userDoc.data().stripeCustomerId) {
      customerId = userDoc.data().stripeCustomerId;
    } else {
      // Criar customer no Stripe
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUID: userId,
        },
      });
      customerId = customer.id;

      // Salvar customer ID no Firestore
      await admin.firestore()
          .collection("usuarios")
          .doc(userId)
          .set({
            stripeCustomerId: customerId,
            plano: "gratuito",
            historiaComImagemUsada: false,
          }, {merge: true});
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: functions.config().stripe &&
            functions.config().stripe.price_id ?
            functions.config().stripe.price_id :
            "price_1RqIPF0Tz9khDe1DHsKNCcwu",
          quantity: 1,
        },
      ],
      success_url: `${request.data.origin || "https://ludoconto.web.app"}` +
        `/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.data.origin || "https://ludoconto.web.app"}` +
        `/cancelado`,
      metadata: {
        firebaseUID: userId,
      },
    });

    logger.info("✅ Sessão de checkout criada", {sessionId: session.id});

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    logger.error("❌ Erro ao criar checkout:", error);
    throw new Error("Erro ao processar pagamento");
  }
});

// Webhook do Stripe para processar eventos
exports.stripeWebhook = onRequest((req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = functions.config().stripe &&
    functions.config().stripe.webhook_secret ?
    functions.config().stripe.webhook_secret : null;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Processar evento
  switch (event.type) {
    case "checkout.session.completed":
      handleCheckoutCompleted(event.data.object);
      break;
    case "customer.subscription.updated":
      handleSubscriptionUpdated(event.data.object);
      break;
    case "customer.subscription.deleted":
      handleSubscriptionDeleted(event.data.object);
      break;
    default:
      logger.info(`Evento não tratado: ${event.type}`);
  }

  res.json({received: true});
});

/**
 * Processar checkout completado
 * @param {Object} session - Sessão do Stripe
 */
async function handleCheckoutCompleted(session) { // eslint-disable-line
  try {
    const firebaseUID = session.metadata.firebaseUID;
    const subscriptionId = session.subscription;

    logger.info("🎉 Checkout completado", {firebaseUID, subscriptionId});

    // Atualizar usuário para premium
    await admin.firestore()
        .collection("usuarios")
        .doc(firebaseUID)
        .update({
          plano: "premium",
          subscriptionId: subscriptionId,
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
        });

    logger.info("✅ Usuário atualizado para premium", {firebaseUID});
  } catch (error) {
    logger.error("❌ Erro ao processar checkout:", error);
  }
}

/**
 * Processar atualização de subscription
 * @param {Object} subscription - Subscription do Stripe
 */
async function handleSubscriptionUpdated(subscription) { // eslint-disable-line
  try {
    const customerId = subscription.customer;
    const status = subscription.status;

    // Buscar usuário pelo customer ID
    const usersQuery = await admin.firestore()
        .collection("usuarios")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();

    if (usersQuery.empty) {
      logger.warn("Usuário não encontrado para customer:", customerId);
      return;
    }

    const userDoc = usersQuery.docs[0];
    const plano = status === "active" ? "premium" : "gratuito";

    await userDoc.ref.update({
      plano: plano,
      subscriptionStatus: status,
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info("✅ Subscription atualizada", {customerId, status, plano});
  } catch (error) {
    logger.error("❌ Erro ao atualizar subscription:", error);
  }
}

/**
 * Processar cancelamento de subscription
 * @param {Object} subscription - Subscription do Stripe
 */
async function handleSubscriptionDeleted(subscription) { // eslint-disable-line
  try {
    const customerId = subscription.customer;

    // Buscar usuário pelo customer ID
    const usersQuery = await admin.firestore()
        .collection("usuarios")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();

    if (usersQuery.empty) {
      logger.warn("Usuário não encontrado para customer:", customerId);
      return;
    }

    const userDoc = usersQuery.docs[0];

    await userDoc.ref.update({
      plano: "gratuito",
      subscriptionStatus: "canceled",
      subscriptionId: null,
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info("✅ Subscription cancelada", {customerId});
  } catch (error) {
    logger.error("❌ Erro ao cancelar subscription:", error);
  }
}

// Função para obter status do plano do usuário
exports.obterStatusPlano = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new Error("Usuário não autenticado");
    }

    const userId = request.auth.uid;
    const planoInfo = await verificarPlanoUsuario(userId);

    const historiasCountMes = await contarHistoriasUsuarioMesAtual(userId);
    const historiasCountTotal = await contarHistoriasUsuario(userId);

    // Limites baseados no plano
    const limites = {
      gratuito: {
        historias: 3,
        ilustracoes: 1,
      },
      premium: {
        historias: -1, // ilimitado (uso justo: 1/dia)
        ilustracoes: 30, // 30 por mês
      },
    };

    const planoLimites = limites[planoInfo.plano] || limites.gratuito;

    return {
      plano: planoInfo.plano,
      // Contadores do mês atual
      historiasRestantes: planoInfo.plano === "premium" ?
        999 : Math.max(0, planoLimites.historias - historiasCountMes),
      ilustracoesRestantes: planoInfo.plano === "premium" ?
        30 : (planoInfo.historiaComImagemUsada ? 0 : 1),

      // Status atual
      podeGerarHistoria: planoInfo.plano === "premium" ||
        historiasCountMes < planoLimites.historias,
      podeGerarImagem: planoInfo.plano === "premium" ||
        (planoInfo.plano === "gratuito" && !planoInfo.historiaComImagemUsada),

      // Estatísticas
      historiasCountMes,
      historiasCountTotal,
      historiaComImagemUsada: planoInfo.historiaComImagemUsada,
      atingiuLimiteHistorias: planoInfo.plano === "gratuito" &&
        historiasCountMes >= planoLimites.historias,
      atingiuLimiteIlustracoes: planoInfo.plano === "gratuito" &&
        planoInfo.historiaComImagemUsada,
    };
  } catch (error) {
    logger.error("❌ Erro ao obter status do plano:", error);
    throw new Error("Erro ao verificar plano");
  }
});
/**
 * Função para registrar métricas de uso
 * @param {string} userId - ID do usuário
 * @param {string} acao - Ação realizada
 * @param {Object} dados - Dados adicionais
 */
async function registrarMetrica(userId, acao, dados = {}) {
  try {
    await admin.firestore()
        .collection("metricas")
        .add({
          userId,
          acao,
          dados,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          userAgent: dados.userAgent || null,
        });
  } catch (error) {
    logger.warn("Erro ao registrar métrica:", error);
  }
}

// Função para obter estatísticas do sistema
exports.obterEstatisticas = onCall(async (request) => {
  try {
    if (!request.auth) {
      throw new Error("Usuário não autenticado");
    }

    const userId = request.auth.uid;

    // Estatísticas do usuário
    const historiasSnapshot = await admin.firestore()
        .collection("historias")
        .where("userId", "==", userId)
        .get();

    const historiasComImagem = historiasSnapshot.docs.filter(
        (doc) => doc.data().imagemUrl,
    ).length;

    const planoInfo = await verificarPlanoUsuario(userId);

    return {
      totalHistorias: historiasSnapshot.size,
      historiasComImagem,
      planoAtual: planoInfo.plano,
      podeGerarImagem: planoInfo.plano === "premium" ||
        (planoInfo.plano === "gratuito" && !planoInfo.historiaComImagemUsada),
    };
  } catch (error) {
    logger.error("Erro ao obter estatísticas:", error);
    throw new Error("Erro ao carregar estatísticas");
  }
});

// Função para marcar/desmarcar história como favorita
exports.toggleFavorito = onCall(async (request) => {
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

    const novoStatusFavorito = !data.favorita;

    await admin.firestore()
        .collection("historias")
        .doc(historiaId)
        .update({
          favorita: novoStatusFavorito,
          atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
        });

    // Registrar métrica
    await registrarMetrica(userId, "toggle_favorito", {
      historiaId,
      favorita: novoStatusFavorito,
    });

    logger.info("Status de favorito atualizado", {
      historiaId,
      userId,
      favorita: novoStatusFavorito,
    });

    return {
      favorita: novoStatusFavorito,
      message: novoStatusFavorito ?
        "História adicionada aos favoritos" :
        "História removida dos favoritos",
    };
  } catch (error) {
    logger.error("Erro ao atualizar favorito:", error);
    throw new Error("Erro ao atualizar favorito");
  }
});

// Função para gerar link de compartilhamento
exports.gerarLinkCompartilhamento = onCall(async (request) => {
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

    // Gerar token único para compartilhamento
    const shareToken = require("crypto").randomBytes(32).toString("hex");

    // Salvar token de compartilhamento
    await admin.firestore()
        .collection("compartilhamentos")
        .doc(shareToken)
        .set({
          historiaId,
          userId,
          criadoEm: admin.firestore.FieldValue.serverTimestamp(),
          ativo: true,
        });

    // Registrar métrica
    await registrarMetrica(userId, "gerar_compartilhamento", {
      historiaId,
      shareToken,
    });

    const shareUrl = `https://ludoconto.web.app/historia/${shareToken}`;

    logger.info("Link de compartilhamento gerado", {
      historiaId,
      userId,
      shareToken,
    });

    return {
      shareUrl,
      shareToken,
      message: "Link de compartilhamento gerado com sucesso",
    };
  } catch (error) {
    logger.error("Erro ao gerar link de compartilhamento:", error);
    throw new Error("Erro ao gerar link de compartilhamento");
  }
});
