// Configuração temporária - apenas frontend
window.TEMP_MODE = true;

// Simular geração de história (temporário)
window.gerarHistoriaTemp = function(dados) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const historia = `
# A Aventura de ${dados.nome}

Era uma vez uma criança muito especial chamada ${dados.nome}, que tinha ${dados.idade} anos e adorava ${dados.preferencias}.

Um dia, ${dados.nome} descobriu que tinha um poder mágico muito especial: a capacidade de ${dados.valor}. 

Durante sua jornada, ${dados.nome} enfrentou desafios, mas sempre lembrava da importância de ${dados.valor}.

No final, ${dados.nome} aprendeu que ${dados.valor} é uma das qualidades mais importantes que uma pessoa pode ter.

E assim, ${dados.nome} viveu feliz para sempre, sendo um exemplo de ${dados.valor} para todos ao seu redor.

**Fim**

*Esta é uma história temporária. Em breve teremos histórias personalizadas com IA!*
      `;
      resolve({ historia });
    }, 2000);
  });
};

console.log('🎭 Modo temporário ativado - Histórias simuladas');