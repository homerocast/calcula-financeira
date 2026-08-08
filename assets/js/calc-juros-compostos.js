function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

let grafico = null;

function gerarSerieMensal(P, A, i, n) {
  const investido = [P];
  const juros = [0];
  let saldo = P;
  let totalInvestido = P;
  let totalJuros = 0;
  for (let mes = 1; mes <= n; mes++) {
    const jurosDoMes = saldo * i;
    saldo += jurosDoMes + A;
    totalInvestido += A;
    totalJuros += jurosDoMes;
    investido.push(totalInvestido);
    juros.push(totalJuros);
  }
  return { investido, juros };
}

function desenharGrafico(serie, n) {
  const passo = n > 60 ? 12 : (n > 24 ? 3 : 1);
  const labels = serie.investido.map((_, idx) => idx).filter(idx => idx % passo === 0 || idx === n);
  const investidoPts = labels.map(idx => serie.investido[idx]);
  const jurosPts = labels.map(idx => serie.juros[idx]);
  const labelsTexto = labels.map(idx => idx === 0 ? 'início' : 'mês ' + idx);

  const ctx = document.getElementById('graficoJuros').getContext('2d');
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labelsTexto,
      datasets: [
        {
          label: 'Valor investido',
          data: investidoPts,
          borderColor: '#C9963E',
          backgroundColor: 'rgba(201, 150, 62, 0.18)',
          fill: true,
          tension: 0.25,
          pointRadius: 0,
          borderWidth: 2
        },
        {
          label: 'Juros acumulados',
          data: jurosPts,
          borderColor: '#2F7A56',
          backgroundColor: 'rgba(47, 122, 86, 0.22)',
          fill: true,
          tension: 0.25,
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.4,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + formatarBRL(ctx.parsed.y)
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#5B6472' } },
        y: {
          stacked: true,
          grid: { color: '#F4F1E9' },
          ticks: {
            font: { family: 'IBM Plex Mono', size: 10 }, color: '#5B6472',
            callback: v => (v / 1000) + 'k'
          }
        }
      }
    }
  });
}

function popularTabelaAnual(P, A, i, n) {
  const corpo = document.getElementById('corpoTabelaAnual');
  if (!corpo) return;
  corpo.innerHTML = '';

  const totalAnos = Math.ceil(n / 12);
  let investidoAnterior = P, jurosAnterior = 0;

  for (let ano = 1; ano <= totalAnos; ano++) {
    const mesFim = Math.min(ano * 12, n);
    const serieAteAqui = gerarSerieMensal(P, A, i, mesFim);
    const investidoAtual = serieAteAqui.investido[serieAteAqui.investido.length - 1];
    const jurosAtual = serieAteAqui.juros[serieAteAqui.juros.length - 1];
    const saldoAcumulado = investidoAtual + jurosAtual;

    const investidoPeriodo = investidoAtual - investidoAnterior;
    const jurosPeriodo = jurosAtual - jurosAnterior;

    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${ano}</td><td>${formatarBRL(investidoPeriodo)}</td><td>${formatarBRL(jurosPeriodo)}</td><td>${formatarBRL(saldoAcumulado)}</td>`;
    corpo.appendChild(tr);

    investidoAnterior = investidoAtual;
    jurosAnterior = jurosAtual;
  }
}

function calcularJurosCompostos() {
  const P = parseFloat(document.getElementById('valorInicial').value) || 0;
  const A = parseFloat(document.getElementById('aporteMensal').value) || 0;
  const i = (parseFloat(document.getElementById('taxaMensal').value) || 0) / 100;
  const n = parseInt(document.getElementById('periodoMeses').value) || 0;

  // M = P(1+i)^n + A * [((1+i)^n - 1) / i]
  const fatorCrescimento = Math.pow(1 + i, n);
  const montanteInicial = P * fatorCrescimento;
  const montanteAportes = i === 0 ? A * n : A * ((fatorCrescimento - 1) / i);
  const montante = montanteInicial + montanteAportes;

  const totalInvestido = P + (A * n);
  const totalJuros = montante - totalInvestido;

  document.getElementById('resTotalInvestido').textContent = formatarBRL(totalInvestido);
  document.getElementById('resTotalJuros').textContent = formatarBRL(totalJuros);
  document.getElementById('resMontante').textContent = formatarBRL(montante);

  if (montante > 0) {
    const pctInvestido = (totalInvestido / montante) * 100;
    const pctJuros = (totalJuros / montante) * 100;
    const fator = P > 0 || totalInvestido > 0 ? montante / (totalInvestido || 1) : 0;
    document.getElementById('statInvestidoPct').textContent = pctInvestido.toFixed(1) + '%';
    document.getElementById('statJurosPct').textContent = pctJuros.toFixed(1) + '%';
    document.getElementById('statFator').textContent = fator.toFixed(2) + 'x';
  }

  if (n > 0) {
    const serie = gerarSerieMensal(P, A, i, n);
    desenharGrafico(serie, n);
    popularTabelaAnual(P, A, i, n);
  }
}

['valorInicial', 'aporteMensal', 'taxaMensal', 'periodoMeses'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcularJurosCompostos);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcularJurosCompostos);
calcularJurosCompostos();
