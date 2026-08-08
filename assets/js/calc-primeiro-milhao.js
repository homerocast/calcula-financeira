function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function mesesParaMeta(PV, A, i, FV) {
  if (PV >= FV) return 0;
  if (i === 0) return A > 0 ? (FV - PV) / A : Infinity;
  const denom = PV + A / i;
  if (denom <= 0) return Infinity;
  const x = (FV + A / i) / denom;
  if (x <= 0) return Infinity;
  return Math.log(x) / Math.log(1 + i);
}

// Resolve o aporte mensal A dado PV, i, n, FV
function aporteParaMeta(PV, i, n, FV) {
  if (i === 0) return (FV - PV) / n;
  const fator = Math.pow(1 + i, n);
  return (FV - PV * fator) * i / (fator - 1);
}

function formatarPrazo(meses) {
  if (!isFinite(meses)) return 'não atingível';
  if (meses <= 0) return 'meta já atingida';
  const totalMeses = Math.ceil(meses);
  const anos = Math.floor(totalMeses / 12);
  const resto = totalMeses % 12;
  const partes = [];
  if (anos > 0) partes.push(anos + (anos === 1 ? ' ano' : ' anos'));
  if (resto > 0) partes.push(resto + (resto === 1 ? ' mês' : ' meses'));
  return partes.length ? partes.join(' e ') : '0 meses';
}

let grafico = null;

function alternarModo() {
  const modo = document.getElementById('modo').value;
  document.getElementById('campoAporte').style.display = modo === 'prazo' ? 'block' : 'none';
  document.getElementById('campoPrazo').style.display = modo === 'aporte' ? 'block' : 'none';
  document.getElementById('resLabel').textContent = modo === 'prazo' ? 'Prazo até a meta' : 'Aporte mensal necessário';
}

function calcular() {
  const meta = parseFloat(document.getElementById('meta').value) || 0;
  const modo = document.getElementById('modo').value;
  const PV = parseFloat(document.getElementById('jaInvestido').value) || 0;
  const taxaAnual = (parseFloat(document.getElementById('taxa').value) || 0) / 100;
  const i = Math.pow(1 + taxaAnual, 1 / 12) - 1;

  let nMeses, aporteMensal;

  if (modo === 'prazo') {
    aporteMensal = parseFloat(document.getElementById('aporteMensal').value) || 0;
    nMeses = mesesParaMeta(PV, aporteMensal, i, meta);
    document.getElementById('resValor').textContent = formatarPrazo(nMeses);
  } else {
    const prazoAnos = parseFloat(document.getElementById('prazoAnos').value) || 1;
    nMeses = prazoAnos * 12;
    aporteMensal = aporteParaMeta(PV, i, nMeses, meta);
    document.getElementById('resValor').textContent = formatarBRL(Math.max(0, aporteMensal)) + '/mês';
  }

  if (isFinite(nMeses) && nMeses > 0) {
    desenharGrafico(PV, aporteMensal, i, meta, Math.ceil(nMeses));
  }
}

function desenharGrafico(PV, A, i, meta, nMeses) {
  const n = Math.max(nMeses, 1);
  const passo = n > 120 ? 24 : (n > 48 ? 12 : (n > 12 ? 3 : 1));
  const pontos = [];
  for (let m = 0; m <= n; m += passo) pontos.push(m);
  if (pontos[pontos.length - 1] !== n) pontos.push(n);

  const valores = pontos.map(m => PV * Math.pow(1 + i, m) + (i === 0 ? A * m : A * ((Math.pow(1 + i, m) - 1) / i)));
  const labels = pontos.map(m => (m % 12 === 0) ? (m / 12) + 'a' : m + 'm');

  const ctx = document.getElementById('graficoMilhao').getContext('2d');
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Patrimônio', data: valores, borderColor: '#C9963E', backgroundColor: 'rgba(201, 150, 62, 0.16)', fill: true, pointRadius: 0, borderWidth: 2.2, tension: 0.2 },
        { label: 'Meta', data: pontos.map(() => meta), borderColor: '#2F7A56', borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0, fill: false }
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
        y: { grid: { color: '#F4F1E9' }, ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#5B6472', callback: v => (v / 1000).toFixed(0) + 'k' } }
      }
    }
  });
}

document.getElementById('modo').addEventListener('change', () => { alternarModo(); calcular(); });
['meta', 'jaInvestido', 'aporteMensal', 'prazoAnos', 'taxa'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
alternarModo();
calcular();
