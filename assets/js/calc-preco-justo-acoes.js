function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcular() {
  const lpa = parseFloat(document.getElementById('lpa').value) || 0;
  const vpa = parseFloat(document.getElementById('vpa').value) || 0;
  const precoAtual = parseFloat(document.getElementById('precoAtual').value) || 0;

  const narrativa = document.getElementById('resultadoNarrativo');

  if (lpa <= 0 || vpa <= 0) {
    document.getElementById('resPrecoJusto').textContent = '—';
    document.getElementById('resMargem').textContent = '—';
    narrativa.innerHTML = 'A fórmula de Graham exige LPA e VPA positivos — não se aplica a empresas com prejuízo ou patrimônio líquido negativo no período.';
    return;
  }

  const precoJusto = Math.sqrt(22.5 * lpa * vpa);
  document.getElementById('resPrecoJusto').textContent = formatarBRL(precoJusto);

  if (precoAtual > 0) {
    const margem = ((precoJusto - precoAtual) / precoAtual) * 100;
    document.getElementById('resMargem').textContent = margem.toFixed(1) + '%';
    narrativa.innerHTML = margem >= 0
      ? `Pelo modelo de Graham, o preço justo é <strong>${formatarBRL(precoJusto)}</strong>. Com o preço atual de ${formatarBRL(precoAtual)}, há uma <span class="ok">margem de segurança de ${margem.toFixed(1)}%</span> — a ação pode estar descontada frente a esses fundamentos.`
      : `Pelo modelo de Graham, o preço justo é <strong>${formatarBRL(precoJusto)}</strong>. Com o preço atual de ${formatarBRL(precoAtual)}, a ação está <span class="alerta">${Math.abs(margem).toFixed(1)}% acima</span> desse referencial.`;
  } else {
    document.getElementById('resMargem').textContent = '—';
    narrativa.innerHTML = `Pelo modelo de Graham, o preço justo estimado é <strong>${formatarBRL(precoJusto)}</strong>. Informe o preço atual da ação para ver a margem de segurança.`;
  }
}

['lpa', 'vpa', 'precoAtual'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
