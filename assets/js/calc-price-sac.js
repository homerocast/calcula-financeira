function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function gerarSAC(P, i, n) {
  const amortizacao = P / n;
  let saldo = P;
  const parcelas = [];
  let totalJuros = 0;
  for (let mes = 1; mes <= n; mes++) {
    const juros = saldo * i;
    const parcela = amortizacao + juros;
    parcelas.push(parcela);
    totalJuros += juros;
    saldo -= amortizacao;
  }
  return { parcelas, totalJuros, totalPago: P + totalJuros };
}

function gerarPrice(P, i, n) {
  let parcela;
  if (i === 0) {
    parcela = P / n;
  } else {
    parcela = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
  }
  const parcelas = new Array(n).fill(parcela);
  const totalPago = parcela * n;
  const totalJuros = totalPago - P;
  return { parcelas, totalJuros, totalPago };
}

let grafico = null;

function desenharGrafico(sacParcelas, priceParcelas) {
  const n = sacParcelas.length;
  const passo = n > 60 ? 12 : (n > 24 ? 3 : 1);
  const indices = [];
  for (let i = 0; i < n; i += passo) indices.push(i);
  if (indices[indices.length - 1] !== n - 1) indices.push(n - 1);

  const labels = indices.map(idx => 'mês ' + (idx + 1));
  const sacPts = indices.map(idx => sacParcelas[idx]);
  const pricePts = indices.map(idx => priceParcelas[idx]);

  const ctx = document.getElementById('grafico').getContext('2d');
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'SAC',
          data: sacPts,
          borderColor: '#B23A2E',
          backgroundColor: 'rgba(178, 58, 46, 0.10)',
          fill: false,
          tension: 0.15,
          pointRadius: 0,
          borderWidth: 2.2
        },
        {
          label: 'PRICE',
          data: pricePts,
          borderColor: '#B4872B',
          backgroundColor: 'rgba(180, 135, 43, 0.10)',
          fill: false,
          tension: 0.15,
          pointRadius: 0,
          borderWidth: 2.2
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + formatarBRL(ctx.parsed.y) } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#47564D' } },
        y: {
          grid: { color: '#EFECDE' },
          ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#47564D', callback: v => (v / 1000).toFixed(1) + 'k' }
        }
      }
    }
  });
}

function calcular() {
  const P = parseFloat(document.getElementById('valorFinanciado').value) || 0;
  const i = (parseFloat(document.getElementById('taxaMensal').value) || 0) / 100;
  const n = parseInt(document.getElementById('prazoMeses').value) || 1;

  const sac = gerarSAC(P, i, n);
  const price = gerarPrice(P, i, n);

  document.getElementById('sacPrimeira').textContent = formatarBRL(sac.parcelas[0]);
  document.getElementById('sacUltima').textContent = formatarBRL(sac.parcelas[sac.parcelas.length - 1]);
  document.getElementById('sacJuros').textContent = formatarBRL(sac.totalJuros);
  document.getElementById('sacTotal').textContent = formatarBRL(sac.totalPago);

  document.getElementById('pricePrimeira').textContent = formatarBRL(price.parcelas[0]);
  document.getElementById('priceUltima').textContent = formatarBRL(price.parcelas[price.parcelas.length - 1]);
  document.getElementById('priceJuros').textContent = formatarBRL(price.totalJuros);
  document.getElementById('priceTotal').textContent = formatarBRL(price.totalPago);

  desenharGrafico(sac.parcelas, price.parcelas);
}

['valorFinanciado', 'taxaMensal', 'prazoMeses'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
calcular();
