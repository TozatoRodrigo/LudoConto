import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase-config.js';

// Elementos do DOM
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authError = document.getElementById('auth-error');

// Variável global para o token do usuário
window.userToken = null;
window.currentUser = null;

// Event listeners
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);

// Verificar estado de autenticação
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Usuário logado
        window.currentUser = user;
        window.userToken = await user.getIdToken();
        showMainApp();
    } else {
        // Usuário não logado
        window.currentUser = null;
        window.userToken = null;
        showLoginScreen();
    }
});

// Função para mostrar tela de login
function showLoginScreen() {
    loginScreen.style.display = 'flex';
    mainApp.style.display = 'none';
}

// Função para mostrar app principal
function showMainApp() {
    loginScreen.style.display = 'none';
    mainApp.style.display = 'block';
}

// Função para alternar entre login e cadastro
window.showLogin = function() {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    clearError();
}

window.showRegister = function() {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    clearError();
}

// Função para fazer login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = loginForm.querySelector('.auth-btn');
    
    showAuthLoading(btn, true);
    clearError();
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // O onAuthStateChanged vai lidar com o redirecionamento
    } catch (error) {
        console.error('Erro no login:', error);
        showError(getErrorMessage(error.code));
    } finally {
        showAuthLoading(btn, false);
    }
}

// Função para fazer cadastro
async function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const btn = registerForm.querySelector('.auth-btn');
    
    if (password !== confirmPassword) {
        showError('As senhas não coincidem');
        return;
    }
    
    showAuthLoading(btn, true);
    clearError();
    
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        // O onAuthStateChanged vai lidar com o redirecionamento
    } catch (error) {
        console.error('Erro no cadastro:', error);
        showError(getErrorMessage(error.code));
    } finally {
        showAuthLoading(btn, false);
    }
}

// Função para fazer logout
window.logout = async function() {
    try {
        await signOut(auth);
        // O onAuthStateChanged vai lidar com o redirecionamento
    } catch (error) {
        console.error('Erro no logout:', error);
        alert('Erro ao sair. Tente novamente.');
    }
}

// Função para mostrar/esconder loading nos botões de auth
function showAuthLoading(btn, show) {
    const btnText = btn.querySelector('.btn-text');
    const loading = btn.querySelector('.loading');
    
    if (show) {
        btnText.style.display = 'none';
        loading.style.display = 'flex';
        btn.disabled = true;
    } else {
        btnText.style.display = 'block';
        loading.style.display = 'none';
        btn.disabled = false;
    }
}

// Função para mostrar erro
function showError(message) {
    authError.textContent = message;
    authError.style.display = 'block';
}

// Função para limpar erro
function clearError() {
    authError.style.display = 'none';
}

// Função para traduzir códigos de erro do Firebase
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/email-already-in-use': 'Este e-mail já está em uso',
        'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
        'auth/invalid-email': 'E-mail inválido',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet'
    };
    
    return errorMessages[errorCode] || 'Erro desconhecido. Tente novamente.';
}