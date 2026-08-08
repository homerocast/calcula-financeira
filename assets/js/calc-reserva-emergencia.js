function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Resolve n (períodos) para PV*(1+i)^n + A*((1+i)^n - 1)/i = FV
function mesesParaMeta(PV, A, i, FV) {
  if (PV >= FV) return 0;
  if (i === 0) {
    if (A <= 0) return Infinity;
    return (FV - PV) / A;
  }
  const denom = PV + A / i;
  if (denom <= 0) return Infinity;
  const x = (FV + A / i) / denom;
  if (x <= 0) return Infinity;
  return Math.log(x) / Math.log(1 + i);
}

function formatarPrazo(meses) {
  if (!isFinite(meses)) return 'não atingível com esses valores';
  if (meses <= 0) return 'meta já atingida';
  const totalMeses = Math.ceil(meses);
  const anos = Math.floor(totalMeses / 12);
  const restoMeses = totalMeses % 12;
  const partes = [];
  if (anos > 0) partes.push(anos + (anos === 1 ? ' ano' : ' anos'));
  if (restoMeses > 0) partes.push(restoMeses + (restoMeses === 1 ? ' mês' : ' meses'));
  return partes.length ? partes.join(' e ') : '0 meses';
}

let grafico = null;

function calcular() {
  const despesas = parseFloat(document.getElementById('despesas').value) || 0;
  const multiplicador = parseFloat(document.getElementById('perfil').value) || 6;
  const jaGuardado = parseFloat(document.getElementById('jaGuardado').value) || 0;
  const aporte = parseFloat(document.getElementById('aporteMensal').value) || 0;
  const i = (parseFloat(document.getElementById('rendimento').value) || 0) / 100;

  const reservaIdeal = despesas * multiplicador;
  const falta = Math.max(0, reservaIdeal - jaGuardado);
  const meses = mesesParaMeta(jaGuardado, aporte, i, reservaIdeal);

  document.getElementById('resReservaIdeal').textContent = formatarBRL(reservaIdeal);
  document.getElementById('resFalta').textContent = formatarBRL(falta);
  document.getElementById('resPrazo').textContent = formatarPrazo(meses);

  const progresso = reservaIdeal > 0 ? Math.min(100, (jaGuardado / reservaIdeal) * 100) : 0;
  document.getElementById('statProgresso').textContent = progresso.toFixed(1) + '%';

  desenharGrafico(jaGuardado, aporte, i, reservaIdeal, isFinite(meses) ? Math.ceil(meses) : 0);
}

function desenharGrafico(PV, A, i, meta, nMeses) {
  const n = Math.max(nMeses, 1);
  const passo = n > 60 ? 12 : (n > 24 ? 3 : 1);
  const pontos = [];
  for (let m = 0; m <= n; m += passo) pontos.push(m);
  if (pontos[pontos.length - 1] !== n) pontos.push(n);

  const valores = pontos.map(m => PV * Math.pow(1 + i, m) + (i === 0 ? A * m : A * ((Math.pow(1 + i, m) - 1) / i)));
  const labels = pontos.map(m => m === 0 ? 'hoje' : 'mês ' + m);

  const ctx = document.getElementById('graficoReserva').getContext('2d');
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Reserva acumulada', data: valores, borderColor: '#C9963E', backgroundColor: 'rgba(201, 150, 62, 0.16)', fill: true, pointRadius: 0, borderWidth: 2.2, tension: 0.2 },
        { label: 'Meta', data: pontos.map(() => meta), borderColor: '#2F7A56', borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0, fill: false }
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
        x: { grid: { display: false }, ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#5B6472' } },
        y: { grid: { color: '#F4F1E9' }, ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#5B6472', callback: v => (v / 1000).toFixed(1) + 'k' } }
      }
    }
  });
}

['despesas', 'perfil', 'jaGuardado', 'aporteMensal', 'rendimento'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
  document.getElementById(id).addEventListener('change', calcular);
});
calcular();
