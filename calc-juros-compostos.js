function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcularJurosCompostos() {
  const P = parseFloat(document.getElementById('valorInicial').value) || 0;
  const A = parseFloat(document.getElementById('aporteMensal').value) || 0;
  const i = (parseFloat(document.getElementById('taxaMensal').value) || 0) / 100;
  const n = parseInt(document.getElementById('periodoMeses').value) || 0;

  // M = P(1+i)^n + A * [((1+i)^n - 1) / i]
  const fatorCrescimento = Math.pow(1 + i, n);
  const montanteInicial = P * fatorCrescimento;
  const montanteAportes = i === 0 ? A * n : A * ((fatorCrescimento - 1) / i);
  const montante = montanteInicial + montanteAportes;

  const totalInvestido = P + (A * n);
  const totalJuros = montante - totalInvestido;

  document.getElementById('resTotalInvestido').textContent = formatarBRL(totalInvestido);
  document.getElementById('resTotalJuros').textContent = formatarBRL(totalJuros);
  document.getElementById('resMontante').textContent = formatarBRL(montante);
}

['valorInicial', 'aporteMensal', 'taxaMensal', 'periodoMeses'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcularJurosCompostos);
});
calcularJurosCompostos();
