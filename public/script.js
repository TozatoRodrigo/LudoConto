// Ludo Conto - Historias personalizadas com IA

// Elementos do DOM
const form = document.getElementById('historia-form');
const btnGerar = document.getElementById('btn-gerar');
const btnText = document.querySelector('.btn-text');
const loading = document.querySelector('.loading');
const resultado = document.getElementById('resultado');
const historiaContent = document.getElementById('historia-content');
const modalSobre = document.getElementById('modal-sobre');

// Event Listeners
form.addEventListener('submit', gerarHistoria);

// Funcao para toggle do modal sobre
function toggleSobre() {
    modalSobre.style.display = modalSobre.style.display === 'block' ? 'none' : 'block';
}

// Fechar modal clicando fora
window.onclick = function(event) {
    if (event.target === modalSobre) {
        modalSobre.style.display = 'none';
    }
}

// Funcao para adicionar sugestoes ao campo de preferencias
function adicionarSugestao(sugestao) {
    const preferencasInput = document.getElementById('preferencias');
    const valorAtual = preferencasInput.value.trim();
    
    if (valorAtual === '') {
        preferencasInput.value = sugestao;
    } else if (!valorAtual.includes(sugestao)) {
        preferencasInput.value = valorAtual + ', ' + sugestao;
    }
    
    preferencasInput.focus();
}

// Funcao principal para gerar historia
async function gerarHistoria(e) {
    e.preventDefault();
    
    // Verificar se o usuario esta logado
    if (!window.userToken) {
        alert('Voce precisa estar logado para gerar historias.');
        return;
    }
    
    // Coletar dados do formulario
    const formData = new FormData(form);
    const dados = {
        nome: formData.get('nome').trim(),
        idade: parseInt(formData.get('idade')),
        preferencias: formData.get('preferencias').trim(),
        valor: formData.get('valor'),
        desafio: formData.get('desafio').trim()
    };
    
    // Validacao basica
    if (!dados.nome || !dados.idade || !dados.preferencias || !dados.valor) {
        alert('Por favor, preencha todos os campos obrigatorios.');
        return;
    }
    
    if (dados.idade < 3 || dados.idade > 12) {
        alert('A idade deve estar entre 3 e 12 anos.');
        return;
    }
    
    // Mostrar loading
    mostrarLoading(true);
    
    try {
        // Verificar se o usuario esta autenticado
        if (!window.currentUser) {
            throw new Error('Usuario nao autenticado');
        }
        
        // Importar Firebase Functions
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
        
        const functions = getFunctions();
        const gerarHistoriaFunction = httpsCallable(functions, 'gerarHistoria');
        
        const result = await gerarHistoriaFunction(dados);
        
        // Exibir historia com imagem
        exibirHistoria(result.data.historia, result.data.imagemUrl);
        
        // Atualizar status do plano
        window.planoUsuario = result.data.planoUsuario;
        window.podeGerarImagem = result.data.podeGerarMaisImagens;
        
        // Verificar status do plano apos gerar historia
        setTimeout(verificarStatusPlano, 1000);
        
        // Mostrar nudges de conversao baseados no uso
        setTimeout(() => {
            mostrarNudgeConversao(result.data);
        }, 3000);
        
    } catch (error) {
        console.error('Erro:', error);
        if (error.message.includes('LIMITE_HISTORIAS_ATINGIDO')) {
            mostrarPaywallHistoria();
        } else if (error.message.includes('Token')) {
            alert('Sua sessao expirou. Faça login novamente.');
            window.logout();
        } else {
            alert('Ops! Algo deu errado ao gerar sua historia. Tente novamente em alguns instantes.');
        }
    } finally {
        mostrarLoading(false);
    }
}

// Funcao para mostrar/esconder loading
function mostrarLoading(show) {
    if (show) {
        btnText.style.display = 'none';
        loading.style.display = 'flex';
        btnGerar.disabled = true;
        resultado.style.display = 'none';
    } else {
        btnText.style.display = 'block';
        loading.style.display = 'none';
        btnGerar.disabled = false;
    }
}

// Funcao para exibir a historia gerada
function exibirHistoria(historia, imagemUrl = null) {
    // Processar o texto da historia para melhor formatacao
    const historiaFormatada = formatarHistoria(historia);
    
    // Criar HTML com imagem se disponivel
    let htmlCompleto = '';
    
    if (imagemUrl) {
        htmlCompleto += `
            <div class="historia-imagem">
                <img src="${imagemUrl}" alt="Ilustracao da historia" class="imagem-historia" />
                <div class="imagem-loading" style="display: none;">
                    <div class="spinner"></div>
                    <p>Carregando ilustracao magica...</p>
                </div>
            </div>
        `;
    }
    
    htmlCompleto += `<div class="historia-texto">${historiaFormatada}</div>`;
    
    historiaContent.innerHTML = htmlCompleto;
    
    // Adicionar evento de carregamento da imagem
    if (imagemUrl) {
        const img = historiaContent.querySelector('.imagem-historia');
        const loadingDiv = historiaContent.querySelector('.imagem-loading');
        
        img.style.display = 'none';
        loadingDiv.style.display = 'block';
        
        img.onload = function() {
            loadingDiv.style.display = 'none';
            img.style.display = 'block';
            img.style.animation = 'fadeInImage 0.8s ease-out';
        };
        
        img.onerror = function() {
            loadingDiv.innerHTML = '<p>🎨 Ilustracao nao disponivel</p>';
        };
    }
    
    resultado.style.display = 'block';
    
    // Scroll suave para o resultado
    resultado.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Funcao para formatar a historia
function formatarHistoria(texto) {
    // Dividir em linhas e processar
    const linhas = texto.split('\n').filter(linha => linha.trim() !== '');
    let htmlFormatado = '';
    
    linhas.forEach((linha, index) => {
        linha = linha.trim();
        
        // Se a primeira linha parece ser um titulo
        if (index === 0 && (linha.length < 100 || linha.includes('Historia') || linha.includes('Aventura'))) {
            htmlFormatado += `<h3>${linha}</h3>`;
        } else {
            htmlFormatado += `<p>${linha}</p>`;
        }
    });
    
    return htmlFormatado;
}

// Funcao para copiar historia
async function copiarHistoria() {
    try {
        const textoHistoria = historiaContent.innerText;
        await navigator.clipboard.writeText(textoHistoria);
        
        // Feedback visual
        const btnCopiar = event.target;
        const textoOriginal = btnCopiar.innerHTML;
        btnCopiar.innerHTML = '✅ Copiado!';
        btnCopiar.style.background = '#28a745';
        
        setTimeout(() => {
            btnCopiar.innerHTML = textoOriginal;
            btnCopiar.style.background = '';
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao copiar:', error);
        alert('Nao foi possivel copiar a historia. Tente selecionar o texto manualmente.');
    }
}

// Funcao para gerar nova historia
function novaHistoria() {
    resultado.style.display = 'none';
    
    // Scroll suave para o formulario
    form.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    // Focar no primeiro campo
    document.getElementById('nome').focus();
}

// Funcao para validacao em tempo real
document.getElementById('nome').addEventListener('input', function(e) {
    // Remover caracteres especiais do nome
    e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
});

document.getElementById('idade').addEventListener('input', function(e) {
    const idade = parseInt(e.target.value);
    if (idade && (idade < 3 || idade > 12)) {
        e.target.setCustomValidity('A idade deve estar entre 3 e 12 anos');
    } else {
        e.target.setCustomValidity('');
    }
});



// Animacao suave para os elementos quando carregam
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar classe de animacao aos elementos
    const elementos = document.querySelectorAll('.form-container, .hero');
    elementos.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            el.style.transition = 'all 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// Funcao para toggle do modal de historias
function toggleHistorias() {
    const modal = document.getElementById('modal-historias');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        carregarHistorias();
    }
}

// Funcao para carregar historias do usuario
async function carregarHistorias() {
    const historiasContainer = document.getElementById('historias-list');
    
    // Mostrar loading
    historiasContainer.innerHTML = `
        <div class="loading-historias">
            <div class="spinner"></div>
            Carregando suas historias...
        </div>
    `;
    
    try {
        // Verificar se o usuario esta autenticado
        if (!window.currentUser) {
            throw new Error('Usuario nao autenticado');
        }
        
        // Usar Firebase Functions
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
        
        const functions = getFunctions();
        const minhasHistoriasFunction = httpsCallable(functions, 'minhasHistorias');
        
        const result = await minhasHistoriasFunction();
        
        // Armazenar historias globalmente para filtros
        window.todasHistorias = result.data.historias;
        
        exibirHistorias(result.data.historias);
        
    } catch (error) {
        console.error('Erro ao carregar historias:', error);
        historiasContainer.innerHTML = `
            <div class="empty-state">
                <h3>Erro ao carregar historias</h3>
                <p>Tente novamente em alguns instantes.</p>
            </div>
        `;
    }
}

// Funcao para exibir lista de historias
function exibirHistorias(historias) {
    const historiasContainer = document.getElementById('historias-list');
    
    if (historias.length === 0) {
        historiasContainer.innerHTML = `
            <div class="empty-state">
                <h3>Nenhuma historia encontrada</h3>
                <p>Que tal criar sua primeira historia magica?</p>
            </div>
        `;
        return;
    }
    
    const historiasHtml = historias.map(historia => `
        <div class="historia-item">
            <div class="historia-header">
                <div class="historia-info">
                    <h4>Historia para ${historia.nome}</h4>
                    <div class="historia-meta">
                        ${historia.idade} anos • ${historia.valor} • ${formatarData(historia.criadaEm)}
                    </div>
                    <div class="historia-meta">
                        <strong>Preferencias:</strong> ${historia.preferencias}
                    </div>
                </div>
                ${historia.imagemUrl ? `
                    <div class="historia-thumbnail">
                        <img src="${historia.imagemUrl}" alt="Ilustracao" class="thumbnail-img" />
                    </div>
                ` : ''}
            </div>
            <div class="historia-preview">
                ${historia.preview}
            </div>
            <div class="historia-actions">
                <button class="btn-small" onclick="verHistoriaCompleta('${historia.id}')">
                    📖 Ver Historia Completa
                </button>
                <button class="btn-small ${historia.favorita ? 'btn-favorito-ativo' : 'btn-favorito'}" 
                        onclick="toggleFavorito('${historia.id}')">
                    ${historia.favorita ? '❤️ Favorita' : '🤍 Favoritar'}
                </button>
                <button class="btn-small btn-share" onclick="compartilharHistoria('${historia.id}')">
                    📤 Compartilhar
                </button>
                <button class="btn-small btn-danger" onclick="deletarHistoria('${historia.id}')">
                    🗑️ Deletar
                </button>
            </div>
        </div>
    `).join('');
    
    historiasContainer.innerHTML = historiasHtml;
}

// Funcao para ver historia completa
async function verHistoriaCompleta(historiaId) {
    try {
        // Verificar se o usuario esta autenticado
        if (!window.currentUser) {
            throw new Error('Usuario nao autenticado');
        }
        
        // Usar Firebase Functions
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
        
        const functions = getFunctions();
        const obterHistoriaFunction = httpsCallable(functions, 'obterHistoria');
        
        const result = await obterHistoriaFunction({ historiaId });
        
        // Fechar modal de historias
        document.getElementById('modal-historias').style.display = 'none';
        
        // Exibir historia no resultado principal
        exibirHistoria(result.data.historia, result.data.imagemUrl);
        
    } catch (error) {
        console.error('Erro ao carregar historia:', error);
        alert('Erro ao carregar historia. Tente novamente.');
    }
}

// Funcao para deletar historia
async function deletarHistoria(historiaId) {
    if (!confirm('Tem certeza que deseja deletar esta historia? Esta acao nao pode ser desfeita.')) {
        return;
    }
    
    try {
        // Verificar se o usuario esta autenticado
        if (!window.currentUser) {
            throw new Error('Usuario nao autenticado');
        }
        
        // Usar Firebase Functions
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
        
        const functions = getFunctions();
        const deletarHistoriaFunction = httpsCallable(functions, 'deletarHistoria');
        
        await deletarHistoriaFunction({ historiaId });
        
        // Recarregar lista de historias
        carregarHistorias();
        
    } catch (error) {
        console.error('Erro ao deletar historia:', error);
        alert('Erro ao deletar historia. Tente novamente.');
    }
}

// Funcao para formatar data
function formatarData(data) {
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Fechar modais clicando fora
window.onclick = function(event) {
    const modalSobre = document.getElementById('modal-sobre');
    const modalHistorias = document.getElementById('modal-historias');
    
    if (event.target === modalSobre) {
        modalSobre.style.display = 'none';
    }
    
    if (event.target === modalHistorias) {
        modalHistorias.style.display = 'none';
    }
}

// Funcao para mostrar mensagem do mascote
function showMascotMessage() {
    const messages = [
        "Ola! Eu sou o Ludo, seu amigo preguiça! 🦥",
        "Vamos criar uma historia incrivel juntos! ✨",
        "Que tal uma aventura na floresta magica? 🌳",
        "Estou aqui para te ajudar com as historias! 📚",
        "Lembre-se: toda criança merece uma historia especial! 💖"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Criar tooltip temporario
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
        position: fixed;
        bottom: 120px;
        right: 30px;
        background: linear-gradient(45deg, #ff6b6b, #feca57);
        color: white;
        padding: 12px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        max-width: 200px;
        text-align: center;
        animation: fadeIn 0.3s ease-out;
    `;
    
    tooltip.textContent = randomMessage;
    document.body.appendChild(tooltip);
    
    // Remover tooltip apos 3 segundos
    setTimeout(() => {
        tooltip.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(tooltip);
        }, 300);
    }, 3000);
}

// Adicionar animaçoes CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

// Variaveis globais para controle de plano
window.planoUsuario = 'gratuito';
window.podeGerarImagem = true;

// Funcao para verificar status do plano
async function verificarStatusPlano() {
    try {
        if (!window.currentUser) return;
        
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
        
        const functions = getFunctions();
        const obterStatusPlanoFunction = httpsCallable(functions, 'obterStatusPlano');
        
        const result = await obterStatusPlanoFunction();
        
        window.planoUsuario = result.data.plano;
        window.podeGerarImagem = result.data.podeGerarImagem;
        
        // Atualizar interface
        atualizarInterfacePlano(result.data);
        
    } catch (error) {
        console.error('Erro ao verificar plano:', error);
    }
}

// Funcao para atualizar interface baseada no plano
function atualizarInterfacePlano(statusPlano) {
    const btnPlano = document.getElementById('btn-plano');
    
    if (statusPlano.plano === 'premium') {
        btnPlano.innerHTML = '⭐ Premium Ativo';
        btnPlano.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
        btnPlano.style.color = '#2d3748';
    } else {
        btnPlano.innerHTML = '⭐ Upgrade Premium';
        btnPlano.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
        btnPlano.style.color = 'white';
    }
    
    // Mostrar aviso se nao pode gerar mais imagens
    if (!statusPlano.podeGerarImagem && statusPlano.plano === 'gratuito') {
        mostrarAvisoLimiteImagem();
    }
}

// Funcao para mostrar aviso de limite de imagem
function mostrarAvisoLimiteImagem() {
    const aviso = document.createElement('div');
    aviso.className = 'aviso-limite';
    aviso.innerHTML = `
        <div class="aviso-content">
            <span class="aviso-icon">🎨</span>
            <div class="aviso-text">
                <strong>Limite de ilustraçoes atingido!</strong>
                <p>Voce ja usou sua ilustracao gratuita. Assine o Premium para ilustraçoes ilimitadas!</p>
            </div>
            <button class="btn-upgrade-small" onclick="togglePlano()">⭐ Upgrade</button>
        </div>
    `;
    
    // Inserir antes do formulario
    const formContainer = document.querySelector('.form-container');
    formContainer.parentNode.insertBefore(aviso, formContainer);
}

// Funcao para toggle do modal de plano
function togglePlano() {
    const modal = document.getElementById('modal-plano');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        carregarStatusPlano();
    }
}

// Funcao para carregar status do plano no modal
async function carregarStatusPlano() {
    const statusContainer = document.getElementById('plano-status');
    const btnAssinar = document.getElementById('btn-assinar');
    
    try {
        if (!window.currentUser) {
            throw new Error('Usuario nao autenticado');
        }
        
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
        
        const functions = getFunctions();
        const obterStatusPlanoFunction = httpsCallable(functions, 'obterStatusPlano');
        
        const result = await obterStatusPlanoFunction();
        const status = result.data;
        
        if (status.plano === 'premium') {
            statusContainer.innerHTML = `
                <div class="plano-ativo">
                    <span class="status-icon">✅</span>
                    <div class="status-text">
                        <strong>Premium Ativo!</strong>
                        <p>Voce tem acesso a ilustraçoes ilimitadas</p>
                    </div>
                </div>
            `;
            btnAssinar.style.display = 'none';
        } else {
            const imagensRestantes = status.podeGerarImagem ? 1 : 0;
            statusContainer.innerHTML = `
                <div class="plano-gratuito">
                    <span class="status-icon">🎁</span>
                    <div class="status-text">
                        <strong>Plano Gratuito</strong>
                        <p>Ilustraçoes restantes: ${imagensRestantes}</p>
                    </div>
                </div>
            `;
            btnAssinar.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Erro ao carregar status:', error);
        statusContainer.innerHTML = `
            <div class="erro-status">
                <span class="status-icon">⚠️</span>
                <p>Erro ao carregar status do plano</p>
            </div>
        `;
    }
}

// Funcao para assinar premium
async function assinarPremium() {
    try {
        if (!window.currentUser) {
            alert('Voce precisa estar logado para assinar o Premium.');
            return;
        }
        
        const btnAssinar = document.getElementById('btn-assinar');
        btnAssinar.innerHTML = '<div class="spinner"></div> Processando...';
        btnAssinar.disabled = true;
        
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
        
        const functions = getFunctions();
        const criarCheckoutFunction = httpsCallable(functions, 'criarCheckoutSession');
        
        const result = await criarCheckoutFunction({
            origin: window.location.origin
        });
        
        // Redirecionar para o Stripe Checkout
        window.location.href = result.data.url;
        
    } catch (error) {
        console.error('Erro ao criar checkout:', error);
        alert('Erro ao processar pagamento. Tente novamente.');
        
        const btnAssinar = document.getElementById('btn-assinar');
        btnAssinar.innerHTML = '⭐ Assinar Premium';
        btnAssinar.disabled = false;
    }
}

// Verificar status do plano quando o usuario faz login
window.addEventListener('userLoggedIn', verificarStatusPlano);

// Verificar status do plano quando a pagina carrega
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que o usuario foi carregado
    setTimeout(verificarStatusPlano, 1000);
});

// Configuracao do Stripe
window.STRIPE_PUBLISHABLE_KEY = 'pk_live_51RqI6J0Tz9khDe1D2y1mIuJYbbqbZGcZdQFW4sTXDYf5o8PJMG8mKXCR2Slkpt7iA4uN9IgYvGHwTt7PYD4aHuQP00B6DsbnJl';

// Funcao para mostrar mensagem do mascote
function showMascotMessage() {
    const messages = [
        "Ola! Eu sou o Ludo, seu amigo preguiça! 🦥",
        "Vamos criar uma historia incrivel juntos! ✨",
        "Que tal uma aventura na floresta magica? 🌳",
        "Estou aqui para te ajudar com as historias! 📚",
        "Lembre-se: toda criança merece uma historia especial! 💖"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Criar tooltip temporario
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
        position: fixed;
        bottom: 120px;
        right: 30px;
        background: linear-gradient(45deg, #ff6b6b, #feca57);
        color: white;
        padding: 12px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        max-width: 200px;
        text-align: center;
        animation: fadeIn 0.3s ease-out;
    `;
    
    tooltip.textContent = randomMessage;
    document.body.appendChild(tooltip);
    
    // Remover tooltip apos 3 segundos
    setTimeout(() => {
        tooltip.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            if (tooltip.parentNode) {
                document.body.removeChild(tooltip);
            }
        }, 300);
    }, 3000);
}

// Verificar status do plano quando o usuario faz login
if (typeof window !== 'undefined') {
    window.addEventListener('userLoggedIn', verificarStatusPlano);
    
    // Verificar status do plano quando a pagina carrega
    document.addEventListener('DOMContentLoaded', function() {
        // Aguardar um pouco para garantir que o usuario foi carregado
        setTimeout(verificarStatusPlano, 1000);
    });
}

// Configuracao do Stripe
window.STRIPE_PUBLISHABLE_KEY = 'pk_live_51RqI6J0Tz9khDe1D2y1mIuJYbbqbZGcZdQFW4sTXDYf5o8PJMG8mKXCR2Slkpt7iA4uN9IgYvGHwTt7PYD4aHuQP00B6DsbnJl';

// Funcao para toggle favorito
async function toggleFavorito(historiaId) {
    try {
        if (!window.currentUser) {
            throw new Error('Usuario nao autenticado');
        }
        
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
        
        const functions = getFunctions();
        const toggleFavoritoFunction = httpsCallable(functions, 'toggleFavorito');
        
        const result = await toggleFavoritoFunction({ historiaId });
        
        // Mostrar feedback
        mostrarNotificacao(result.data.message, 'sucesso');
        
        // Recarregar lista de historias
        carregarHistorias();
        
    } catch (error) {
        console.error('Erro ao atualizar favorito:', error);
        mostrarNotificacao('Erro ao atualizar favorito. Tente novamente.', 'erro');
    }
}

// Funcao para compartilhar historia
async function compartilharHistoria(historiaId) {
    try {
        if (!window.currentUser) {
            throw new Error('Usuario nao autenticado');
        }
        
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
        
        const functions = getFunctions();
        const gerarLinkFunction = httpsCallable(functions, 'gerarLinkCompartilhamento');
        
        const result = await gerarLinkFunction({ historiaId });
        
        // Copiar link para clipboard
        await navigator.clipboard.writeText(result.data.shareUrl);
        
        // Mostrar modal de compartilhamento
        mostrarModalCompartilhamento(result.data.shareUrl);
        
    } catch (error) {
        console.error('Erro ao compartilhar historia:', error);
        mostrarNotificacao('Erro ao gerar link de compartilhamento.', 'erro');
    }
}

// Funcao para mostrar modal de compartilhamento
function mostrarModalCompartilhamento(shareUrl) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content modal-share">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <div class="share-header">
                <h2>📤 Compartilhar Historia</h2>
                <p>Link copiado para a area de transferencia!</p>
            </div>
            <div class="share-content">
                <div class="share-url">
                    <input type="text" value="${shareUrl}" readonly onclick="this.select()">
                    <button onclick="navigator.clipboard.writeText('${shareUrl}'); mostrarNotificacao('Link copiado!', 'sucesso')">
                        📋 Copiar
                    </button>
                </div>
                <div class="share-buttons">
                    <button onclick="compartilharWhatsApp('${shareUrl}')" class="btn-whatsapp">
                        📱 WhatsApp
                    </button>
                    <button onclick="compartilharEmail('${shareUrl}')" class="btn-email">
                        📧 Email
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Remover modal apos 10 segundos
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 10000);
}

// Funcao para compartilhar no WhatsApp
function compartilharWhatsApp(shareUrl) {
    const texto = encodeURIComponent(`Olha que historia magica eu criei no Ludo Conto! 🦥✨\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${texto}`, '_blank');
}

// Funcao para compartilhar por email
function compartilharEmail(shareUrl) {
    const assunto = encodeURIComponent('Historia Magica do Ludo Conto');
    const corpo = encodeURIComponent(`Ola!\n\nCriei uma historia magica no Ludo Conto e queria compartilhar com voce!\n\nVeja aqui: ${shareUrl}\n\nO Ludo Conto cria historias personalizadas para crianças com ilustraçoes incriveis!\n\nAbraços! 🦥✨`);
    window.open(`mailto:?subject=${assunto}&body=${corpo}`);
}

// Funcao para mostrar notificaçoes
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.innerHTML = `
        <div class="notificacao-content">
            <span class="notificacao-icon">
                ${tipo === 'sucesso' ? '✅' : tipo === 'erro' ? '❌' : 'ℹ️'}
            </span>
            <span class="notificacao-texto">${mensagem}</span>
        </div>
    `;
    
    document.body.appendChild(notificacao);
    
    // Animar entrada
    setTimeout(() => {
        notificacao.style.transform = 'translateX(0)';
        notificacao.style.opacity = '1';
    }, 100);
    
    // Remover apos 3 segundos
    setTimeout(() => {
        notificacao.style.transform = 'translateX(100%)';
        notificacao.style.opacity = '0';
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.remove();
            }
        }, 300);
    }, 3000);
}

// Variavel global para armazenar todas as historias
window.todasHistorias = [];

// Funcao para filtrar historias
function filtrarHistorias(filtro) {
    // Atualizar botoes ativos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    let historiasFiltradas = [];
    
    switch(filtro) {
        case 'todas':
            historiasFiltradas = window.todasHistorias;
            break;
        case 'favoritas':
            historiasFiltradas = window.todasHistorias.filter(h => h.favorita);
            break;
        case 'com-imagem':
            historiasFiltradas = window.todasHistorias.filter(h => h.imagemUrl);
            break;
        default:
            historiasFiltradas = window.todasHistorias;
    }
    
    exibirHistorias(historiasFiltradas);
}

// Sistema de Dashboard e Paywall
let statusUsuario = {
    plano: 'gratuito',
    historiasRestantes: 3,
    ilustracoesRestantes: 1,
    podeGerarHistoria: true,
    podeGerarImagem: true
};

// Funcao para mostrar/esconder dashboard baseado no login
function toggleDashboard(mostrar) {
    const dashboard = document.getElementById('dashboard');
    const heroSection = document.getElementById('hero-section');
    const formContainer = document.querySelector('.form-container');
    
    if (mostrar && window.currentUser) {
        dashboard.style.display = 'block';
        heroSection.style.display = 'none';
        formContainer.style.display = 'none';
        atualizarDashboard();
    } else {
        dashboard.style.display = 'none';
        heroSection.style.display = 'block';
        formContainer.style.display = 'block';
    }
}

// Funcao para atualizar dashboard com dados do usuario
async function atualizarDashboard() {
    try {
        const status = await obterStatusUsuario();
        statusUsuario = status;
        
        // Atualizar badge do plano
        const planoBadge = document.getElementById('plano-badge');
        const planoNome = planoBadge.querySelector('.plano-nome');
        
        if (status.plano === 'premium') {
            planoBadge.className = 'plano-badge premium';
            planoNome.textContent = 'LudoConto+';
        } else {
            planoBadge.className = 'plano-badge gratuito';
            planoNome.textContent = 'Plano Gratuito';
        }
        
        // Atualizar contadores
        document.getElementById('historias-restantes').textContent = 
            status.historiasRestantes === 999 ? '∞' : status.historiasRestantes;
        document.getElementById('ilustracoes-restantes').textContent = 
            status.ilustracoesRestantes === 30 ? '30' : status.ilustracoesRestantes;
        
        // Atualizar cor dos contadores baseado no status
        const historiasCard = document.getElementById('historias-restantes').closest('.stat-card');
        const ilustracoesCard = document.getElementById('ilustracoes-restantes').closest('.stat-card');
        
        if (status.historiasRestantes <= 0) {
            historiasCard.classList.add('stat-card-warning');
        } else {
            historiasCard.classList.remove('stat-card-warning');
        }
        
        if (status.ilustracoesRestantes <= 0) {
            ilustracoesCard.classList.add('stat-card-warning');
        } else {
            ilustracoesCard.classList.remove('stat-card-warning');
        }
        
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
    }
}

// Funcao para obter status do usuario
async function obterStatusUsuario() {
    if (!window.currentUser) return statusUsuario;
    
    try {
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
        const functions = getFunctions();
        const obterStatusFunction = httpsCallable(functions, 'obterStatusPlano');
        const result = await obterStatusFunction();
        return result.data;
    } catch (error) {
        console.error('Erro ao obter status:', error);
        return statusUsuario;
    }
}

// Funcao para mostrar formulario
function mostrarFormulario() {
    // Verificar se pode gerar historia
    if (!statusUsuario.podeGerarHistoria) {
        mostrarPaywallHistoria();
        return;
    }
    
    // Mostrar formulario
    document.getElementById('dashboard').style.display = 'none';
    document.querySelector('.form-container').style.display = 'block';
    
    // Scroll para o formulario
    document.querySelector('.form-container').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Funcao para mostrar paywall de historia
function mostrarPaywallHistoria() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content modal-paywall">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <div class="paywall-header">
                <div class="paywall-icon">🚫</div>
                <h2>Limite Atingido</h2>
            </div>
            <div class="paywall-content">
                <p>Voce ja gerou todas as <strong>3 historias gratuitas</strong> deste mes.</p>
                <p>Assine o <strong>LudoConto+</strong> por apenas <strong>R$ 9,99/mes</strong> e tenha:</p>
                <ul class="paywall-benefits">
                    <li>✨ <strong>Historias ilimitadas</strong> (uso justo: 1 por dia)</li>
                    <li>🎨 <strong>Ilustraçoes em todas as historias</strong> (ate 30/mes)</li>
                    <li>👨‍👩‍👧‍👦 <strong>Perfis adicionais</strong> (ate 3 crianças)</li>
                    <li>🚫 <strong>Sem anuncios</strong></li>
                </ul>
            </div>
            <div class="paywall-actions">
                <button class="btn-premium-large" onclick="assinarPremium(); this.parentElement.parentElement.parentElement.remove();">
                    ⭐ Assinar LudoConto+
                </button>
                <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove();">
                    Voltar ao Painel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Funcao para mostrar paywall de ilustracao
function mostrarPaywallIlustracao() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content modal-paywall">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <div class="paywall-header">
                <div class="paywall-icon">🎨</div>
                <h2>Ilustraçoes Ilimitadas no LudoConto+</h2>
            </div>
            <div class="paywall-content">
                <p>Somente a <strong>primeira historia gratis</strong> inclui ilustracao.</p>
                <p>Assine o <strong>LudoConto+</strong> e tenha <strong>ilustraçoes em todas as historias</strong> (ate 30 por mes)!</p>
                <div class="paywall-comparison">
                    <div class="plan-comparison">
                        <div class="plan-free">
                            <h4>🆓 Gratuito</h4>
                            <ul>
                                <li>3 historias/mes</li>
                                <li>1 ilustracao/mes</li>
                            </ul>
                        </div>
                        <div class="plan-premium">
                            <h4>⭐ LudoConto+</h4>
                            <ul>
                                <li>Historias ilimitadas</li>
                                <li>30 ilustraçoes/mes</li>
                                <li>Sem anuncios</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="paywall-actions">
                <button class="btn-premium-large" onclick="assinarPremium(); this.parentElement.parentElement.parentElement.remove();">
                    ⭐ Assinar por R$ 9,99/mes
                </button>
                <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove();">
                    Continuar sem Ilustracao
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Atualizar verificacao de status quando usuario faz login
window.addEventListener('userLoggedIn', () => {
    toggleDashboard(true);
});

// Verificar status quando pagina carrega
document.addEventListener('DOMContentLoaded', () => {
    if (window.currentUser) {
        toggleDashboard(true);
    }
});

// Funcao para gerar ilustracao
async function gerarIlustracao() {
    // Verificar se pode gerar ilustracao
    if (!statusUsuario.podeGerarImagem) {
        mostrarPaywallIlustracao();
        return;
    }
    
    const btnIlustracao = document.getElementById('btn-ilustracao');
    const textoOriginal = btnIlustracao.innerHTML;
    
    try {
        // Mostrar loading
        btnIlustracao.innerHTML = '<div class="spinner"></div> Gerando ilustracao...';
        btnIlustracao.disabled = true;
        
        // Aqui voce implementaria a chamada para gerar ilustracao
        // Por enquanto, vou simular
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        mostrarNotificacao('Ilustracao gerada com sucesso!', 'sucesso');
        
        // Atualizar status
        await atualizarDashboard();
        
    } catch (error) {
        console.error('Erro ao gerar ilustracao:', error);
        mostrarNotificacao('Erro ao gerar ilustracao. Tente novamente.', 'erro');
    } finally {
        btnIlustracao.innerHTML = textoOriginal;
        btnIlustracao.disabled = false;
    }
}

// Funcao para voltar ao dashboard
function voltarDashboard() {
    document.getElementById('resultado').style.display = 'none';
    document.querySelector('.form-container').style.display = 'none';
    toggleDashboard(true);
}

// Atualizar funcao de nova historia para voltar ao dashboard
function novaHistoria() {
    if (window.currentUser) {
        voltarDashboard();
    } else {
        resultado.style.display = 'none';
        
        // Scroll suave para o formulario
        form.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Focar no primeiro campo
        document.getElementById('nome').focus();
    }
}