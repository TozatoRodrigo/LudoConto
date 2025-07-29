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
        
        // Exibir história
        exibirHistoria(result.data.historia);
        
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
function exibirHistoria(historia) {
    // Processar o texto da história para melhor formatação
    const historiaFormatada = formatarHistoria(historia);
    
    historiaContent.innerHTML = historiaFormatada;
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
            </div>
            <div class="historia-preview">
                ${historia.preview}
            </div>
            <div class="historia-actions">
                <button class="btn-small" onclick="verHistoriaCompleta('${historia.id}')">
                    Ver História Completa
                </button>
                <button class="btn-small btn-danger" onclick="deletarHistoria('${historia.id}')">
                    Deletar
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
        exibirHistoria(result.data.historia);
        
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