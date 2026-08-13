function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function pmt(taxa, nper, pv) {
  if (taxa === 0) return pv / nper;
  return (taxa * pv) / (1 - Math.pow(1 + taxa, -nper));
}

// Número de períodos restantes, dado uma parcela fixa e um novo saldo devedor menor
function nperRestante(taxa, pv, pagamento) {
  if (taxa === 0) return pv / pagamento;
  const razao = 1 - (taxa * pv) / pagamento;
  if (razao <= 0) return 0; // quitado imediatamente
  return -Math.log(razao) / Math.log(1 + taxa);
}

function calcular() {
  const valorDisponivel = parseFloat(document.getElementById('valorDisponivel').value) || 0;
  const saldoDevedor = parseFloat(document.getElementById('saldoDevedor').value) || 0;
  const cetAnual = (parseFloat(document.getElementById('cetFinanciamento').value) || 0) / 100;
  const prazoRestante = parseInt(document.getElementById('prazoRestante').value) || 1;
  const taxaInvestAnual = (parseFloat(document.getElementById('taxaInvestimento').value) || 0) / 100;

  const iFinanciamento = Math.pow(1 + cetAnual, 1 / 12) - 1;
  const parcelaAtual = pmt(iFinanciamento, prazoRestante, saldoDevedor);
  const totalPagoOriginal = parcelaAtual * prazoRestante;

  // ---- Estratégia Amortizar ----
  const novoSaldo = Math.max(0, saldoDevedor - valorDisponivel);
  let ganhoAmortizar;
  if (novoSaldo <= 0) {
    // quita totalmente: economiza todas as parcelas futuras, mas gastou só o saldo devedor (não o valor todo, se sobrar)
    const troco = valorDisponivel - saldoDevedor;
    ganhoAmortizar = totalPagoOriginal - saldoDevedor + (troco > 0 ? 0 : 0);
    // Se sobrou dinheiro (troco > 0), ele nem foi usado — soma-se separadamente como caixa livre
  } else {
    const novoPrazo = nperRestante(iFinanciamento, novoSaldo, parcelaAtual);
    const totalPagoComAmortizacao = valorDisponivel + (parcelaAtual * novoPrazo);
    ganhoAmortizar = totalPagoOriginal - totalPagoComAmortizacao;
  }

  // ---- Estratégia Investir ----
  const iInvest = Math.pow(1 + taxaInvestAnual, 1 / 12) - 1;
  const montanteFinal = valorDisponivel * Math.pow(1 + iInvest, prazoRestante);
  const ganhoInvestir = montanteFinal - valorDisponivel;

  document.getElementById('resAmortizar').textContent = formatarBRL(ganhoAmortizar) + ' economizados em juros';
  document.getElementById('resInvestir').textContent = formatarBRL(ganhoInvestir) + ' de rendimento líquido';

  const melhor = ganhoAmortizar >= ganhoInvestir ? 'Amortizar o financiamento' : 'Investir a sobra';
  document.getElementById('resMelhor').textContent = melhor;

  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML = `Usando <strong>${formatarBRL(valorDisponivel)}</strong> para amortizar, você economiza <strong>${formatarBRL(ganhoAmortizar)}</strong> em juros ao longo do financiamento. Investindo esse mesmo valor pelo prazo restante, o rendimento líquido estimado é de <strong>${formatarBRL(ganhoInvestir)}</strong>. Nesse cenário, <span class="ok">${melhor.toLowerCase()}</span> rende mais.`;
}

['valorDisponivel', 'saldoDevedor', 'cetFinanciamento', 'prazoRestante', 'taxaInvestimento'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
