function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcular() {
  const tarifaAtual = parseFloat(document.getElementById('tarifaAtual').value) || 0;
  const tarifaNova = parseFloat(document.getElementById('tarifaNova').value) || 0;
  const meses = parseInt(document.getElementById('horizonteMeses').value) || 0;
  const taxaAnual = (parseFloat(document.getElementById('taxaInvestimento').value) || 0) / 100;

  const economiaMensal = Math.max(0, tarifaAtual - tarifaNova);
  const economiaSimples = economiaMensal * meses;

  const i = Math.pow(1 + taxaAnual, 1 / 12) - 1;
  const economiaInvestida = i === 0 ? economiaSimples : economiaMensal * ((Math.pow(1 + i, meses) - 1) / i);

  document.getElementById('resEconomiaSimples').textContent = formatarBRL(economiaSimples);
  document.getElementById('resEconomiaInvestida').textContent = formatarBRL(economiaInvestida);

  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML = economiaMensal > 0
    ? `Economizando <strong>${formatarBRL(economiaMensal)} por mês</strong> em tarifas, em ${meses} meses você guarda <strong>${formatarBRL(economiaSimples)}</strong> — e se investir essa diferença todo mês, o total sobe para <span class="ok">${formatarBRL(economiaInvestida)}</span>.`
    : `Com essas tarifas, não há economia mensal — o banco atual já cobra o mesmo ou menos que o novo.`;
}

['tarifaAtual', 'tarifaNova', 'horizonteMeses', 'taxaInvestimento'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
