function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function pmt(taxa, nper, pv) {
  if (taxa === 0) return pv / nper;
  return (taxa * pv) / (1 - Math.pow(1 + taxa, -nper));
}

let grafico = null;

function simular() {
  const valorImovel = parseFloat(document.getElementById('valorImovel').value) || 0;
  const aluguelInicial = parseFloat(document.getElementById('aluguelMensal').value) || 0;
  const valorizacaoImovel = (parseFloat(document.getElementById('valorizacaoImovel').value) || 0) / 100;
  const reajusteAluguel = (parseFloat(document.getElementById('reajusteAluguel').value) || 0) / 100;

  const pctEntrada = (parseFloat(document.getElementById('entradaFinanciamento').value) || 0) / 100;
  const pctCustos = (parseFloat(document.getElementById('custosAdicionais').value) || 0) / 100;
  const prazoAnos = parseFloat(document.getElementById('prazoFinanciamento').value) || 1;
  const taxaJurosAnual = (parseFloat(document.getElementById('taxaJuros').value) || 0) / 100;
  const custoOportunidadeAnual = (parseFloat(document.getElementById('custoOportunidade').value) || 0) / 100;
  const horizonteAnos = parseFloat(document.getElementById('horizonte').value) || 1;

  const entradaValor = valorImovel * pctEntrada;
  const custosValor = valorImovel * pctCustos;
  const valorFinanciado = valorImovel - entradaValor;
  const taxaJurosMensal = Math.pow(1 + taxaJurosAnual, 1 / 12) - 1;
  const parcela = pmt(taxaJurosMensal, prazoAnos * 12, valorFinanciado);
  const taxaOportunidadeMensal = Math.pow(1 + custoOportunidadeAnual, 1 / 12) - 1;

  const horizonteMeses = Math.round(horizonteAnos * 12);
  const mesesFinanciados = Math.min(horizonteMeses, prazoAnos * 12);

  // ---- Simulação mês a mês: Alugar e investir a diferença ----
  let saldoInvestido = entradaValor + custosValor;
  let aluguelAtual = aluguelInicial;
  let totalAluguelPago = 0;
  const serieAlugar = [saldoInvestido];

  for (let mes = 1; mes <= horizonteMeses; mes++) {
    if (mes > 1 && (mes - 1) % 12 === 0) aluguelAtual *= (1 + reajusteAluguel);
    const parcelaEquivalente = mes <= prazoAnos * 12 ? parcela : 0;
    const aporte = parcelaEquivalente - aluguelAtual;
    saldoInvestido = saldoInvestido * (1 + taxaOportunidadeMensal) + aporte;
    totalAluguelPago += aluguelAtual;
    serieAlugar.push(saldoInvestido);
  }

  // ---- Financiar ----
  const totalParcelasPagas = parcela * mesesFinanciados;
  const custoTotalFinanciar = entradaValor + custosValor + totalParcelasPagas;
  const valorImovelFinal = valorImovel * Math.pow(1 + valorizacaoImovel, horizonteAnos);

  let saldoDevedorFinal = 0;
  if (horizonteMeses < prazoAnos * 12) {
    const m = horizonteMeses;
    saldoDevedorFinal = valorFinanciado * Math.pow(1 + taxaJurosMensal, m) - parcela * ((Math.pow(1 + taxaJurosMensal, m) - 1) / taxaJurosMensal);
    saldoDevedorFinal = Math.max(0, saldoDevedorFinal);
  }
  const patrimonioFinanciar = valorImovelFinal - saldoDevedorFinal;

  // série mensal do valor "financiar" para o gráfico (aprox: imóvel valoriza continuamente, saldo devedor amortiza linearmente na composição de juros)
  const serieFinanciar = [entradaValor + custosValor];
  let saldoDev = valorFinanciado;
  for (let mes = 1; mes <= horizonteMeses; mes++) {
    const anoFrac = mes / 12;
    const valorImovelMes = valorImovel * Math.pow(1 + valorizacaoImovel, anoFrac);
    if (mes <= prazoAnos * 12) {
      const jurosMes = saldoDev * taxaJurosMensal;
      const amortMes = parcela - jurosMes;
      saldoDev = Math.max(0, saldoDev - amortMes);
    }
    serieFinanciar.push(valorImovelMes - saldoDev);
  }

  const patrimonioAlugar = saldoInvestido;

  document.getElementById('resDesembolsoAlugar').textContent = formatarBRL(totalAluguelPago);
  document.getElementById('resPatrimonioAlugar').textContent = formatarBRL(patrimonioAlugar);
  document.getElementById('resDesembolsoFinanciar').textContent = formatarBRL(custoTotalFinanciar);
  document.getElementById('resPatrimonioFinanciar').textContent = formatarBRL(patrimonioFinanciar);

  const melhor = patrimonioAlugar >= patrimonioFinanciar ? 'Alugar e investir a diferença' : 'Financiar';
  document.getElementById('resMelhor').textContent = melhor;

  desenharGrafico(serieAlugar, serieFinanciar, horizonteMeses);
}

function desenharGrafico(serieAlugar, serieFinanciar, horizonteMeses) {
  const passo = horizonteMeses > 120 ? 12 : (horizonteMeses > 36 ? 6 : (horizonteMeses > 12 ? 3 : 1));
  const indices = [];
  for (let m = 0; m <= horizonteMeses; m += passo) indices.push(m);
  if (indices[indices.length - 1] !== horizonteMeses) indices.push(horizonteMeses);

  const labels = indices.map(m => m === 0 ? 'início' : (m % 12 === 0 ? (m / 12) + 'a' : m + 'm'));
  const alugarPts = indices.map(i => serieAlugar[i]);
  const financiarPts = indices.map(i => serieFinanciar[i]);

  const ctx = document.getElementById('graficoImovel').getContext('2d');
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Alugar e investir', data: alugarPts, borderColor: '#C9963E', backgroundColor: 'transparent', pointRadius: 0, borderWidth: 2.2, tension: 0.15 },
        { label: 'Financiar', data: financiarPts, borderColor: '#14213D', backgroundColor: 'transparent', pointRadius: 0, borderWidth: 2.2, tension: 0.15 }
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

const campos = ['valorImovel', 'aluguelMensal', 'valorizacaoImovel', 'reajusteAluguel', 'entradaFinanciamento', 'custosAdicionais', 'prazoFinanciamento', 'taxaJuros', 'custoOportunidade', 'horizonte'];
campos.forEach(id => {
  document.getElementById(id).addEventListener('input', simular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', simular);
simular();
