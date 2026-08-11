function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function pmt(taxa, nper, pv) {
  if (taxa === 0) return pv / nper;
  return (taxa * pv) / (1 - Math.pow(1 + taxa, -nper));
}

function calcular() {
  const renda = parseFloat(document.getElementById('rendaMensal').value) || 0;
  const valor = parseFloat(document.getElementById('valorEmprestimo').value) || 0;
  const taxa = (parseFloat(document.getElementById('taxaConsignado').value) || 0) / 100;
  const prazo = parseInt(document.getElementById('prazoConsignado').value) || 1;

  const parcela = pmt(taxa, prazo, valor);
  const margem = renda * 0.35;
  const valorMaximo = taxa === 0 ? margem * prazo : margem * (1 - Math.pow(1 + taxa, -prazo)) / taxa;

  document.getElementById('resParcela').textContent = formatarBRL(parcela);
  document.getElementById('resMargem').textContent = formatarBRL(margem);
  document.getElementById('resValorMaximo').textContent = formatarBRL(valorMaximo);

  const narrativa = document.getElementById('resultadoNarrativo');
  const cabe = parcela <= margem;
  narrativa.innerHTML = cabe
    ? `Financiando <strong>${formatarBRL(valor)}</strong> em ${prazo}x, a parcela fica em <strong>${formatarBRL(parcela)}</strong> — <span class="ok">cabe dentro da margem consignável</span> de ${formatarBRL(margem)} (35% da sua renda).`
    : `Financiando <strong>${formatarBRL(valor)}</strong> em ${prazo}x, a parcela ficaria em <strong>${formatarBRL(parcela)}</strong> — <span class="alerta">ultrapassa a margem consignável</span> de ${formatarBRL(margem)}. Com essa renda e prazo, o valor máximo financiável é de aproximadamente ${formatarBRL(valorMaximo)}.`;
}

['rendaMensal', 'valorEmprestimo', 'taxaConsignado', 'prazoConsignado'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
