function formatarAnos(anos) {
  if (anos <= 0) return 'já cumpre';
  const anosInt = Math.floor(anos);
  const meses = Math.round((anos - anosInt) * 12);
  if (meses === 0) return anosInt + (anosInt === 1 ? ' ano' : ' anos');
  return anosInt + 'a ' + meses + 'm';
}

function calcular() {
  const sexo = document.getElementById('sexo').value;
  const idade = parseFloat(document.getElementById('idadeAtual').value) || 0;
  const tempo = parseFloat(document.getElementById('tempoContribuicao').value) || 0;

  // ---- Regra permanente (idade mínima) ----
  const idadeMinima = sexo === 'M' ? 65 : 62;
  const tempoMinimoIdade = sexo === 'M' ? 20 : 15;
  const faltaIdadeAnos = Math.max(0, idadeMinima - idade);
  const faltaTempoIdadeAnos = Math.max(0, tempoMinimoIdade - tempo);
  const anosFaltamIdade = Math.max(faltaIdadeAnos, faltaTempoIdadeAnos);

  // ---- Regra de pontos (2026) ----
  const pontosNecessarios = sexo === 'M' ? 103 : 93;
  const tempoMinimoPontos = sexo === 'M' ? 35 : 30;
  const pontosAtuais = idade + tempo;
  const faltaPontos = Math.max(0, pontosNecessarios - pontosAtuais);
  // cada ano que passa soma 2 pontos (idade +1, tempo +1)
  const anosFaltamPontosPorPontuacao = Math.ceil(faltaPontos / 2);
  const anosFaltamTempoPontos = Math.max(0, tempoMinimoPontos - tempo);
  const anosFaltamPontos = Math.max(anosFaltamPontosPorPontuacao, anosFaltamTempoPontos);

  document.getElementById('reqIdade').textContent = `${idadeMinima} anos + ${tempoMinimoIdade}a contrib.`;
  document.getElementById('faltaIdade').textContent = formatarAnos(anosFaltamIdade);

  document.getElementById('reqPontos').textContent = `${pontosNecessarios} pontos + ${tempoMinimoPontos}a contrib.`;
  document.getElementById('faltaPontos').textContent = formatarAnos(anosFaltamPontos);

  const melhorRegra = anosFaltamPontos <= anosFaltamIdade ? 'Regra de pontos' : 'Idade mínima (regra permanente)';
  const melhorAnos = Math.min(anosFaltamPontos, anosFaltamIdade);
  document.getElementById('resMelhor').textContent = melhorRegra + ' — faltam aproximadamente ' + formatarAnos(melhorAnos);

  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML = `Pela regra de idade mínima, faltam <strong>${formatarAnos(anosFaltamIdade)}</strong>. Pela regra de pontos (2026), faltam <strong>${formatarAnos(anosFaltamPontos)}</strong>. A rota mais rápida no seu caso é <span class="ok">${melhorRegra}</span>.`;
}

['sexo', 'idadeAtual', 'tempoContribuicao'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
  document.getElementById(id).addEventListener('change', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
