function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const TAXAS_PADRAO = { rotativo: 15, chequeEspecial: 8 };

function ajustarTaxaPadrao() {
  const tipo = document.getElementById('tipoDivida').value;
  const campoTaxa = document.getElementById('taxaMensal');
  if (tipo !== 'personalizado' && TAXAS_PADRAO[tipo] !== undefined) {
    campoTaxa.value = TAXAS_PADRAO[tipo];
  }
}

let grafico = null;

function calcular() {
  const divida = parseFloat(document.getElementById('valorDivida').value) || 0;
  const taxa = (parseFloat(document.getElementById('taxaMensal').value) || 0) / 100;
  const meses = parseInt(document.getElementById('mesesProjecao').value) || 0;

  const dividaFinal = divida * Math.pow(1 + taxa, meses);
  const juros = dividaFinal - divida;

  document.getElementById('resDividaInicial').textContent = formatarBRL(divida);
  document.getElementById('resDividaFinal').textContent = formatarBRL(dividaFinal);
  document.getElementById('resJurosAcumulados').textContent = formatarBRL(juros);

  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML = `Uma dívida de <strong>${formatarBRL(divida)}</strong> a ${(taxa * 100).toFixed(1)}% ao mês, sem nenhum pagamento, vira <span class="alerta">${formatarBRL(dividaFinal)}</span> em ${meses} meses — só de juros, você teria pago <strong>${formatarBRL(juros)}</strong>, mais do que a dívida original.`;

  desenharGrafico(divida, taxa, meses);
}

function desenharGrafico(divida, taxa, meses) {
  const pontos = [];
  for (let m = 0; m <= meses; m++) pontos.push(m);
  const valores = pontos.map(m => divida * Math.pow(1 + taxa, m));
  const labels = pontos.map(m => m === 0 ? 'hoje' : 'mês ' + m);

  const ctx = document.getElementById('graficoRotativo').getContext('2d');
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Dívida', data: valores,
        borderColor: '#B23A2E', backgroundColor: 'rgba(178, 58, 46, 0.14)',
        fill: true, pointRadius: 0, borderWidth: 2.2, tension: 0.2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.4,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => formatarBRL(ctx.parsed.y) } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#5B6472' } },
        y: { grid: { color: '#F4F1E9' }, ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#5B6472', callback: v => (v / 1000).toFixed(1) + 'k' } }
      }
    }
  });
}

document.getElementById('tipoDivida').addEventListener('change', () => { ajustarTaxaPadrao(); calcular(); });
['valorDivida', 'taxaMensal', 'mesesProjecao'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
