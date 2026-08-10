function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function renderizarResultados(termo) {
  const container = document.getElementById('searchResults');
  container.innerHTML = '';

  if (!termo || termo.trim().length < 2) {
    container.innerHTML = '<div class="search-empty">Digite ao menos 2 letras para buscar.</div>';
    return;
  }

  const termoNorm = normalizar(termo.trim());
  const prefixo = typeof SITE_ROOT_PREFIX === 'string' ? SITE_ROOT_PREFIX : '';

  const resultados = SITE_SEARCH_INDEX.filter(item =>
    normalizar(item.title).includes(termoNorm) || normalizar(item.desc).includes(termoNorm)
  ).slice(0, 8);

  if (resultados.length === 0) {
    container.innerHTML = '<div class="search-empty">Nenhum resultado encontrado. Tente outro termo.</div>';
    return;
  }

  resultados.forEach(item => {
    const a = document.createElement('a');
    a.className = 'search-result-item';
    a.href = prefixo + item.url;
    a.innerHTML = `<div class="sr-title">${item.title}</div><div class="sr-desc">${item.desc}</div>`;
    container.appendChild(a);
  });
}

function abrirBusca() {
  const painel = document.getElementById('searchPanel');
  painel.classList.add('open');
  const input = document.getElementById('searchInput');
  input.focus();
  renderizarResultados(input.value);
}

function fecharBusca() {
  document.getElementById('searchPanel').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('searchToggle');
  const painel = document.getElementById('searchPanel');
  const input = document.getElementById('searchInput');
  if (!toggle || !painel || !input) return;

  toggle.addEventListener('click', () => {
    if (painel.classList.contains('open')) fecharBusca(); else abrirBusca();
  });

  input.addEventListener('input', () => renderizarResultados(input.value));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharBusca();
  });

  document.addEventListener('click', e => {
    if (painel.classList.contains('open') && !painel.contains(e.target) && !toggle.contains(e.target)) {
      fecharBusca();
    }
  });
});
