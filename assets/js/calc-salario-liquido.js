function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcular() {
  const bruto = parseFloat(document.getElementById('salarioBruto').value) || 0;
  const dependentes = parseInt(document.getElementById('dependentes').value) || 0;
  const outros = parseFloat(document.getElementById('outrosDescontos').value) || 0;

  const { inss, irrf } = calcularDescontosFolha(bruto, dependentes);
  const liquido = bruto - inss - irrf - outros;

  document.getElementById('resINSS').textContent = formatarBRL(inss);
  document.getElementById('resIRRF').textContent = formatarBRL(irrf);
  document.getElementById('resLiquido').textContent = formatarBRL(liquido);

  const pctDescontado = bruto > 0 ? (((inss + irrf + outros) / bruto) * 100).toFixed(1) : '0';
  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML = irrf > 0
    ? `De um salário bruto de <strong>${formatarBRL(bruto)}</strong>, você paga <strong>${formatarBRL(inss)}</strong> de INSS e <strong>${formatarBRL(irrf)}</strong> de IRRF. No total, <strong>${pctDescontado}%</strong> do bruto vai para descontos, sobrando <span class="ok">${formatarBRL(liquido)}</span> líquidos.`
    : `De um salário bruto de <strong>${formatarBRL(bruto)}</strong>, você paga <strong>${formatarBRL(inss)}</strong> de INSS. Pelo redutor de 2026, <span class="ok">você está isento de Imposto de Renda</span> — sobram <strong>${formatarBRL(liquido)}</strong> líquidos.`;
}

['salarioBruto', 'dependentes', 'outrosDescontos'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
