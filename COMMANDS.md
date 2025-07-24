# 🛠️ Comandos Úteis - Ludo Conto

Lista de comandos úteis para desenvolvimento e deploy do Ludo Conto.

## 📦 Instalação e Setup

```bash
# Clonar repositório
git clone https://github.com/TozatoRodrigo/LudoConto.git
cd LudoConto

# Instalar dependências
npm install

# Setup inicial (instala e mostra próximos passos)
npm run setup

# Verificar configuração
npm run check
```

## 🚀 Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm start

# Desenvolvimento com auto-reload
npm run dev

# Verificar se tudo está configurado
npm run check
```

## 🔥 Firebase

```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Login no Firebase
firebase login

# Inicializar projeto Firebase
firebase init

# Servir localmente (simula hosting)
firebase serve
# ou
npm run serve

# Deploy completo
firebase deploy
# ou
npm run deploy

# Deploy apenas hosting
npm run deploy:hosting

# Deploy apenas Firestore rules
npm run deploy:firestore

# Ver logs do Functions (se usar)
firebase functions:log

# Abrir console do Firebase
firebase open
```

## 🧪 Testes e Verificação

```bash
# Verificar configuração do projeto
npm run check

# Testar build (se houver)
npm run build

# Lighthouse (performance)
npm install -g lighthouse
lighthouse https://seu-site.web.app

# Verificar links quebrados
npm install -g broken-link-checker
blc https://seu-site.web.app
```

## 🔧 Manutenção

```bash
# Atualizar dependências
npm update

# Verificar dependências desatualizadas
npm outdated

# Auditar segurança
npm audit

# Corrigir vulnerabilidades
npm audit fix

# Limpar cache do npm
npm cache clean --force

# Reinstalar node_modules
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoramento

```bash
# Ver logs do servidor local
npm start
# Logs aparecem no terminal

# Ver logs do Firebase Functions
firebase functions:log

# Ver logs em tempo real
firebase functions:log --follow

# Ver métricas do Firebase
firebase open hosting
```

## 🐛 Debug e Troubleshooting

```bash
# Verificar portas em uso (macOS/Linux)
lsof -i :3000

# Matar processo na porta
lsof -ti:3000 | xargs kill -9

# Verificar variáveis de ambiente
node -e "require('dotenv').config(); console.log(process.env)"

# Testar conexão OpenAI
node -e "
require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{role: 'user', content: 'teste'}],
  max_tokens: 5
}).then(r => console.log('✅ OpenAI OK')).catch(e => console.log('❌ Erro:', e.message));
"

# Testar Firebase connection
node -e "
require('dotenv').config();
const { db } = require('./firebase-config');
db.collection('test').add({test: true}).then(() => console.log('✅ Firebase OK')).catch(e => console.log('❌ Erro:', e.message));
"
```

## 🔄 Git e Versionamento

```bash
# Status do repositório
git status

# Adicionar arquivos
git add .

# Commit com mensagem
git commit -m "feat: adiciona nova funcionalidade"

# Push para GitHub
git push origin main

# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Voltar para main
git checkout main

# Merge branch
git merge feature/nova-funcionalidade

# Ver histórico
git log --oneline

# Ver diferenças
git diff
```

## 🌐 Deploy e Produção

```bash
# Deploy completo no Firebase
npm run deploy

# Deploy apenas frontend
npm run deploy:hosting

# Verificar deploy
curl -I https://seu-site.web.app

# Rollback (se necessário)
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live

# Ver versões de deploy
firebase hosting:releases
```

## 📱 PWA (Progressive Web App)

```bash
# Gerar service worker (futuro)
npx workbox generateSW workbox-config.js

# Testar PWA
# Use Chrome DevTools → Application → Service Workers
```

## 🔐 Segurança

```bash
# Verificar vulnerabilidades
npm audit

# Verificar chaves expostas (instalar truffleHog)
docker run --rm -v "$PWD:/pwd" trufflesecurity/trufflehog:latest filesystem /pwd

# Verificar regras do Firestore
firebase firestore:rules:get

# Testar regras do Firestore
firebase emulators:start --only firestore
```

## 📈 Performance

```bash
# Analisar bundle size (se usar bundler)
npm install -g webpack-bundle-analyzer

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Verificar Core Web Vitals
# Use PageSpeed Insights: https://pagespeed.web.dev/
```

## 🎯 Comandos Específicos do Projeto

```bash
# Verificar se Firebase está configurado
npm run check

# Setup completo do projeto
npm run setup

# Limpar dados de teste (cuidado!)
# firebase firestore:delete --all-collections --yes
```

## 🆘 Comandos de Emergência

```bash
# Parar todos os processos Node.js
killall node

# Resetar Firebase local
rm -rf .firebase/

# Resetar node_modules
rm -rf node_modules package-lock.json && npm install

# Reverter último commit (cuidado!)
git reset --hard HEAD~1

# Forçar push (muito cuidado!)
git push --force-with-lease origin main
```

---

## 💡 Dicas

- Use `npm run check` sempre que algo não funcionar
- Mantenha as dependências atualizadas
- Faça backup das variáveis de ambiente
- Teste localmente antes de fazer deploy
- Use branches para novas funcionalidades

---

**🌟 Comandos para criar histórias mágicas! ✨**