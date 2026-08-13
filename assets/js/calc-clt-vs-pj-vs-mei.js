function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Tabela do Simples Nacional — Anexo III (serviços em geral), vigente desde 2018
const FAIXAS_SIMPLES_ANEXO_III = [
  { limite: 180000, aliq: 0.06, deduzir: 0 },
  { limite: 360000, aliq: 0.112, deduzir: 9360 },
  { limite: 720000, aliq: 0.135, deduzir: 17640 },
  { limite: 1800000, aliq: 0.16, deduzir: 35640 },
  { limite: 3600000, aliq: 0.21, deduzir: 125640 },
  { limite: 4800000, aliq: 0.33, deduzir: 648000 }
];

function aliquotaEfetivaSimples(rbt12) {
  if (rbt12 <= 0) return 0;
  const faixa = FAIXAS_SIMPLES_ANEXO_III.find(f => rbt12 <= f.limite) || FAIXAS_SIMPLES_ANEXO_III[FAIXAS_SIMPLES_ANEXO_III.length - 1];
  const aliquotaEfetiva = (rbt12 * faixa.aliq - faixa.deduzir) / rbt12;
  return Math.max(0, aliquotaEfetiva);
}

const LIMITE_MEI_ANUAL = 81000;

function calcular() {
  const valorMensal = parseFloat(document.getElementById('valorMensal').value) || 0;
  const dependentes = parseInt(document.getElementById('dependentesCLT').value) || 0;
  const atividadeMei = document.getElementById('atividadeMei').value;
  const despesasNegocio = parseFloat(document.getElementById('despesasNegocio').value) || 0;

  // ---- CLT ----
  const { inss, irrf, liquido: liquidoCLT } = calcularDescontosFolha(valorMensal, dependentes);
  const descontoCLT = inss + irrf;

  // ---- PJ (Simples Nacional, Anexo III) ----
  const rbt12 = valorMensal * 12;
  const aliqEfetiva = aliquotaEfetivaSimples(rbt12);
  const dasPJ = valorMensal * aliqEfetiva;
  const inssProLabore = SALARIO_MINIMO_2026 * 0.11;
  const descontoPJ = dasPJ + inssProLabore + despesasNegocio;
  const liquidoPJ = valorMensal - descontoPJ;

  // ---- MEI ----
  const inssMei = SALARIO_MINIMO_2026 * 0.05;
  const icms = (atividadeMei === 'comercio' || atividadeMei === 'ambos') ? 1.00 : 0;
  const iss = (atividadeMei === 'servicos' || atividadeMei === 'ambos') ? 5.00 : 0;
  const dasMei = inssMei + icms + iss;
  const descontoMEI = dasMei + despesasNegocio;
  const liquidoMEI = valorMensal - descontoMEI;
  const limiteMeiMensal = LIMITE_MEI_ANUAL / 12;
  const meiViavel = valorMensal <= limiteMeiMensal;

  document.getElementById('resDescontoCLT').textContent = formatarBRL(descontoCLT);
  document.getElementById('resLiquidoCLT').textContent = formatarBRL(liquidoCLT);

  document.getElementById('resDescontoPJ').textContent = formatarBRL(descontoPJ);
  document.getElementById('resLiquidoPJ').textContent = formatarBRL(liquidoPJ);

  document.getElementById('resDescontoMEI').textContent = formatarBRL(descontoMEI);
  document.getElementById('resLiquidoMEI').textContent = formatarBRL(liquidoMEI) + (meiViavel ? '' : ' *');

  const opcoes = [
    { nome: 'CLT', valor: liquidoCLT },
    { nome: 'PJ (Simples Nacional)', valor: liquidoPJ },
    { nome: 'MEI', valor: liquidoMEI }
  ];
  const melhor = opcoes.reduce((a, b) => (b.valor > a.valor ? b : a));
  document.getElementById('resMelhor').textContent = melhor.nome;

  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML = `Para ${formatarBRL(valorMensal)} por mês, o líquido estimado é <strong>${formatarBRL(liquidoCLT)}</strong> como CLT, <strong>${formatarBRL(liquidoPJ)}</strong> como PJ, e <strong>${formatarBRL(liquidoMEI)}</strong> como MEI. Nesse valor, <span class="ok">${melhor.nome}</span> deixa mais líquido no bolso — mas lembre-se que o CLT tem 13º, férias e FGTS que não entram nessa conta.` +
    (!meiViavel ? ` <span class="alerta">Atenção: esse valor mensal ultrapassa o limite legal do MEI (média de ${formatarBRL(limiteMeiMensal)}/mês) — os números do MEI aqui são apenas referência.</span>` : '');
}

['valorMensal', 'dependentesCLT', 'atividadeMei', 'despesasNegocio'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
  document.getElementById(id).addEventListener('change', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
