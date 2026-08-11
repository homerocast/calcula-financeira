function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcularVPLEm(investimento, fluxos, taxa) {
  let vpl = -investimento;
  fluxos.forEach((f, i) => { vpl += f / Math.pow(1 + taxa, i + 1); });
  return vpl;
}

function calcularTIR(investimento, fluxos) {
  function vplAt(taxa) { return calcularVPLEm(investimento, fluxos, taxa); }
  let baixo = -0.99, alto = 10;
  let vplBaixo = vplAt(baixo);
  const vplAlto = vplAt(alto);
  if (vplBaixo * vplAlto > 0) return null; // sem raiz nesse intervalo

  for (let iter = 0; iter < 200; iter++) {
    const meio = (baixo + alto) / 2;
    const vplMeio = vplAt(meio);
    if (Math.abs(vplMeio) < 0.001) return meio;
    if ((vplMeio > 0) === (vplBaixo > 0)) {
      baixo = meio;
      vplBaixo = vplMeio;
    } else {
      alto = meio;
    }
  }
  return (baixo + alto) / 2;
}

function calcular() {
  const investimento = parseFloat(document.getElementById('investimentoInicial').value) || 0;
  const fluxos = [1, 2, 3, 4, 5].map(n => parseFloat(document.getElementById('fluxo' + n).value) || 0);
  const taxaDesconto = (parseFloat(document.getElementById('taxaDesconto').value) || 0) / 100;

  const vpl = calcularVPLEm(investimento, fluxos, taxaDesconto);
  const tir = calcularTIR(investimento, fluxos);

  document.getElementById('resVPL').textContent = formatarBRL(vpl);
  document.getElementById('resTIR').textContent = tir !== null ? (tir * 100).toFixed(2).replace('.', ',') + '%' : 'não converge';

  const narrativa = document.getElementById('resultadoNarrativo');
  if (vpl >= 0) {
    narrativa.innerHTML = `Com uma taxa de desconto de ${(taxaDesconto * 100).toFixed(1)}% ao ano, o VPL é <span class="ok">${formatarBRL(vpl)}</span> — positivo, ou seja, o projeto rende acima do exigido.` +
      (tir !== null ? ` A TIR (rentabilidade real do projeto) é de <strong>${(tir * 100).toFixed(2).replace('.', ',')}% ao ano</strong>.` : '');
  } else {
    narrativa.innerHTML = `Com uma taxa de desconto de ${(taxaDesconto * 100).toFixed(1)}% ao ano, o VPL é <span class="alerta">${formatarBRL(vpl)}</span> — negativo, ou seja, o projeto rende abaixo do exigido nessa taxa.` +
      (tir !== null ? ` A TIR (rentabilidade real do projeto) é de <strong>${(tir * 100).toFixed(2).replace('.', ',')}% ao ano</strong>.` : '');
  }
}

['investimentoInicial', 'fluxo1', 'fluxo2', 'fluxo3', 'fluxo4', 'fluxo5', 'taxaDesconto'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
