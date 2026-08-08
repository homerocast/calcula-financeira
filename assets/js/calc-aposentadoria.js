function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

let grafico = null;

function calcular() {
  const idadeAtual = parseFloat(document.getElementById('idadeAtual').value) || 0;
  const idadeAposentadoria = parseFloat(document.getElementById('idadeAposentadoria').value) || 0;
  const rendaMensal = parseFloat(document.getElementById('rendaMensal').value) || 0;
  const pctInvestido = (parseFloat(document.getElementById('percentualInvestido').value) || 0) / 100;
  const patrimonioAtual = parseFloat(document.getElementById('patrimonioAtual').value) || 0;
  const taxaAnual = (parseFloat(document.getElementById('taxaRetorno').value) || 0) / 100;
  const gastoMensal = parseFloat(document.getElementById('gastoMensal').value) || 0;

  const i = Math.pow(1 + taxaAnual, 1 / 12) - 1;
  const aporteMensal = rendaMensal * pctInvestido;
  const nMeses = Math.max(0, (idadeAposentadoria - idadeAtual) * 12);

  const fator = Math.pow(1 + i, nMeses);
  const patrimonioAoAposentar = patrimonioAtual * fator + (i === 0 ? aporteMensal * nMeses : aporteMensal * ((fator - 1) / i));

  document.getElementById('statAporte').textContent = formatarBRL(aporteMensal) + '/mês';
  document.getElementById('statPatrimonio').textContent = formatarBRL(patrimonioAoAposentar);

  const rendaSustentavel = patrimonioAoAposentar * i;

  if (rendaSustentavel >= gastoMensal) {
    document.getElementById('resultadoTag').textContent = 'SUSTENTÁVEL';
    document.getElementById('resLabel').textContent = 'Sobra por mês, vivendo só dos juros';
    document.getElementById('resValor').textContent = formatarBRL(rendaSustentavel - gastoMensal) + '/mês';
  } else {
    // Fórmula de esgotamento: n = ln(W / (W - P*i)) / ln(1+i)
    const P = patrimonioAoAposentar, W = gastoMensal;
    let mesesDuracao = Infinity;
    if (W > P * i && P > 0) {
      mesesDuracao = Math.log(W / (W - P * i)) / Math.log(1 + i);
    }
    document.getElementById('resultadoTag').textContent = 'ATENÇÃO';
    document.getElementById('resLabel').textContent = 'Patrimônio dura aproximadamente';
    if (isFinite(mesesDuracao)) {
      const anos = Math.floor(mesesDuracao / 12);
      const meses = Math.round(mesesDuracao % 12);
      document.getElementById('resValor').textContent = anos + ' anos e ' + meses + ' meses';
    } else {
      document.getElementById('resValor').textContent = 'patrimônio insuficiente';
    }
  }

  desenharGrafico(patrimonioAtual, aporteMensal, i, Math.ceil(nMeses));
}

function desenharGrafico(PV, A, i, nMeses) {
  const n = Math.max(nMeses, 1);
  const passo = n > 120 ? 24 : (n > 48 ? 12 : (n > 12 ? 3 : 1));
  const pontos = [];
  for (let m = 0; m <= n; m += passo) pontos.push(m);
  if (pontos[pontos.length - 1] !== n) pontos.push(n);

  const valores = pontos.map(m => PV * Math.pow(1 + i, m) + (i === 0 ? A * m : A * ((Math.pow(1 + i, m) - 1) / i)));
  const labels = pontos.map(m => (m % 12 === 0) ? (m / 12) + 'a' : m + 'm');

  const ctx = document.getElementById('graficoAposentadoria').getContext('2d');
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Patrimônio', data: valores,
        borderColor: '#C9963E', backgroundColor: 'rgba(201, 150, 62, 0.16)',
        fill: true, pointRadius: 0, borderWidth: 2.2, tension: 0.2
      }]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => formatarBRL(ctx.parsed.y) } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#5B6472' } },
        y: { grid: { color: '#F4F1E9' }, ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#5B6472', callback: v => (v / 1000).toFixed(0) + 'k' } }
      }
    }
  });
}

['idadeAtual', 'idadeAposentadoria', 'rendaMensal', 'percentualInvestido', 'patrimonioAtual', 'taxaRetorno', 'gastoMensal'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
calcular();
