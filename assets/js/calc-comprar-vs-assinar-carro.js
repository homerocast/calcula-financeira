function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// PMT (equivalente ao Excel: -PMT(taxa, nper, pv))
function pmt(taxa, nper, pv) {
  if (taxa === 0) return pv / nper;
  return (taxa * pv) / (1 - Math.pow(1 + taxa, -nper));
}

function mesesPorAno(prazoMeses) {
  return [
    Math.max(0, Math.min(12, prazoMeses)),
    Math.max(0, Math.min(12, prazoMeses - 12)),
    Math.max(0, Math.min(12, prazoMeses - 24))
  ];
}

function calcular() {
  const preco = parseFloat(document.getElementById('preco').value) || 0;
  const km = parseFloat(document.getElementById('km').value) || 0;
  const assinaturaMensal = parseFloat(document.getElementById('assinaturaMensal').value) || 0;

  const inflacao = (parseFloat(document.getElementById('inflacao').value) || 0) / 100;
  const custoOportunidade = (parseFloat(document.getElementById('custoOportunidade').value) || 0) / 100;
  const taxaDeprec = (parseFloat(document.getElementById('depreciacao').value) || 0) / 100;
  const aliquotaIPVA = (parseFloat(document.getElementById('ipva').value) || 0) / 100;
  const licenciamento = parseFloat(document.getElementById('licenciamento').value) || 0;
  const seguro = parseFloat(document.getElementById('seguro').value) || 0;
  const manutPrev = parseFloat(document.getElementById('manutPrev').value) || 0;
  const manutCorr = parseFloat(document.getElementById('manutCorr').value) || 0;

  const entradaSemJuros = (parseFloat(document.getElementById('entradaSemJuros').value) || 0) / 100;
  const prazoSemJuros = parseFloat(document.getElementById('prazoSemJuros').value) || 1;
  const entradaComJuros = (parseFloat(document.getElementById('entradaComJuros').value) || 0) / 100;
  const prazoComJuros = parseFloat(document.getElementById('prazoComJuros').value) || 1;
  const jurosMensal = (parseFloat(document.getElementById('jurosMensal').value) || 0) / 100;

  // ---- Depreciação declinante (compartilhada pelas opções que envolvem posse do carro) ----
  const dep1 = preco * taxaDeprec;
  const dep2 = (preco - dep1) * taxaDeprec;
  const dep3 = (preco - dep1 - dep2) * taxaDeprec;
  const depreciacoes = [dep1, dep2, dep3];
  const patrimonioFinal = preco - (dep1 + dep2 + dep3);

  // ---- Despesas fixas + IPVA (proporcional ao valor depreciado, aproximação linear como na planilha original) ----
  const despesasFixas = licenciamento + seguro + manutPrev + manutCorr;
  const ipva1 = preco * aliquotaIPVA;
  const ipva2 = (preco - dep1) * aliquotaIPVA;
  const ipva3 = (preco - 2 * dep1) * aliquotaIPVA;
  const despesas = [despesasFixas + ipva1, despesasFixas + ipva2, despesasFixas + ipva3];

  function custoOportunidadeComposto(baseCapital) {
    const co1 = baseCapital * custoOportunidade;
    const co2 = (baseCapital + co1) * custoOportunidade;
    const co3 = (baseCapital + co1 + co2) * custoOportunidade;
    return [co1, co2, co3];
  }

  // ---- 1) Assinatura ----
  const assinaturaAnos = [
    assinaturaMensal * 12,
    assinaturaMensal * (1 + inflacao) * 12,
    assinaturaMensal * (1 + 2 * inflacao) * 12
  ];
  const custoAssinatura = assinaturaAnos.reduce((a, b) => a + b, 0);
  const saldoAssinatura = 0 - custoAssinatura;

  // ---- 2) Compra à vista ----
  const coVista = custoOportunidadeComposto(preco);
  const totalVista = [0, 1, 2].map(i => (i === 0 ? preco : 0) + coVista[i] + despesas[i] + depreciacoes[i]);
  const custoVista = totalVista.reduce((a, b) => a + b, 0);
  const saldoVista = patrimonioFinal - custoVista;

  // ---- 3) Financiamento sem juros ----
  const entradaValorSJ = preco * entradaSemJuros;
  const coSemJuros = custoOportunidadeComposto(entradaValorSJ);
  const parcelaMensalSJ = (preco - entradaValorSJ) / prazoSemJuros;
  const mesesSJ = mesesPorAno(prazoSemJuros);
  const parcelasSJ = mesesSJ.map(m => parcelaMensalSJ * m);
  const totalSemJuros = [0, 1, 2].map(i => (i === 0 ? entradaValorSJ : 0) + coSemJuros[i] + despesas[i] + depreciacoes[i] + parcelasSJ[i]);
  const custoSemJuros = totalSemJuros.reduce((a, b) => a + b, 0);
  const saldoSemJuros = patrimonioFinal - custoSemJuros;

  // ---- 4) Financiamento com juros ----
  const entradaValorCJ = preco * entradaComJuros;
  const valorFinanciadoCJ = preco - entradaValorCJ;
  const coComJuros = custoOportunidadeComposto(entradaValorCJ);
  const parcelaMensalCJ = pmt(jurosMensal, prazoComJuros, valorFinanciadoCJ);
  const mesesCJ = mesesPorAno(prazoComJuros);
  const parcelasCJ = mesesCJ.map(m => parcelaMensalCJ * m);
  const totalComJuros = [0, 1, 2].map(i => (i === 0 ? entradaValorCJ : 0) + coComJuros[i] + despesas[i] + depreciacoes[i] + parcelasCJ[i]);
  const custoComJuros = totalComJuros.reduce((a, b) => a + b, 0);
  const saldoComJuros = patrimonioFinal - custoComJuros;

  // ---- Exibição ----
  document.getElementById('resCustoAssinatura').textContent = formatarBRL(custoAssinatura);
  document.getElementById('resSaldoAssinatura').textContent = formatarBRL(saldoAssinatura);
  document.getElementById('resCustoVista').textContent = formatarBRL(custoVista);
  document.getElementById('resSaldoVista').textContent = formatarBRL(saldoVista);
  document.getElementById('resCustoSemJuros').textContent = formatarBRL(custoSemJuros);
  document.getElementById('resSaldoSemJuros').textContent = formatarBRL(saldoSemJuros);
  document.getElementById('resCustoComJuros').textContent = formatarBRL(custoComJuros);
  document.getElementById('resSaldoComJuros').textContent = formatarBRL(saldoComJuros);

  const opcoes = [
    { nome: 'Assinatura', saldo: saldoAssinatura },
    { nome: 'Compra à vista', saldo: saldoVista },
    { nome: 'Financ. sem juros', saldo: saldoSemJuros },
    { nome: 'Financ. com juros', saldo: saldoComJuros }
  ];
  const melhor = opcoes.reduce((a, b) => (b.saldo > a.saldo ? b : a));
  document.getElementById('resMelhor').textContent = melhor.nome;

  desenharGrafico(opcoes, melhor.nome);
}

let grafico = null;

function desenharGrafico(opcoes, nomeMelhor) {
  const ctx = document.getElementById('graficoCarro').getContext('2d');
  if (grafico) grafico.destroy();
  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: opcoes.map(o => o.nome),
      datasets: [{
        data: opcoes.map(o => o.saldo),
        backgroundColor: opcoes.map(o => o.nome === nomeMelhor ? '#2F7A56' : '#E3DFD2'),
        borderRadius: 4,
        maxBarThickness: 60
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
        x: { grid: { display: false }, ticks: { font: { family: 'IBM Plex Sans', size: 10 }, color: '#5B6472' } },
        y: {
          grid: { color: '#F4F1E9' },
          ticks: { font: { family: 'IBM Plex Mono', size: 10 }, color: '#5B6472', callback: v => (v / 1000).toFixed(0) + 'k' }
        }
      }
    }
  });
}

const camposEntrada = [
  'preco', 'km', 'assinaturaMensal', 'inflacao', 'custoOportunidade', 'depreciacao',
  'ipva', 'licenciamento', 'seguro', 'manutPrev', 'manutCorr',
  'entradaSemJuros', 'prazoSemJuros', 'entradaComJuros', 'prazoComJuros', 'jurosMensal'
];
camposEntrada.forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
