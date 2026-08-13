function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function pmt(taxa, nper, pv) {
  if (taxa === 0) return pv / nper;
  return (taxa * pv) / (1 - Math.pow(1 + taxa, -nper));
}

function calcular() {
  const valor = parseFloat(document.getElementById('valorDesejado').value) || 0;
  const prazo = parseInt(document.getElementById('prazoMeses').value) || 1;
  const renda = parseFloat(document.getElementById('rendaMensal').value) || 0;
  const taxaConsignado = (parseFloat(document.getElementById('taxaConsignado').value) || 0) / 100;
  const taxaPessoal = (parseFloat(document.getElementById('taxaPessoal').value) || 0) / 100;

  const parcelaConsignado = pmt(taxaConsignado, prazo, valor);
  const totalConsignado = parcelaConsignado * prazo;
  const jurosConsignado = totalConsignado - valor;

  const parcelaPessoal = pmt(taxaPessoal, prazo, valor);
  const totalPessoal = parcelaPessoal * prazo;
  const jurosPessoal = totalPessoal - valor;

  document.getElementById('resParcelaConsignado').textContent = formatarBRL(parcelaConsignado);
  document.getElementById('resTotalConsignado').textContent = formatarBRL(totalConsignado);
  document.getElementById('resJurosConsignado').textContent = formatarBRL(jurosConsignado);

  document.getElementById('resParcelaPessoal').textContent = formatarBRL(parcelaPessoal);
  document.getElementById('resTotalPessoal').textContent = formatarBRL(totalPessoal);
  document.getElementById('resJurosPessoal').textContent = formatarBRL(jurosPessoal);

  const economia = totalPessoal - totalConsignado;
  document.getElementById('resEconomia').textContent = formatarBRL(economia);

  const margem = renda * 0.35;
  const cabeNaMargem = parcelaConsignado <= margem;

  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML = `Financiando <strong>${formatarBRL(valor)}</strong> em ${prazo}x, o consignado custa <strong>${formatarBRL(totalConsignado)}</strong> no total, contra <strong>${formatarBRL(totalPessoal)}</strong> no empréstimo pessoal — uma economia de <span class="ok">${formatarBRL(economia)}</span> optando pelo consignado.` +
    (cabeNaMargem
      ? ` A parcela do consignado (${formatarBRL(parcelaConsignado)}) cabe na sua margem consignável de ${formatarBRL(margem)}.`
      : ` <span class="alerta">Atenção: a parcela do consignado (${formatarBRL(parcelaConsignado)}) ultrapassa sua margem consignável de ${formatarBRL(margem)}</span> — reduza o valor ou aumente o prazo.`);
}

['valorDesejado', 'prazoMeses', 'rendaMensal', 'taxaConsignado', 'taxaPessoal'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
