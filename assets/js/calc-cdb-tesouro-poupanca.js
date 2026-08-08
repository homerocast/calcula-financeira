function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function aliquotaIR(dias) {
  if (dias <= 180) return 0.225;
  if (dias <= 360) return 0.20;
  if (dias <= 720) return 0.175;
  return 0.15;
}

function calcular() {
  const valor = parseFloat(document.getElementById('valor').value) || 0;
  const dias = parseFloat(document.getElementById('prazoDias').value) || 0;
  const taxaCDI = (parseFloat(document.getElementById('taxaCDI').value) || 0) / 100;
  const percCDB = (parseFloat(document.getElementById('percentualCDB').value) || 0) / 100;
  const taxaSelic = (parseFloat(document.getElementById('taxaSelic').value) || 0) / 100;
  const taxaCustodia = (parseFloat(document.getElementById('taxaCustodia').value) || 0) / 100;

  const anos = dias / 365;
  const aliq = aliquotaIR(dias);

  // --- CDB ---
  const taxaCDBAnual = taxaCDI * percCDB;
  const brutoCDB = valor * (Math.pow(1 + taxaCDBAnual, anos) - 1);
  const liquidoCDB = brutoCDB * (1 - aliq);

  // --- Tesouro Selic ---
  const brutoTesouro = valor * (Math.pow(1 + taxaSelic, anos) - 1);
  const custodia = valor * taxaCustodia * anos;
  const liquidoTesouro = brutoTesouro * (1 - aliq) - custodia;

  // --- Poupança ---
  const taxaSelicAnualPct = taxaSelic * 100;
  const taxaMensalPoupanca = taxaSelicAnualPct > 8.5 ? 0.005 : (0.70 * taxaSelic / 12);
  const meses = dias / 30;
  const liquidoPoupanca = valor * (Math.pow(1 + taxaMensalPoupanca, meses) - 1);

  document.getElementById('resCDB').textContent = formatarBRL(liquidoCDB);
  document.getElementById('resTesouro').textContent = formatarBRL(liquidoTesouro);
  document.getElementById('resPoupanca').textContent = formatarBRL(liquidoPoupanca);

  const opcoes = [
    { nome: 'CDB', valor: liquidoCDB },
    { nome: 'Tesouro Selic', valor: liquidoTesouro },
    { nome: 'Poupança', valor: liquidoPoupanca }
  ];
  const melhor = opcoes.reduce((a, b) => (b.valor > a.valor ? b : a));
  document.getElementById('resMelhor').textContent = melhor.nome;

  desenharGrafico(opcoes, melhor.nome);
}

let grafico = null;

function desenharGrafico(opcoes, nomeMelhor) {
  const ctx = document.getElementById('graficoComparativo').getContext('2d');
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: opcoes.map(o => o.nome),
      datasets: [{
        data: opcoes.map(o => o.valor),
        backgroundColor: opcoes.map(o => o.nome === nomeMelhor ? '#2F7A56' : '#C7BFA6'),
        borderRadius: 4,
        maxBarThickness: 70
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => formatarBRL(ctx.parsed.y) } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'IBM Plex Sans', size: 11 }, color: '#5B6472' } },
        y: {
          grid: { color: '#F4F1E9' },
          ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#5B6472', callback: v => formatarBRL(v) }
        }
      }
    }
  });
}

['valor','prazoDias','taxaCDI','percentualCDB','taxaSelic','taxaCustodia'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
calcular();
