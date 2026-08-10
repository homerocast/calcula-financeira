function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Tabela progressiva ANUAL 2026 (= tabela mensal × 12)
function calcularIRPFAnual(baseCalculo) {
  const faixas = [
    { ate: 29145.60, aliq: 0, deducao: 0 },
    { ate: 33919.80, aliq: 0.075, deducao: 2185.92 },
    { ate: 45012.60, aliq: 0.15, deducao: 4729.92 },
    { ate: 55976.16, aliq: 0.225, deducao: 8105.88 },
    { ate: Infinity, aliq: 0.275, deducao: 10904.76 }
  ];
  let faixaAplicavel = faixas[faixas.length - 1];
  for (const f of faixas) {
    if (baseCalculo <= f.ate) { faixaAplicavel = f; break; }
  }
  const imposto = baseCalculo * faixaAplicavel.aliq - faixaAplicavel.deducao;
  return Math.max(0, imposto);
}

// Redutor anual (Lei 15.270/2025): isenção até R$60.000, redução linear até R$88.200
function aplicarRedutorAnual(impostoApurado, rendaAnual) {
  if (rendaAnual <= 60000) return 0;
  if (rendaAnual <= 88200) {
    const redutor = 11743.44 - 0.133145 * rendaAnual;
    return Math.max(0, impostoApurado - Math.max(0, redutor));
  }
  return impostoApurado;
}

const DEDUCAO_DEPENDENTE_ANUAL = 2275.08;
const LIMITE_EDUCACAO_ANUAL = 3561.50;
const LIMITE_SIMPLIFICADO = 17640.00;

function calcular() {
  const rendimento = parseFloat(document.getElementById('rendimentoAnual').value) || 0;
  const inss = parseFloat(document.getElementById('inssAnual').value) || 0;
  const dependentes = parseInt(document.getElementById('dependentes').value) || 0;
  const educacao = parseFloat(document.getElementById('despesasEducacao').value) || 0;
  const saude = parseFloat(document.getElementById('despesasSaude').value) || 0;
  const irrfRetido = parseFloat(document.getElementById('irrfRetido').value) || 0;

  // Modelo simplificado: abate 20% do rendimento, limitado a R$17.640
  const descontoSimplificado = Math.min(rendimento * 0.20, LIMITE_SIMPLIFICADO);
  const baseSimplificado = Math.max(0, rendimento - descontoSimplificado);
  const impostoSimplificadoApurado = calcularIRPFAnual(baseSimplificado);
  const impostoSimplificado = aplicarRedutorAnual(impostoSimplificadoApurado, rendimento);

  // Modelo completo: soma todas as deduções legais
  const educacaoLimitada = Math.min(educacao, LIMITE_EDUCACAO_ANUAL * Math.max(1, dependentes + 1));
  const totalDeducoes = inss + (dependentes * DEDUCAO_DEPENDENTE_ANUAL) + educacaoLimitada + saude;
  const baseCompleto = Math.max(0, rendimento - totalDeducoes);
  const impostoCompletoApurado = calcularIRPFAnual(baseCompleto);
  const impostoCompleto = aplicarRedutorAnual(impostoCompletoApurado, rendimento);

  document.getElementById('baseSimplificado').textContent = formatarBRL(baseSimplificado);
  document.getElementById('impostoSimplificado').textContent = formatarBRL(impostoSimplificado);
  document.getElementById('baseCompleto').textContent = formatarBRL(baseCompleto);
  document.getElementById('impostoCompleto').textContent = formatarBRL(impostoCompleto);

  const modeloSimplificadoMelhor = impostoSimplificado <= impostoCompleto;
  const impostoFinal = modeloSimplificadoMelhor ? impostoSimplificado : impostoCompleto;
  document.getElementById('resMelhorModelo').textContent =
    (modeloSimplificadoMelhor ? 'Desconto simplificado' : 'Deduções completas') + ' — imposto de ' + formatarBRL(impostoFinal);

  const diferenca = irrfRetido - impostoFinal;
  const statusLabel = document.getElementById('resStatusLabel');
  const valorFinal = document.getElementById('resValorFinal');
  const narrativa = document.getElementById('resultadoNarrativo');

  if (diferenca >= 0) {
    statusLabel.textContent = 'Valor a restituir';
    valorFinal.textContent = formatarBRL(diferenca);
    narrativa.innerHTML = `Usando o modelo <strong>${modeloSimplificadoMelhor ? 'simplificado' : 'de deduções completas'}</strong>, o imposto devido no ano é de <strong>${formatarBRL(impostoFinal)}</strong>. Como você já teve <strong>${formatarBRL(irrfRetido)}</strong> retidos na fonte, você tem <span class="ok">${formatarBRL(diferenca)} a restituir</span>.`;
  } else {
    statusLabel.textContent = 'Valor a pagar';
    valorFinal.textContent = formatarBRL(Math.abs(diferenca));
    narrativa.innerHTML = `Usando o modelo <strong>${modeloSimplificadoMelhor ? 'simplificado' : 'de deduções completas'}</strong>, o imposto devido no ano é de <strong>${formatarBRL(impostoFinal)}</strong>. Como você teve apenas <strong>${formatarBRL(irrfRetido)}</strong> retidos na fonte, há <span class="alerta">${formatarBRL(Math.abs(diferenca))} de imposto a pagar</span> na declaração.`;
  }
}

['rendimentoAnual', 'inssAnual', 'dependentes', 'despesasEducacao', 'despesasSaude', 'irrfRetido'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
