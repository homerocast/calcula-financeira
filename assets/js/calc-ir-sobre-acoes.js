function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcular() {
  const tipo = document.getElementById('tipoOperacao').value;
  const totalVendas = parseFloat(document.getElementById('totalVendas').value) || 0;
  const lucro = Math.max(0, parseFloat(document.getElementById('lucroLiquido').value) || 0);
  const prejuizo = Math.max(0, parseFloat(document.getElementById('prejuizoAcumulado').value) || 0);

  const lucroTributavel = Math.max(0, lucro - prejuizo);
  const narrativa = document.getElementById('resultadoNarrativo');

  let isento = false, aliquota = 0, dedoDuro = 0;

  if (tipo === 'swing') {
    aliquota = 0.15;
    isento = totalVendas <= 20000;
    dedoDuro = totalVendas * 0.00005;
  } else {
    aliquota = 0.20;
    isento = false;
    dedoDuro = lucro * 0.01;
  }

  const imposto = isento ? 0 : lucroTributavel * aliquota;
  const darf = Math.max(0, imposto - dedoDuro);

  document.getElementById('resLucroTributavel').textContent = formatarBRL(lucroTributavel);
  document.getElementById('resAliquota').textContent = isento ? 'Isento' : (aliquota * 100).toFixed(0) + '%';
  document.getElementById('resImposto').textContent = formatarBRL(imposto);
  document.getElementById('resDedoDuro').textContent = formatarBRL(dedoDuro);
  document.getElementById('resDARF').textContent = formatarBRL(darf);

  if (isento) {
    narrativa.innerHTML = `Com vendas de <strong>${formatarBRL(totalVendas)}</strong> no mês (dentro do limite de R$ 20.000 para swing trade), você está <span class="ok">isento de Imposto de Renda</span> sobre o lucro dessa modalidade.`;
  } else {
    narrativa.innerHTML = `Sobre o lucro tributável de <strong>${formatarBRL(lucroTributavel)}</strong>, a alíquota de ${(aliquota * 100).toFixed(0)}% gera um imposto de <strong>${formatarBRL(imposto)}</strong>. Descontando o "dedo-duro" já retido (${formatarBRL(dedoDuro)}), sobra <span class="${darf > 0 ? 'alerta' : 'ok'}">${formatarBRL(darf)} a pagar via DARF</span>.`;
  }
}

['tipoOperacao', 'totalVendas', 'lucroLiquido', 'prejuizoAcumulado'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
  document.getElementById(id).addEventListener('change', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
