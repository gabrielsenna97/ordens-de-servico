document.addEventListener('DOMContentLoaded', function() {
  // Elementos da DOM
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const resultsContainer = document.getElementById('resultsContainer');
  const notification = document.getElementById('notification');
  
  // Banco de dados (será carregado do JSON)
  let database = [];
  
  // Carregar dados do JSON
  async function loadData() {
    try {
      showNotification('Carregando dados...', 'info');
      const response = await fetch('dados.json');
      
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      
      database = await response.json();
      
      // Verifica se os dados estão no formato correto
      if (!Array.isArray(database)) {
        throw new Error('Formato inválido: esperado um array no JSON');
      }
      
      showNotification('Dados carregados com sucesso!', 'sucesso');
      setTimeout(() => { notification.style.display = 'none'; }, 2000);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showNotification(`
        Erro ao carregar dados. Verifique:<br>
        1. Se o arquivo <strong>dados.json</strong> existe<br>
        2. Se o formato do JSON está correto
      `, 'erro');
    }
  }
  
  // Função principal de busca inteligente
  function intelligentSearch(term) {
    term = term.trim();
    if (!term) return [];
    
    const normalizedTerm = normalizeTerm(term);
    
    return database.filter(item => {
      // 1. Busca por código com variações automáticas
      if (matchCodeVariations(item.CODIGO, normalizedTerm)) return true;
      
      // 2. Busca textual nos campos principais
      if (matchTextFields(item, normalizedTerm)) return true;
      
      // 3. Busca por sinônimos e termos relacionados
      if (matchRelatedTerms(item, normalizedTerm)) return true;
      
      return false;
    });
  }
  
  // 1. Comparador de códigos com variações automáticas
  function matchCodeVariations(itemCode, searchTerm) {
    const codeVariations = generateCodeVariations(itemCode);
    return codeVariations.some(variation => 
      normalizeTerm(variation) === searchTerm
    );
  }
  
  // Gera variações comuns de códigos
  function generateCodeVariations(code) {
    const variations = [code];
    
    // Adiciona variações sem prefixo
    if (code.startsWith('F')) {
      variations.push(code.substring(1));
    }
    
    // Adiciona variações sem zeros à esquerda
    const numericPart = code.replace(/^\D+/g, '');
    if (numericPart !== code) {
      variations.push(numericPart);
      variations.push('F' + numericPart);
    }
    
    // Adiciona variações com hífen
    if (!code.includes('-')) {
      variations.push(code.replace(/([A-Z])(\d)/, '$1-$2'));
    }
    
    return [...new Set(variations)]; // Remove duplicatas
  }
  
  // 2. Busca textual nos campos
  function matchTextFields(item, normalizedTerm) {
    const fieldsToSearch = [
      item.DESCRICAO_OS,
      item.DESCRICAO_SUB_OS,
      item.SERVICO_REALIZADO
    ];
    
    return fieldsToSearch.some(field => 
      field && normalizeTerm(field).includes(normalizedTerm)
    );
  }
  
  // 3. Busca por termos relacionados
  function matchRelatedTerms(item, normalizedTerm) {
    const relatedTerms = {
      'bucha': ['junta', 'acoplamento', 'anel elastico'],
      'oleo': ['lubrificante', 'fluido'],
      'filtro': ['elemento filtrante', 'cartucho']
    };
    
    // Verifica se o termo de busca é um sinônimo conhecido
    for (const [mainTerm, synonyms] of Object.entries(relatedTerms)) {
      if (normalizedTerm === normalizeTerm(mainTerm) || 
          synonyms.some(syn => normalizeTerm(syn) === normalizedTerm)) {
        return matchTextFields(item, normalizeTerm(mainTerm));
      }
    }
    
    // Busca por correspondência parcial (ex: "elast" → "elástico")
    const allText = `${item.DESCRICAO_OS} ${item.DESCRICAO_SUB_OS}`.toLowerCase();
    return allText.includes(normalizedTerm);
  }
  
  // Normaliza termos para comparação
  function normalizeTerm(term) {
    return term.toString()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9]/g, ''); // Remove caracteres especiais
  }
  
  // Exibe os resultados na tela
  function displayResults(results) {
    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="result-item">
          <p>Nenhum resultado encontrado. Tente:</p>
          <ul>
            <li>Usar termos mais genéricos</li>
            <li>Verificar a ortografia</li>
            <li>Procurar por código (ex: "03" ou "F003")</li>
          </ul>
        </div>
      `;
      return;
    }
    
    resultsContainer.innerHTML = results.map(item => `
      <div class="result-item">
        <h3>Código: ${item.CODIGO}</h3>
        
        <div class="result-field">
          <div><strong>OS:</strong> ${item.DESCRICAO_OS || 'Não especificado'}</div>
          <button class="copy-btn" data-text="${escapeHtml(item.DESCRICAO_OS || '')}">Copiar</button>
        </div>
        
        ${item.DESCRICAO_SUB_OS ? `
        <div class="result-field">
          <div><strong>Sub-OS:</strong> ${item.DESCRICAO_SUB_OS}</div>
          <button class="copy-btn" data-text="${escapeHtml(item.DESCRICAO_SUB_OS)}">Copiar</button>
        </div>` : ''}
        
        ${item.SERVICO_REALIZADO ? `
        <div class="result-field">
          <div><strong>Serviço:</strong> ${item.SERVICO_REALIZADO}</div>
          <button class="copy-btn" data-text="${escapeHtml(item.SERVICO_REALIZADO)}">Copiar</button>
        </div>` : ''}
      </div>
    `).join('');
    
    // Adiciona eventos aos botões de cópia
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const textToCopy = this.getAttribute('data-text');
        copyToClipboard(textToCopy, 'Texto copiado para a área de transferência!');
      });
    });
  }
  
  // Função para copiar texto
  function copyToClipboard(text, message) {
    navigator.clipboard.writeText(text)
      .then(() => {
        showNotification(message, 'sucesso');
      })
      .catch(err => {
        console.error('Erro ao copiar:', err);
        showNotification('Erro ao copiar texto', 'erro');
      });
  }
  
  // Mostra notificação
  function showNotification(message, type = 'info') {
    notification.innerHTML = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
  
  // Escapa HTML para segurança
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Event Listeners
  searchButton.addEventListener('click', () => {
    const results = intelligentSearch(searchInput.value);
    displayResults(results);
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const results = intelligentSearch(searchInput.value);
      displayResults(results);
    }
  });
  
  // Inicialização
  loadData();
});
