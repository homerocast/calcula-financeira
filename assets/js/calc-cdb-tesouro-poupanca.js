function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function aliquotaIR(dias) {
  if (dias <= 180) return 0.225;
  if (dias <= 360) return 0.20;
  if (dias <= 720) return 0.175;
  return 0.15;
}

// IOF regressivo (Decreto 6.306/2007): incide sobre o RENDIMENTO, só nos primeiros 30 dias.
// Não se aplica à poupança (isenta de IOF em qualquer prazo).
function aliquotaIOF(dias) {
  if (dias >= 30) return 0;
  return Math.floor(((30 - dias) / 30) * 100) / 100;
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
  const iof = aliquotaIOF(dias);

  // --- CDB ---
  const taxaCDBAnual = taxaCDI * percCDB;
  const brutoCDB = valor * (Math.pow(1 + taxaCDBAnual, anos) - 1);
  const brutoCDBAposIOF = brutoCDB * (1 - iof);
  const liquidoCDB = brutoCDBAposIOF * (1 - aliq);

  // --- Tesouro Selic ---
  const brutoTesouro = valor * (Math.pow(1 + taxaSelic, anos) - 1);
  const brutoTesouroAposIOF = brutoTesouro * (1 - iof);
  const custodia = valor * taxaCustodia * anos;
  const liquidoTesouro = brutoTesouroAposIOF * (1 - aliq) - custodia;

  // --- Poupança ---
  // Só rende no "aniversário" mensal da aplicação — meses incompletos não rendem nada
  // (e a poupança é isenta de IOF em qualquer prazo).
  const taxaSelicAnualPct = taxaSelic * 100;
  const taxaMensalPoupanca = taxaSelicAnualPct > 8.5 ? 0.005 : (0.70 * taxaSelic / 12);
  const mesesCompletos = Math.floor(dias / 30);
  const liquidoPoupanca = valor * (Math.pow(1 + taxaMensalPoupanca, mesesCompletos) - 1);

  document.getElementById('resCDB').textContent = formatarBRL(liquidoCDB);
  document.getElementById('resTesouro').textContent = formatarBRL(liquidoTesouro);
  document.getElementById('resPoupanca').textContent = formatarBRL(liquidoPoupanca);

  const narrativa = document.getElementById('resultadoNarrativo');
  if (dias < 30) {
    narrativa.style.display = 'block';
    narrativa.innerHTML = `<span class="alerta">Resgate em menos de 30 dias:</span> o CDB e o Tesouro Selic sofrem <strong>IOF regressivo de ${(iof * 100).toFixed(0)}%</strong> sobre o rendimento bruto (some a zero só a partir do 30º dia). A poupança só paga rendimento no "aniversário" mensal do depósito — com ${dias} dia(s), ela ainda não completou um mês, então <strong>o rendimento da poupança é R$ 0,00</strong> nesse prazo.`;
  } else {
    narrativa.style.display = 'none';
  }

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
      maintainAspectRatio: true,
      aspectRatio: 2.4,
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
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
