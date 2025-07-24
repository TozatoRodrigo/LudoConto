// Configuração do Firebase para o frontend
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDH02CAV-mEtQhhPmRJRuxiVKCJak4N3GA",
  authDomain: "ludoconto.firebaseapp.com",
  projectId: "ludoconto",
  storageBucket: "ludoconto.firebasestorage.app",
  messagingSenderId: "608733666496",
  appId: "1:608733666496:web:b638178ee15d7ca0732125",
  measurementId: "G-004YJNNFN9"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };