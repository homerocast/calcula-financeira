function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcular() {
  const preco = parseFloat(document.getElementById('precoAcao').value) || 0;
  const dividendo = parseFloat(document.getElementById('dividendoAnual').value) || 0;
  const quantidade = parseFloat(document.getElementById('quantidadeAcoes').value) || 0;

  const narrativa = document.getElementById('resultadoNarrativo');

  if (preco <= 0) {
    document.getElementById('resDY').textContent = '—';
    document.getElementById('resTotalAnual').textContent = '—';
    return;
  }

  const dy = (dividendo / preco) * 100;
  const totalAnual = dividendo * quantidade;

  document.getElementById('resDY').textContent = dy.toFixed(2).replace('.', ',') + '%';
  document.getElementById('resTotalAnual').textContent = quantidade > 0 ? formatarBRL(totalAnual) : '—';

  narrativa.innerHTML = quantidade > 0
    ? `Pagando <strong>${formatarBRL(preco)}</strong> por ação e recebendo <strong>${formatarBRL(dividendo)}</strong> por ano em dividendos, o Dividend Yield é de <span class="ok">${dy.toFixed(2).replace('.', ',')}%</span>. Com ${quantidade} ações, isso equivale a <strong>${formatarBRL(totalAnual)} por ano</strong> em dividendos.`
    : `Pagando <strong>${formatarBRL(preco)}</strong> por ação e recebendo <strong>${formatarBRL(dividendo)}</strong> por ano em dividendos, o Dividend Yield é de <span class="ok">${dy.toFixed(2).replace('.', ',')}%</span>.`;
}

['precoAcao', 'dividendoAnual', 'quantidadeAcoes'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
