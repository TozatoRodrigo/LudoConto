# 🤝 Contribuindo para o Ludo Conto

Obrigado por considerar contribuir para o Ludo Conto! Este documento explica como você pode ajudar.

## 🌟 Como Contribuir

### 🐛 Reportar Bugs
1. Verifique se o bug já foi reportado nas [Issues](https://github.com/TozatoRodrigo/LudoConto/issues)
2. Se não, crie uma nova issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Informações do ambiente (browser, OS, etc.)

### 💡 Sugerir Funcionalidades
1. Abra uma issue com o label "enhancement"
2. Descreva a funcionalidade desejada
3. Explique por que seria útil
4. Forneça exemplos de uso

### 🔧 Contribuir com Código

#### Configuração do Ambiente
```bash
# 1. Fork o repositório
# 2. Clone seu fork
git clone https://github.com/SEU_USERNAME/LudoConto.git
cd LudoConto

# 3. Instale dependências
npm install

# 4. Configure ambiente (veja QUICKSTART.md)
cp .env.example .env
# Edite .env com suas chaves

# 5. Teste localmente
npm start
```

#### Processo de Desenvolvimento
1. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/nome-da-feature
   ```

2. **Faça suas alterações** seguindo os padrões:
   - Código limpo e comentado
   - Nomes de variáveis descritivos
   - Funções pequenas e focadas

3. **Teste suas alterações**:
   ```bash
   npm start
   # Teste todas as funcionalidades
   ```

4. **Commit suas mudanças**:
   ```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade X"
   ```

5. **Push para seu fork**:
   ```bash
   git push origin feature/nome-da-feature
   ```

6. **Abra um Pull Request**:
   - Título claro e descritivo
   - Descrição detalhada das mudanças
   - Screenshots (se aplicável)
   - Referência a issues relacionadas

## 📝 Padrões de Código

### JavaScript
- Use `const` e `let` ao invés de `var`
- Nomes de funções em camelCase
- Comentários em português
- Indentação com 2 espaços

```javascript
// ✅ Bom
const gerarHistoria = async (dados) => {
  // Validar dados de entrada
  if (!dados.nome) {
    throw new Error('Nome é obrigatório');
  }
  
  return await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }]
  });
};

// ❌ Evitar
var gerar_historia = function(dados) {
  return openai.chat.completions.create({model:'gpt-3.5-turbo',messages:[{role:'user',content:prompt}]});
}
```

### CSS
- Use classes semânticas
- Mobile-first (responsividade)
- Variáveis CSS para cores
- Comentários para seções

```css
/* ✅ Bom */
.historia-container {
  background: var(--cor-fundo);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .historia-container {
    padding: 1rem;
  }
}
```

### HTML
- Semântica correta
- Acessibilidade (alt, aria-labels)
- Indentação consistente

```html
<!-- ✅ Bom -->
<form id="historia-form" class="form-container" role="form">
  <label for="nome">Nome da criança *</label>
  <input 
    type="text" 
    id="nome" 
    name="nome" 
    required 
    aria-describedby="nome-help"
    placeholder="Digite o nome da criança"
  >
</form>
```

## 🧪 Testes

### Testes Manuais
Antes de submeter um PR, teste:
- ✅ Cadastro de usuário
- ✅ Login/logout
- ✅ Geração de história
- ✅ Responsividade mobile
- ✅ Diferentes navegadores

### Testes Automatizados (Futuro)
Planejamos implementar:
- Testes unitários (Jest)
- Testes de integração
- Testes E2E (Cypress)

## 🏷️ Convenções de Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: adiciona funcionalidade de favoritar histórias
fix: corrige erro de autenticação no Safari
docs: atualiza guia de instalação
style: melhora responsividade do formulário
refactor: reorganiza código de autenticação
test: adiciona testes para geração de histórias
chore: atualiza dependências
```

## 🎯 Áreas que Precisam de Ajuda

### 🔧 Funcionalidades
- [ ] Correção do "Minhas Histórias"
- [ ] Sistema de favoritos
- [ ] Compartilhamento social
- [ ] PWA (Progressive Web App)
- [ ] Modo escuro
- [ ] Múltiplos idiomas

### 🎨 Design/UX
- [ ] Ilustrações para histórias
- [ ] Animações CSS
- [ ] Melhoria da responsividade
- [ ] Acessibilidade (WCAG)

### 🧪 Qualidade
- [ ] Testes automatizados
- [ ] Documentação de API
- [ ] Performance optimization
- [ ] SEO improvements

### 📚 Documentação
- [ ] Tutoriais em vídeo
- [ ] Exemplos de uso
- [ ] FAQ
- [ ] Tradução para inglês

## 🏆 Reconhecimento

Todos os contribuidores serão:
- Listados no README
- Mencionados nas release notes
- Convidados para o Discord da comunidade (futuro)

## 📞 Dúvidas?

- 💬 **Discussões**: [GitHub Discussions](https://github.com/TozatoRodrigo/LudoConto/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/TozatoRodrigo/LudoConto/issues)
- 📧 **Email**: [contato@ludoconto.com] (futuro)

## 📜 Código de Conduta

Este projeto segue o [Contributor Covenant](https://www.contributor-covenant.org/). Seja respeitoso e inclusivo.

---

**🌟 Obrigado por ajudar a criar histórias mágicas! ✨**