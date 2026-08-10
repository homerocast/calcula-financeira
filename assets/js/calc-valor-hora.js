function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcular() {
  const rendaDesejada = parseFloat(document.getElementById('rendaDesejada').value) || 0;
  const despesasFixas = parseFloat(document.getElementById('despesasFixas').value) || 0;
  const horasDia = parseFloat(document.getElementById('horasDia').value) || 0;
  const diasSemana = parseFloat(document.getElementById('diasSemana').value) || 0;
  const pctNaoFaturavel = (parseFloat(document.getElementById('pctNaoFaturavel').value) || 0) / 100;
  const pctReserva = (parseFloat(document.getElementById('pctReserva').value) || 0) / 100;

  const horasMensaisBrutas = horasDia * diasSemana * 4.33;
  const horasFaturaveis = horasMensaisBrutas * (1 - pctNaoFaturavel);
  const necessidadeLiquida = rendaDesejada + despesasFixas;
  const faturamentoBruto = pctReserva < 1 ? necessidadeLiquida / (1 - pctReserva) : necessidadeLiquida;
  const valorHora = horasFaturaveis > 0 ? faturamentoBruto / horasFaturaveis : 0;

  document.getElementById('resHoras').textContent = horasFaturaveis.toFixed(1) + 'h';
  document.getElementById('resFaturamento').textContent = formatarBRL(faturamentoBruto);
  document.getElementById('resValorHora').textContent = formatarBRL(valorHora);

  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML = `Para sobrar <strong>${formatarBRL(rendaDesejada)} líquidos</strong> por mês, cobrindo despesas fixas e reservando ${(pctReserva * 100).toFixed(0)}% para impostos e período sem trabalho, você precisa faturar <strong>${formatarBRL(faturamentoBruto)}</strong> — o que dá um valor mínimo de <span class="ok">${formatarBRL(valorHora)} por hora</span>, considerando ${horasFaturaveis.toFixed(1)}h faturáveis por mês.`;
}

['rendaDesejada', 'despesasFixas', 'horasDia', 'diasSemana', 'pctNaoFaturavel', 'pctReserva'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
