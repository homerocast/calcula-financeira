function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

let grafico = null;

function calcular() {
  const P = parseFloat(document.getElementById('capital').value) || 0;
  const i = (parseFloat(document.getElementById('taxa').value) || 0) / 100;
  const n = parseInt(document.getElementById('periodo').value) || 0;

  const montanteSimples = P * (1 + i * n);
  const juros = montanteSimples - P;

  document.getElementById('resJuros').textContent = formatarBRL(juros);
  document.getElementById('resMontante').textContent = formatarBRL(montanteSimples);

  if (n > 0) desenharGrafico(P, i, n);
}

function desenharGrafico(P, i, n) {
  const passo = n > 60 ? 12 : (n > 24 ? 3 : 1);
  const meses = [];
  for (let m = 0; m <= n; m += passo) meses.push(m);
  if (meses[meses.length - 1] !== n) meses.push(n);

  const simples = meses.map(m => P * (1 + i * m));
  const compostos = meses.map(m => P * Math.pow(1 + i, m));
  const labels = meses.map(m => m === 0 ? 'início' : 'mês ' + m);

  const ctx = document.getElementById('graficoSimples').getContext('2d');
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Juros simples', data: simples, borderColor: '#C9963E', backgroundColor: 'transparent', pointRadius: 0, borderWidth: 2.2, tension: 0 },
        { label: 'Juros compostos', data: compostos, borderColor: '#2F7A56', backgroundColor: 'transparent', pointRadius: 0, borderWidth: 2.2, tension: 0.15 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.4,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + formatarBRL(ctx.parsed.y) } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#5B6472' } },
        y: { grid: { color: '#F4F1E9' }, ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#5B6472', callback: v => (v / 1000).toFixed(1) + 'k' } }
      }
    }
  });
}

['capital', 'taxa', 'periodo'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
