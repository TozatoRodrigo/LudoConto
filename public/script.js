// Ludo Conto - Histórias personalizadas com IA

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

// Função para toggle do modal sobre
function toggleSobre() {
    modalSobre.style.display = modalSobre.style.display === 'block' ? 'none' : 'block';
}

// Fechar modal clicando fora
window.onclick = function(event) {
    if (event.target === modalSobre) {
        modalSobre.style.display = 'none';
    }
}

// Função para adicionar sugestões ao campo de preferências
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

// Função principal para gerar história
async function gerarHistoria(e) {
    e.preventDefault();
    
    // Verificar se o usuário está logado
    if (!window.userToken) {
        alert('Você precisa estar logado para gerar histórias.');
        return;
    }
    
    // Coletar dados do formulário
    const formData = new FormData(form);
    const dados = {
        nome: formData.get('nome').trim(),
        idade: parseInt(formData.get('idade')),
        preferencias: formData.get('preferencias').trim(),
        valor: formData.get('valor'),
        desafio: formData.get('desafio').trim()
    };
    
    // Validação básica
    if (!dados.nome || !dados.idade || !dados.preferencias || !dados.valor) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    if (dados.idade < 3 || dados.idade > 12) {
        alert('A idade deve estar entre 3 e 12 anos.');
        return;
    }
    
    // Mostrar loading
    mostrarLoading(true);
    
    try {
        // Verificar se o usuário está autenticado
        if (!window.currentUser) {
            throw new Error('Usuário não autenticado');
        }
        
        // Importar Firebase Functions
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
        
        const functions = getFunctions();
        const gerarHistoriaFunction = httpsCallable(functions, 'gerarHistoria');
        
        const result = await gerarHistoriaFunction(dados);
        
        // Exibir história com imagem
        exibirHistoria(result.data.historia, result.data.imagemUrl);
        
        // Atualizar status do plano
        window.planoUsuario = result.data.planoUsuario;
        window.podeGerarImagem = result.data.podeGerarMaisImagens;
        
        // Mostrar aviso se não pode gerar mais imagens
        if (!result.data.podeGerarMaisImagens && result.data.planoUsuario === 'gratuito') {
            setTimeout(() => {
                mostrarAvisoLimiteImagem();
            }, 2000);
        }
        
    } catch (error) {
        console.error('Erro:', error);
        if (error.message.includes('Token')) {
            alert('Sua sessão expirou. Faça login novamente.');
            window.logout();
        } else {
            alert('Ops! Algo deu errado ao gerar sua história. Tente novamente em alguns instantes.');
        }
    } finally {
        mostrarLoading(false);
    }
}

// Função para mostrar/esconder loading
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

// Função para exibir a história gerada
function exibirHistoria(historia, imagemUrl = null) {
    // Processar o texto da história para melhor formatação
    const historiaFormatada = formatarHistoria(historia);
    
    // Criar HTML com imagem se disponível
    let htmlCompleto = '';
    
    if (imagemUrl) {
        htmlCompleto += `
            <div class="historia-imagem">
                <img src="${imagemUrl}" alt="Ilustração da história" class="imagem-historia" />
                <div class="imagem-loading" style="display: none;">
                    <div class="spinner"></div>
                    <p>Carregando ilustração mágica...</p>
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
            loadingDiv.innerHTML = '<p>🎨 Ilustração não disponível</p>';
        };
    }
    
    resultado.style.display = 'block';
    
    // Scroll suave para o resultado
    resultado.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Função para formatar a história
function formatarHistoria(texto) {
    // Dividir em linhas e processar
    const linhas = texto.split('\n').filter(linha => linha.trim() !== '');
    let htmlFormatado = '';
    
    linhas.forEach((linha, index) => {
        linha = linha.trim();
        
        // Se a primeira linha parece ser um título
        if (index === 0 && (linha.length < 100 || linha.includes('História') || linha.includes('Aventura'))) {
            htmlFormatado += `<h3>${linha}</h3>`;
        } else {
            htmlFormatado += `<p>${linha}</p>`;
        }
    });
    
    return htmlFormatado;
}

// Função para copiar história
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
        alert('Não foi possível copiar a história. Tente selecionar o texto manualmente.');
    }
}

// Função para gerar nova história
function novaHistoria() {
    resultado.style.display = 'none';
    
    // Scroll suave para o formulário
    form.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    // Focar no primeiro campo
    document.getElementById('nome').focus();
}

// Função para validação em tempo real
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



// Animação suave para os elementos quando carregam
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar classe de animação aos elementos
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

// Função para toggle do modal de histórias
function toggleHistorias() {
    const modal = document.getElementById('modal-historias');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        carregarHistorias();
    }
}

// Função para carregar histórias do usuário
async function carregarHistorias() {
    const historiasContainer = document.getElementById('historias-list');
    
    // Mostrar loading
    historiasContainer.innerHTML = `
        <div class="loading-historias">
            <div class="spinner"></div>
            Carregando suas histórias...
        </div>
    `;
    
    try {
        // Verificar se o usuário está autenticado
        if (!window.currentUser) {
            throw new Error('Usuário não autenticado');
        }
        
        // Usar Firebase Functions
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
        
        const functions = getFunctions();
        const minhasHistoriasFunction = httpsCallable(functions, 'minhasHistorias');
        
        const result = await minhasHistoriasFunction();
        
        exibirHistorias(result.data.historias);
        
    } catch (error) {
        console.error('Erro ao carregar histórias:', error);
        historiasContainer.innerHTML = `
            <div class="empty-state">
                <h3>Erro ao carregar histórias</h3>
                <p>Tente novamente em alguns instantes.</p>
            </div>
        `;
    }
}

// Função para exibir lista de histórias
function exibirHistorias(historias) {
    const historiasContainer = document.getElementById('historias-list');
    
    if (historias.length === 0) {
        historiasContainer.innerHTML = `
            <div class="empty-state">
                <h3>Nenhuma história encontrada</h3>
                <p>Que tal criar sua primeira história mágica?</p>
            </div>
        `;
        return;
    }
    
    const historiasHtml = historias.map(historia => `
        <div class="historia-item">
            <div class="historia-header">
                <div class="historia-info">
                    <h4>História para ${historia.nome}</h4>
                    <div class="historia-meta">
                        ${historia.idade} anos • ${historia.valor} • ${formatarData(historia.criadaEm)}
                    </div>
                    <div class="historia-meta">
                        <strong>Preferências:</strong> ${historia.preferencias}
                    </div>
                </div>
                ${historia.imagemUrl ? `
                    <div class="historia-thumbnail">
                        <img src="${historia.imagemUrl}" alt="Ilustração" class="thumbnail-img" />
                    </div>
                ` : ''}
            </div>
            <div class="historia-preview">
                ${historia.preview}
            </div>
            <div class="historia-actions">
                <button class="btn-small" onclick="verHistoriaCompleta('${historia.id}')">
                    📖 Ver História Completa
                </button>
                <button class="btn-small btn-danger" onclick="deletarHistoria('${historia.id}')">
                    🗑️ Deletar
                </button>
            </div>
        </div>
    `).join('');
    
    historiasContainer.innerHTML = historiasHtml;
}

// Função para ver história completa
async function verHistoriaCompleta(historiaId) {
    try {
        // Verificar se o usuário está autenticado
        if (!window.currentUser) {
            throw new Error('Usuário não autenticado');
        }
        
        // Usar Firebase Functions
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
        
        const functions = getFunctions();
        const obterHistoriaFunction = httpsCallable(functions, 'obterHistoria');
        
        const result = await obterHistoriaFunction({ historiaId });
        
        // Fechar modal de histórias
        document.getElementById('modal-historias').style.display = 'none';
        
        // Exibir história no resultado principal
        exibirHistoria(result.data.historia, result.data.imagemUrl);
        
    } catch (error) {
        console.error('Erro ao carregar história:', error);
        alert('Erro ao carregar história. Tente novamente.');
    }
}

// Função para deletar história
async function deletarHistoria(historiaId) {
    if (!confirm('Tem certeza que deseja deletar esta história? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        // Verificar se o usuário está autenticado
        if (!window.currentUser) {
            throw new Error('Usuário não autenticado');
        }
        
        // Usar Firebase Functions
        const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
        
        const functions = getFunctions();
        const deletarHistoriaFunction = httpsCallable(functions, 'deletarHistoria');
        
        await deletarHistoriaFunction({ historiaId });
        
        // Recarregar lista de histórias
        carregarHistorias();
        
    } catch (error) {
        console.error('Erro ao deletar história:', error);
        alert('Erro ao deletar história. Tente novamente.');
    }
}

// Função para formatar data
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

// Função para mostrar mensagem do mascote
function showMascotMessage() {
    const messages = [
        "Olá! Eu sou o Ludo, seu amigo preguiça! 🦥",
        "Vamos criar uma história incrível juntos! ✨",
        "Que tal uma aventura na floresta mágica? 🌳",
        "Estou aqui para te ajudar com as histórias! 📚",
        "Lembre-se: toda criança merece uma história especial! 💖"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Criar tooltip temporário
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
    
    // Remover tooltip após 3 segundos
    setTimeout(() => {
        tooltip.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(tooltip);
        }, 300);
    }, 3000);
}

// Adicionar animações CSS dinamicamente
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

// Variáveis globais para controle de plano
window.planoUsuario = 'gratuito';
window.podeGerarImagem = true;

// Função para verificar status do plano
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

// Função para atualizar interface baseada no plano
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
    
    // Mostrar aviso se não pode gerar mais imagens
    if (!statusPlano.podeGerarImagem && statusPlano.plano === 'gratuito') {
        mostrarAvisoLimiteImagem();
    }
}

// Função para mostrar aviso de limite de imagem
function mostrarAvisoLimiteImagem() {
    const aviso = document.createElement('div');
    aviso.className = 'aviso-limite';
    aviso.innerHTML = `
        <div class="aviso-content">
            <span class="aviso-icon">🎨</span>
            <div class="aviso-text">
                <strong>Limite de ilustrações atingido!</strong>
                <p>Você já usou sua ilustração gratuita. Assine o Premium para ilustrações ilimitadas!</p>
            </div>
            <button class="btn-upgrade-small" onclick="togglePlano()">⭐ Upgrade</button>
        </div>
    `;
    
    // Inserir antes do formulário
    const formContainer = document.querySelector('.form-container');
    formContainer.parentNode.insertBefore(aviso, formContainer);
}

// Função para toggle do modal de plano
function togglePlano() {
    const modal = document.getElementById('modal-plano');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        carregarStatusPlano();
    }
}

// Função para carregar status do plano no modal
async function carregarStatusPlano() {
    const statusContainer = document.getElementById('plano-status');
    const btnAssinar = document.getElementById('btn-assinar');
    
    try {
        if (!window.currentUser) {
            throw new Error('Usuário não autenticado');
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
                        <p>Você tem acesso a ilustrações ilimitadas</p>
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
                        <p>Ilustrações restantes: ${imagensRestantes}</p>
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

// Função para assinar premium
async function assinarPremium() {
    try {
        if (!window.currentUser) {
            alert('Você precisa estar logado para assinar o Premium.');
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

// Verificar status do plano quando o usuário faz login
window.addEventListener('userLoggedIn', verificarStatusPlano);

// Verificar status do plano quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que o usuário foi carregado
    setTimeout(verificarStatusPlano, 1000);
});/
/ Configuração do Stripe
window.STRIPE_PUBLISHABLE_KEY = 'pk_live_51RqI6J0Tz9khDe1D2y1mIuJYbbqbZGcZdQFW4sTXDYf5o8PJMG8mKXCR2Slkpt7iA4uN9IgYvGHwTt7PYD4aHuQP00B6DsbnJl';//
 Função para mostrar mensagem do mascote
function showMascotMessage() {
    const messages = [
        "Olá! Eu sou o Ludo, seu amigo preguiça! 🦥",
        "Vamos criar uma história incrível juntos! ✨",
        "Que tal uma aventura na floresta mágica? 🌳",
        "Estou aqui para te ajudar com as histórias! 📚",
        "Lembre-se: toda criança merece uma história especial! 💖"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Criar tooltip temporário
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
    
    // Remover tooltip após 3 segundos
    setTimeout(() => {
        tooltip.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            if (tooltip.parentNode) {
                document.body.removeChild(tooltip);
            }
        }, 300);
    }, 3000);
}

// Verificar status do plano quando o usuário faz login
if (typeof window !== 'undefined') {
    window.addEventListener('userLoggedIn', verificarStatusPlano);
    
    // Verificar status do plano quando a página carrega
    document.addEventListener('DOMContentLoaded', function() {
        // Aguardar um pouco para garantir que o usuário foi carregado
        setTimeout(verificarStatusPlano, 1000);
    });
}

// Configuração do Stripe
window.STRIPE_PUBLISHABLE_KEY = 'pk_live_51RqI6J0Tz9khDe1D2y1mIuJYbbqbZGcZdQFW4sTXDYf5o8PJMG8mKXCR2Slkpt7iA4uN9IgYvGHwTt7PYD4aHuQP00B6DsbnJl';