function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const SALARIO_MINIMO_2026 = 1621.00;
const LIMITE_MEI_ANUAL = 81000.00;
const INSS_MEI = SALARIO_MINIMO_2026 * 0.05;

function calcular() {
  const atividade = document.getElementById('atividade').value;
  const faturamento = parseFloat(document.getElementById('faturamentoAnual').value) || 0;

  const icms = (atividade === 'comercio' || atividade === 'ambos') ? 1.00 : 0;
  const iss = (atividade === 'servicos' || atividade === 'ambos') ? 5.00 : 0;
  const das = INSS_MEI + icms + iss;

  document.getElementById('resINSS').textContent = formatarBRL(INSS_MEI);
  document.getElementById('resICMS').textContent = icms > 0 ? formatarBRL(icms) : '—';
  document.getElementById('resISS').textContent = iss > 0 ? formatarBRL(iss) : '—';
  document.getElementById('resDAS').textContent = formatarBRL(das);

  const narrativa = document.getElementById('resultadoNarrativo');
  const blocoLimite = document.getElementById('blocoLimite');

  if (faturamento > 0) {
    const pct = (faturamento / LIMITE_MEI_ANUAL) * 100;
    document.getElementById('resPctLimite').textContent = pct.toFixed(1) + '%';
    blocoLimite.style.display = 'grid';
    if (pct >= 100) {
      narrativa.innerHTML = `Seu DAS mensal é de <strong>${formatarBRL(das)}</strong>. Atenção: com ${formatarBRL(faturamento)} faturados, você <span class="alerta">já ultrapassou o limite anual de ${formatarBRL(LIMITE_MEI_ANUAL)}</span> — é preciso regularizar a migração para Microempresa (ME).`;
    } else if (pct >= 80) {
      narrativa.innerHTML = `Seu DAS mensal é de <strong>${formatarBRL(das)}</strong>. Você já usou <span class="alerta">${pct.toFixed(1)}% do limite anual</span> de ${formatarBRL(LIMITE_MEI_ANUAL)} — fique de olho para não ultrapassar.`;
    } else {
      narrativa.innerHTML = `Seu DAS mensal é de <strong>${formatarBRL(das)}</strong>. Você usou <span class="ok">${pct.toFixed(1)}% do limite anual</span> de ${formatarBRL(LIMITE_MEI_ANUAL)} — ainda há boa margem.`;
    }
  } else {
    blocoLimite.style.display = 'none';
    narrativa.innerHTML = `Para a atividade escolhida, o DAS mensal do MEI em 2026 é de <strong>${formatarBRL(das)}</strong>. O limite de faturamento anual do MEI é de <strong>${formatarBRL(LIMITE_MEI_ANUAL)}</strong>.`;
  }
}

['atividade', 'faturamentoAnual'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
  document.getElementById(id).addEventListener('change', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
