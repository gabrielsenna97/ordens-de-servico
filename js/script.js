async function carregarDados() {
  try {
    // Tenta carregar o arquivo JSON
    const response = await fetch('dados.json');
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    // Verifica se o conteúdo é JSON válido
    const text = await response.text();
    const dados = JSON.parse(text);
    
    // Validação da estrutura
    if (!Array.isArray(dados)) {
      throw new Error("O JSON não contém um array válido");
    }
    
    if (dados.length === 0) {
      throw new Error("O arquivo JSON está vazio");
    }
    
    if (!dados[0].CODIGO || !dados[0].DESCRICAO_OS) {
      throw new Error("Estrutura do JSON inválida");
    }
    
    banco = dados;
    dadosCarregados = true;
    mostrarStatus(`Dados carregados com sucesso! ${banco.length} ordens disponíveis.`);
    
  } catch (error) {
    console.error("Erro ao carregar JSON:", error);
    
    // Fallback com dados incorporados
    banco = [
      {
        "CODIGO": "F001",
        "DESCRICAO_OS": "TROCA DE FILTROS",
        "DESCRICAO_SUB_OS": "MAQUINA APRESENTANDO BAIXA PRESSÃO",
        "SERVICO_REALIZADO": "Serviço realizado com sucesso"
      }
      // Adicione mais itens se necessário
    ];
    
    dadosCarregados = true;
    mostrarStatus(`Usando dados locais (${banco.length} ordens). Erro: ${error.message}`, 'warning');
  }
}
