function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcular() {
  const salario = parseFloat(document.getElementById('salarioBruto').value) || 0;
  const diasFerias = Math.min(30, Math.max(1, parseInt(document.getElementById('diasFerias').value) || 30));
  const dependentes = parseInt(document.getElementById('dependentes').value) || 0;
  const venderAbono = document.getElementById('venderAbono').value === 'sim';

  const valorDia = salario / 30;
  const feriasBase = valorDia * diasFerias;
  const feriasBruto = feriasBase + (feriasBase / 3);

  let abonoBruto = 0;
  if (venderAbono) {
    const abonoBase = valorDia * 10;
    abonoBruto = abonoBase + (abonoBase / 3);
  }

  // INSS e IRRF incidem só sobre as férias gozadas (abono é isento)
  const inss = calcularINSS(feriasBruto);
  const baseIRRF = Math.max(0, feriasBruto - inss - (dependentes * DEDUCAO_DEPENDENTE_2026));
  const irrfApurado = calcularIRRFTabela(baseIRRF);
  const irrf = aplicarRedutorIRRF(irrfApurado, feriasBruto);

  const liquido = feriasBruto - inss - irrf + abonoBruto;

  document.getElementById('resFeriasBruto').textContent = formatarBRL(feriasBruto);
  document.getElementById('resAbonoBruto').textContent = venderAbono ? formatarBRL(abonoBruto) : '—';
  document.getElementById('resINSS').textContent = formatarBRL(inss);
  document.getElementById('resIRRF').textContent = formatarBRL(irrf);
  document.getElementById('resLiquido').textContent = formatarBRL(liquido);

  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML = venderAbono
    ? `Tirando ${diasFerias - 10} dias de descanso e vendendo 10 dias (abono), você recebe <strong>${formatarBRL(feriasBruto)}</strong> de férias mais <strong>${formatarBRL(abonoBruto)}</strong> de abono (isento de impostos) — total líquido de <span class="ok">${formatarBRL(liquido)}</span>.`
    : `Tirando ${diasFerias} dias de férias, você recebe <strong>${formatarBRL(feriasBruto)}</strong> brutos (já com 1/3 constitucional). Descontando INSS e IRRF, sobram <span class="ok">${formatarBRL(liquido)}</span> líquidos.`;
}

['salarioBruto', 'diasFerias', 'dependentes', 'venderAbono'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
  document.getElementById(id).addEventListener('change', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
