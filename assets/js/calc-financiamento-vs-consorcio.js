function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function pmt(taxa, nper, pv) {
  if (taxa === 0) return pv / nper;
  return (taxa * pv) / (1 - Math.pow(1 + taxa, -nper));
}

const DEFAULTS_POR_TIPO = {
  carro: { taxaAdm: 14, fundoReserva: 2, correcaoAnual: 3, jurosFinanciamento: 1.6 },
  imovel: { taxaAdm: 20, fundoReserva: 3, correcaoAnual: 7, jurosFinanciamento: 0.9 },
  outros: { taxaAdm: 18, fundoReserva: 2, correcaoAnual: 4.5, jurosFinanciamento: 1.8 }
};

function aplicarDefaultsPorTipo() {
  const tipo = document.getElementById('tipoBem').value;
  const d = DEFAULTS_POR_TIPO[tipo];
  document.getElementById('taxaAdmConsorcio').value = d.taxaAdm;
  document.getElementById('fundoReserva').value = d.fundoReserva;
  document.getElementById('correcaoAnual').value = d.correcaoAnual;
  document.getElementById('taxaJurosFinanciamento').value = d.jurosFinanciamento;
}

// ---- Simulação do financiamento (Price ou SAC) ----
function simularFinanciamento(valorBem, prazo, entradaPct, taxaJurosMensalPct, sistema) {
  const entrada = valorBem * (entradaPct / 100);
  const valorFinanciado = valorBem - entrada;
  const i = taxaJurosMensalPct / 100;

  const serieParcelas = [];
  let totalPago = entrada;

  if (sistema === 'price') {
    const parcela = pmt(i, prazo, valorFinanciado);
    for (let m = 1; m <= prazo; m++) {
      serieParcelas.push(parcela);
      totalPago += parcela;
    }
  } else {
    const amortizacao = valorFinanciado / prazo;
    let saldo = valorFinanciado;
    for (let m = 1; m <= prazo; m++) {
      const juros = saldo * i;
      const parcela = amortizacao + juros;
      serieParcelas.push(parcela);
      totalPago += parcela;
      saldo -= amortizacao;
    }
  }

  return {
    parcelaInicial: serieParcelas[0],
    parcelaFinal: serieParcelas[serieParcelas.length - 1],
    totalPago,
    serieParcelas
  };
}

// ---- Simulação do consórcio (com correção anual do saldo devedor e recálculo da parcela) ----
function simularConsorcio(valorBem, prazo, taxaAdmPct, fundoReservaPct, taxaAdesaoPct, correcaoAnualPct, lancePct) {
  const custoBase = valorBem * (1 + taxaAdmPct / 100 + fundoReservaPct / 100);
  const taxaAdesaoValor = valorBem * (taxaAdesaoPct / 100);
  const lanceValor = valorBem * (lancePct / 100);

  let saldoDevedor = Math.max(0, custoBase - lanceValor);
  let mesesRestantes = prazo;
  let parcelaAtual = saldoDevedor / mesesRestantes;
  const parcelaInicial = parcelaAtual;

  let totalPago = lanceValor + taxaAdesaoValor;
  const serieParcelas = [];

  for (let mes = 1; mes <= prazo; mes++) {
    serieParcelas.push(parcelaAtual);
    totalPago += parcelaAtual;
    saldoDevedor -= parcelaAtual;
    mesesRestantes -= 1;
    if (mes % 12 === 0 && mesesRestantes > 0) {
      saldoDevedor *= (1 + correcaoAnualPct / 100);
      parcelaAtual = saldoDevedor / mesesRestantes;
    }
  }

  return {
    parcelaInicial,
    parcelaFinal: serieParcelas[serieParcelas.length - 1],
    totalPago,
    serieParcelas
  };
}

let grafico = null;

function calcular() {
  const valorBem = parseFloat(document.getElementById('valorBem').value) || 0;
  const prazo = parseInt(document.getElementById('prazoMeses').value) || 1;

  const entradaPct = parseFloat(document.getElementById('entradaFinanciamento').value) || 0;
  const jurosPct = parseFloat(document.getElementById('taxaJurosFinanciamento').value) || 0;
  const sistema = document.getElementById('sistemaFinanciamento').value;

  const taxaAdmPct = parseFloat(document.getElementById('taxaAdmConsorcio').value) || 0;
  const fundoReservaPct = parseFloat(document.getElementById('fundoReserva').value) || 0;
  const taxaAdesaoPct = parseFloat(document.getElementById('taxaAdesao').value) || 0;
  const lancePct = parseFloat(document.getElementById('lancePct').value) || 0;
  const correcaoAnualPct = parseFloat(document.getElementById('correcaoAnual').value) || 0;

  const fin = simularFinanciamento(valorBem, prazo, entradaPct, jurosPct, sistema);
  const cons = simularConsorcio(valorBem, prazo, taxaAdmPct, fundoReservaPct, taxaAdesaoPct, correcaoAnualPct, lancePct);

  document.getElementById('resParcelaInicialFin').textContent = formatarBRL(fin.parcelaInicial);
  document.getElementById('resParcelaFinalFin').textContent = formatarBRL(fin.parcelaFinal);
  document.getElementById('resTotalFin').textContent = formatarBRL(fin.totalPago);

  document.getElementById('resParcelaInicialCons').textContent = formatarBRL(cons.parcelaInicial);
  document.getElementById('resParcelaFinalCons').textContent = formatarBRL(cons.parcelaFinal);
  document.getElementById('resTotalCons').textContent = formatarBRL(cons.totalPago);

  const melhor = fin.totalPago <= cons.totalPago ? 'Financiamento' : 'Consórcio';
  document.getElementById('resMelhor').textContent = melhor + ' — ' + formatarBRL(Math.min(fin.totalPago, cons.totalPago)) + ' no total';

  const crescimentoParcelaCons = ((cons.parcelaFinal / cons.parcelaInicial) - 1) * 100;
  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML =
    `No financiamento, a parcela ${sistema === 'price' ? 'começa e termina em' : 'começa em'} <strong>${formatarBRL(fin.parcelaInicial)}</strong>${sistema === 'sac' ? ' e cai até ' + formatarBRL(fin.parcelaFinal) : ''}, com total pago de <strong>${formatarBRL(fin.totalPago)}</strong>. ` +
    `No consórcio, a parcela <strong>começa em ${formatarBRL(cons.parcelaInicial)} mas termina em ${formatarBRL(cons.parcelaFinal)}</strong> — um crescimento de <span class="alerta">${crescimentoParcelaCons.toFixed(0)}%</span> só por causa da correção anual, mesmo sem contar juros. ` +
    `Somando tudo, a opção de menor custo total aqui é <span class="ok">${melhor}</span>.`;

  desenharGrafico(fin.serieParcelas, cons.serieParcelas);
}

function desenharGrafico(serieFin, serieCons) {
  const n = Math.max(serieFin.length, serieCons.length);
  const passo = n > 120 ? 12 : (n > 36 ? 6 : (n > 12 ? 3 : 1));
  const indices = [];
  for (let m = 0; m < n; m += passo) indices.push(m);
  if (indices[indices.length - 1] !== n - 1) indices.push(n - 1);

  const labels = indices.map(i => 'mês ' + (i + 1));
  const finPts = indices.map(i => serieFin[i]);
  const consPts = indices.map(i => serieCons[i]);

  const ctx = document.getElementById('graficoComparativo').getContext('2d');
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Financiamento', data: finPts, borderColor: '#14213D', backgroundColor: 'transparent', pointRadius: 0, borderWidth: 2.2, tension: 0.1 },
        { label: 'Consórcio', data: consPts, borderColor: '#B23A2E', backgroundColor: 'transparent', pointRadius: 0, borderWidth: 2.2, stepped: false, tension: 0 }
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

document.getElementById('tipoBem').addEventListener('change', () => { aplicarDefaultsPorTipo(); calcular(); });
['valorBem', 'prazoMeses', 'entradaFinanciamento', 'taxaJurosFinanciamento', 'sistemaFinanciamento',
 'taxaAdmConsorcio', 'fundoReserva', 'taxaAdesao', 'lancePct', 'correcaoAnual'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
  document.getElementById(id).addEventListener('change', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);

calcular();
