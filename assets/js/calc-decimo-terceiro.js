function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcular() {
  const salario = parseFloat(document.getElementById('salarioBruto').value) || 0;
  const meses = Math.min(12, Math.max(1, parseInt(document.getElementById('mesesTrabalhados').value) || 12));
  const dependentes = parseInt(document.getElementById('dependentes').value) || 0;

  const decimoBruto = (salario / 12) * meses;
  const primeiraParcela = decimoBruto / 2;

  const inss = calcularINSS(decimoBruto);
  const baseIRRF = Math.max(0, decimoBruto - inss - (dependentes * DEDUCAO_DEPENDENTE_2026));
  const irrfApurado = calcularIRRFTabela(baseIRRF);
  const irrf = aplicarRedutorIRRF(irrfApurado, decimoBruto);

  const segundaParcela = (decimoBruto - primeiraParcela) - inss - irrf;
  const liquido = primeiraParcela + segundaParcela;

  document.getElementById('res13Bruto').textContent = formatarBRL(decimoBruto);
  document.getElementById('res1aParcela').textContent = formatarBRL(primeiraParcela);
  document.getElementById('resINSS').textContent = formatarBRL(inss);
  document.getElementById('resIRRF').textContent = formatarBRL(irrf);
  document.getElementById('res2aParcela').textContent = formatarBRL(segundaParcela);
  document.getElementById('resLiquido').textContent = formatarBRL(liquido);

  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML = `Com ${meses} ${meses === 1 ? 'mês trabalhado' : 'meses trabalhados'} no ano, seu 13º bruto é de <strong>${formatarBRL(decimoBruto)}</strong>. A 1ª parcela (${formatarBRL(primeiraParcela)}) vem sem descontos; a 2ª parcela já desconta INSS e IRRF sobre o total. No fim, você recebe <span class="ok">${formatarBRL(liquido)}</span> líquidos.`;
}

['salarioBruto', 'mesesTrabalhados', 'dependentes'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
