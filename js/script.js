// Configuração inicial
document.addEventListener('DOMContentLoaded', function() {
  // Elementos da DOM
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const resultsContainer = document.getElementById('resultsContainer');
  const notification = document.getElementById('notification');
  
  // Dados (pode ser substituído por fetch para dados.json)
  let database = [];
  
  // Carregar dados (substitua por fetch real se necessário)
  function loadData() {
    // Simulando carregamento de dados.json
    database = [
      {
        "CODIGO": "F003",
        "DESCRICAO_OS": "Bucha",
        "DESCRICAO_SUB_OS": "Inspeção de juntas e mangueiras",
        "SERVICO_REALIZADO": "Troca da junta do cárter e limpeza da área"
      },
      {
        "CODIGO": "F008",
        "DESCRICAO_OS": "Troca de bicos injetores",
        "DESCRICAO_SUB_OS": "Alto consumo de combustível (0.265L/H)",
        "SERVICO_REALIZADO": "Substituição dos bicos injetores e kit de vedação"
      }
    ];
  }
  
  // Função de busca
  function search() {
    const term = normalizeString(searchInput.value.trim());
    
    if (!term) {
      showNotification('Digite um termo para buscar', 'alerta');
      return;
    }

    const results = database.filter(item => 
      normalizeString(item.CODIGO).includes(term) ||
      normalizeString(item.DESCRICAO_OS).includes(term) ||
      (item.DESCRICAO_SUB_OS && normalizeString(item.DESCRICAO_SUB_OS).includes(term)) ||
      (item.SERVICO_REALIZADO && normalizeString(item.SERVICO_REALIZADO).includes(term))
    );

    displayResults(results);
  }
  
  // Mostrar resultados
  function displayResults(results) {
    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="result-item"><p>Nenhum resultado encontrado</p></div>';
      return;
    }

    resultsContainer.innerHTML = results.map(item => `
      <div class="result-item">
        <h3>Código: ${item.CODIGO}</h3>
        <p><strong>OS:</strong> ${item.DESCRICAO_OS} 
          <button class="copy-btn" data-text="${escapeHtml(item.DESCRICAO_OS)}">Copiar</button>
        </p>
        ${item.DESCRICAO_SUB_OS ? `
        <p><strong>Sub-OS:</strong> ${item.DESCRICAO_SUB_OS}
          <button class="copy-btn" data-text="${escapeHtml(item.DESCRICAO_SUB_OS)}">Copiar</button>
        </p>` : ''}
        ${item.SERVICO_REALIZADO ? `
        <p><strong>Serviço:</strong> ${item.SERVICO_REALIZADO}
          <button class="copy-btn" data-text="${escapeHtml(item.SERVICO_REALIZADO)}">Copiar</button>
        </p>` : ''}
      </div>
    `).join('');
    
    // Adiciona eventos aos botões de cópia
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        copyToClipboard(this.getAttribute('data-text'));
      });
    });
  }
  
  // Utilitários
  function normalizeString(str) {
    return str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  }
  
  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        showNotification('Texto copiado!');
      })
      .catch(err => {
        console.error('Erro ao copiar:', err);
        showNotification('Erro ao copiar texto', 'erro');
      });
  }
  
  function showNotification(message, type = 'sucesso') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 2000);
  }
  
  // Event Listeners
  searchButton.addEventListener('click', search);
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') search();
  });
  
  // Inicialização
  loadData();
});
