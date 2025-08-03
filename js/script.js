document.addEventListener('DOMContentLoaded', function() {
  // Variáveis globais
  let banco = [];
  let dadosCarregados = false;
  const buscaInput = document.getElementById('busca');
  const resultadoDiv = document.getElementById('resultado');
  const notification = document.getElementById('notification');

  // Carrega os dados ao iniciar
  carregarDados();

  // Função melhorada para carregar dados
  async function carregarDados() {
    try {
      mostrarStatus('Carregando dados...');
      
      const response = await fetch('dados.json');
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      banco = await response.json();
      
      // Validação básica dos dados
      if (!Array.isArray(banco)) {
        throw new Error('Formato inválido: esperado um array no JSON');
      }
      
      dadosCarregados = true;
      mostrarStatus('Digite um código ou palavra-chave acima...');
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      mostrarStatus(`
        Erro ao carregar dados. Verifique:<br>
        1. Se o arquivo <strong>dados.json</strong> existe<br>
        2. Se o formato do JSON está correto<br>
        3. Se o servidor está acessível
      `, 'erro');
    }
  }

  // Função de busca otimizada
  function buscar() {
    if (!validarDadosCarregados()) return;
    
    const termo = normalizarTermo(buscaInput.value);
    if (!validarTermo(termo)) return;

    const itensEncontrados = filtrarResultados(termo);
    mostrarResultados(itensEncontrados, termo);
  }

  // Funções auxiliares
  function mostrarStatus(mensagem, tipo = 'info') {
    resultadoDiv.innerHTML = `<div class="result-placeholder ${tipo}">${mensagem}</div>`;
  }

  function validarDadosCarregados() {
    if (!dadosCarregados) {
      mostrarStatus('Dados ainda não carregados. Aguarde...', 'alerta');
      return false;
    }
    return true;
  }

  function normalizarTermo(termo) {
    return termo.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  }

  function validarTermo(termo) {
    if (!termo) {
      mostrarStatus('Por favor, digite algo para buscar.', 'alerta');
      return false;
    }
    return true;
  }

  function filtrarResultados(termo) {
    return banco.filter(item => 
      Object.values(item).some(valor => 
        valor && normalizarTermo(valor.toString()).includes(termo)
    );
  }

  function mostrarResultados(itens, termo) {
    if (itens.length === 0) {
      mostrarStatus(`Nenhum resultado para "${termo}". Tente: F083, F088 ou termos relacionados`, 'alerta');
      return;
    }

    resultadoDiv.innerHTML = itens.map(item => `
      <div class="os-item">
        <div class="os-code">
          <span>Código: ${item.CODIGO || 'N/A'}</span>
        </div>
        ${criarCampoCopiavel('OS', item.DESCRICAO_OS)}
        ${item.DESCRICAO_SUB_OS ? criarCampoCopiavel('Sub-OS', item.DESCRICAO_SUB_OS) : ''}
        ${item.SERVICO_REALIZADO ? criarCampoCopiavel('Serviço', item.SERVICO_REALIZADO) : ''}
      </div>
    `).join('');
  }

  function criarCampoCopiavel(titulo, conteudo) {
    if (!conteudo) return '';
    return `
      <div class="os-field">
        <div><strong>${titulo}:</strong> ${conteudo}</div>
        <button class="copy-btn" onclick="copiarTexto('${escapeTexto(conteudo)}', '${titulo} copiado!')">
          Copiar
        </button>
      </div>
    `;
  }

  function escapeTexto(texto) {
    return texto ? texto.toString()
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n') : '';
  }

  // Função global para copiar texto
  window.copiarTexto = function(texto, mensagem) {
    if (!texto) return;
    
    navigator.clipboard.writeText(texto)
      .then(() => {
        notification.textContent = mensagem;
        notification.className = 'notification sucesso';
        notification.style.display = 'block';
        
        setTimeout(() => {
          notification.style.display = 'none';
        }, 2000);
      })
      .catch(err => {
        console.error('Erro ao copiar:', err);
        notification.textContent = 'Erro ao copiar texto';
        notification.className = 'notification erro';
        notification.style.display = 'block';
        setTimeout(() => { notification.style.display = 'none'; }, 2000);
      });
  }

  // Expõe a função de busca
  window.buscar = buscar;

  // Event listener para tecla Enter
  buscaInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') buscar();
  });
});
