function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcular() {
  const valor = parseFloat(document.getElementById('valorVenda').value) || 0;
  const prazo = parseFloat(document.getElementById('prazoOriginal').value) || 0;
  const taxa = (parseFloat(document.getElementById('taxaAntecipacao').value) || 0) / 100;

  const custo = valor * taxa * (prazo / 30);
  const liquido = valor - custo;

  document.getElementById('resCusto').textContent = formatarBRL(custo);
  document.getElementById('resLiquido').textContent = formatarBRL(liquido);

  const narrativa = document.getElementById('resultadoNarrativo');
  const pctCusto = valor > 0 ? (custo / valor) * 100 : 0;
  narrativa.innerHTML = `Antecipar <strong>${formatarBRL(valor)}</strong> que só cairiam em ${prazo} dias custa <strong>${formatarBRL(custo)}</strong> (${pctCusto.toFixed(2)}% do valor) — você recebe hoje <span class="ok">${formatarBRL(liquido)}</span> líquidos.`;
}

['valorVenda', 'prazoOriginal', 'taxaAntecipacao'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
