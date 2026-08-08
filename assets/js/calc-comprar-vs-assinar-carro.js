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
  // ---- Custo real = total gasto menos o valor do carro que ainda seria seu ----
  // Na assinatura o carro é devolvido, então não há valor a descontar.
  const custoRealAssinatura = custoAssinatura; // não fica com o carro
  const custoRealVista = custoVista - patrimonioFinal;
  const custoRealSemJuros = custoSemJuros - patrimonioFinal;
  const custoRealComJuros = custoComJuros - patrimonioFinal;

  // ---- Exibição ----
  document.getElementById('resCustoAssinatura').textContent = formatarBRL(custoAssinatura);
  document.getElementById('resFicaAssinatura').textContent = 'Não';
  document.getElementById('resValorCarroAssinatura').textContent = 'R$ 0,00';
  document.getElementById('resSaldoAssinatura').textContent = formatarBRL(custoRealAssinatura);

  document.getElementById('resCustoVista').textContent = formatarBRL(custoVista);
  document.getElementById('resFicaVista').textContent = 'Sim';
  document.getElementById('resValorCarroVista').textContent = formatarBRL(patrimonioFinal);
  document.getElementById('resSaldoVista').textContent = formatarBRL(custoRealVista);

  document.getElementById('resCustoSemJuros').textContent = formatarBRL(custoSemJuros);
  document.getElementById('resFicaSemJuros').textContent = 'Sim';
  document.getElementById('resValorCarroSemJuros').textContent = formatarBRL(patrimonioFinal);
  document.getElementById('resSaldoSemJuros').textContent = formatarBRL(custoRealSemJuros);

  document.getElementById('resCustoComJuros').textContent = formatarBRL(custoComJuros);
  document.getElementById('resFicaComJuros').textContent = 'Sim';
  document.getElementById('resValorCarroComJuros').textContent = formatarBRL(patrimonioFinal);
  document.getElementById('resSaldoComJuros').textContent = formatarBRL(custoRealComJuros);

  const opcoes = [
    { nome: 'Assinatura', custoReal: custoRealAssinatura, ficaComCarro: false, totalGasto: custoAssinatura },
    { nome: 'Compra à vista', custoReal: custoRealVista, ficaComCarro: true, totalGasto: custoVista },
    { nome: 'Financiamento sem juros', custoReal: custoRealSemJuros, ficaComCarro: true, totalGasto: custoSemJuros },
    { nome: 'Financiamento com juros', custoReal: custoRealComJuros, ficaComCarro: true, totalGasto: custoComJuros }
  ];
  const melhor = opcoes.reduce((a, b) => (b.custoReal < a.custoReal ? b : a));
  document.getElementById('resMelhor').textContent = melhor.nome + ' — custo real de ' + formatarBRL(melhor.custoReal);

  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML =
    `Assinando, você gastará <strong>${formatarBRL(custoAssinatura)}</strong> em 3 anos e <strong>devolverá o carro</strong> ao final — não sobra nada em patrimônio. ` +
    `Comprando à vista, você gastará <strong>${formatarBRL(custoVista)}</strong>, mas ficará com um carro que deve valer cerca de <strong>${formatarBRL(patrimonioFinal)}</strong> — ` +
    `o custo real, descontando esse valor, é de <strong>${formatarBRL(custoRealVista)}</strong>. ` +
    `Nesse cenário, a opção mais vantajosa é <span class="ok">${melhor.nome}</span>, com custo real de <strong>${formatarBRL(melhor.custoReal)}</strong> em 3 anos.`;

  desenharGrafico(opcoes.map(o => ({ nome: o.nome, custoReal: o.custoReal })), melhor.nome);
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
        data: opcoes.map(o => o.custoReal),
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
        tooltip: { callbacks: { label: ctx => 'Custo real: ' + formatarBRL(ctx.parsed.y) } }
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
