document.addEventListener('DOMContentLoaded', function() {
  let banco = [];
  let dadosCarregados = false;

  // Elementos DOM
  const buscaInput = document.getElementById('busca');
  const resultadoDiv = document.getElementById('resultado');
  const notification = document.getElementById('notification');

  // Carrega os dados ao iniciar
  carregarDados();

  // Função para carregar dados do JSON
  async function carregarDados() {
    try {
      resultadoDiv.innerHTML = '<div class="result-placeholder">Carregando dados...</div>';
      
      const response = await fetch('dados.json');
      
      if (response.ok) {
        banco = await response.json();
        dadosCarregados = true;
        resultadoDiv.innerHTML = '<div class="result-placeholder">Digite um código ou palavra-chave acima...</div>';
      } else {
        throw new Error('Falha ao carregar dados');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      resultadoDiv.innerHTML = 
        '<div class="result-placeholder">Erro ao carregar os dados. Verifique:<br>1. O arquivo JSON existe<br>2. Está no local correto<br>3. A conexão está ativa</div>';
    }
  }

  // Função de busca
  function buscar() {
    if (!dadosCarregados) {
      resultadoDiv.innerHTML = '<div class="result-placeholder">Dados ainda não carregados. Aguarde...</div>';
      return;
    }
    
    const termo = buscaInput.value.trim().toLowerCase();

    if (!termo) {
      resultadoDiv.innerHTML = '<div class="result-placeholder">Por favor, digite algo para buscar.</div>';
      return;
    }

    const itensEncontrados = banco.filter(item => 
      Object.values(item).some(
        valor => valor && valor.toString().toLowerCase().includes(termo)
      )
    );

    mostrarResultados(itensEncontrados, termo);
  }

  // Mostra os resultados da busca
  function mostrarResultados(itens, termo) {
    if (itens.length > 0) {
      resultadoDiv.innerHTML = itens.map(item => `
        <div class="os-item">
          <div class="os-code">
            <span>Código: ${item.CODIGO}</span>
          </div>
          
          ${criarCampoCopiavel('OS', item.DESCRICAO_OS)}
          ${criarCampoCopiavel('Sub-OS', item.DESCRICAO_SUB_OS)}
          ${criarCampoCopiavel('Serviço', item.SERVICO_REALIZADO)}
        </div>
      `).join('');
    } else {
      resultadoDiv.innerHTML = `<div class="result-placeholder">Nenhum resultado encontrado para "${termo}". Tente outro termo.</div>`;
    }
  }

  // Cria um campo copiável
  function criarCampoCopiavel(titulo, conteudo) {
    return `
      <div class="os-field">
        <div><strong>${titulo}:</strong> ${conteudo}</div>
        <button class="copy-btn" onclick="copiarTexto('${escapeTexto(conteudo)}', '${titulo} copiado!')">
          <span>Copiar</span>
        </button>
      </div>
    `;
  }

  // Escapa texto para uso em HTML/JS
  function escapeTexto(texto) {
    return texto.replace(/'/g, "\\'")
               .replace(/"/g, '\\"')
               .replace(/\n/g, '\\n');
  }

  // Função para copiar textos
  window.copiarTexto = function(texto, mensagem) {
    navigator.clipboard.writeText(texto)
      .then(() => {
        notification.textContent = mensagem;
        notification.style.display = 'block';
        
        setTimeout(() => {
          notification.style.display = 'none';
        }, 2000);
      })
      .catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar texto');
      });
  }

  // Expõe a função de busca para o HTML
  window.buscar = buscar;
});