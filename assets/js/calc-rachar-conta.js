function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcular() {
  const valor = parseFloat(document.getElementById('valorConta').value) || 0;
  const pessoas = Math.max(1, parseInt(document.getElementById('numeroPessoas').value) || 1);
  const taxa = (parseFloat(document.getElementById('taxaServico').value) || 0) / 100;

  const totalComTaxa = valor * (1 + taxa);
  const porPessoa = totalComTaxa / pessoas;

  document.getElementById('resTotalComTaxa').textContent = formatarBRL(totalComTaxa);
  document.getElementById('resPorPessoa').textContent = formatarBRL(porPessoa);

  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML = `Com a conta de <strong>${formatarBRL(valor)}</strong> mais ${(taxa * 100).toFixed(0)}% de taxa de serviço, o total fica em <strong>${formatarBRL(totalComTaxa)}</strong>. Dividido entre ${pessoas} pessoas, cada uma paga <span class="ok">${formatarBRL(porPessoa)}</span>.`;
}

['valorConta', 'numeroPessoas', 'taxaServico'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
