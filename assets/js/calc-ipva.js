function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Alíquotas aproximadas para carro de passeio em 2026 — servem de base; motos e caminhões
// costumam ter alíquota reduzida, aplicada abaixo por um ajuste simplificado.
const ALIQUOTAS_IPVA_2026 = {
  AC: 2.0, AL: 3.0, AP: 3.0, AM: 2.0, BA: 2.5, CE: 2.5, DF: 3.5, ES: 2.0,
  GO: 3.75, MA: 3.0, MT: 3.0, MS: 3.0, MG: 4.0, PA: 2.5, PB: 2.5, PR: 1.9,
  PE: 2.5, PI: 2.5, RJ: 4.0, RN: 3.0, RS: 3.0, RO: 3.0, RR: 3.0, SC: 2.0,
  SP: 4.0, SE: 3.0, TO: 2.0
};

const NOMES_ESTADOS = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará',
  DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão',
  MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará',
  PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
  SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins'
};

function popularEstados() {
  const select = document.getElementById('estado');
  Object.keys(NOMES_ESTADOS).sort((a, b) => NOMES_ESTADOS[a].localeCompare(NOMES_ESTADOS[b])).forEach(uf => {
    const opt = document.createElement('option');
    opt.value = uf;
    opt.textContent = NOMES_ESTADOS[uf] + ' (' + uf + ')';
    if (uf === 'SP') opt.selected = true;
    select.appendChild(opt);
  });
}

function calcular() {
  const valor = parseFloat(document.getElementById('valorVeiculo').value) || 0;
  const uf = document.getElementById('estado').value;
  const tipo = document.getElementById('tipoVeiculo').value;

  let aliquota = ALIQUOTAS_IPVA_2026[uf] || 3.0;
  if (tipo === 'moto') aliquota = Math.min(aliquota, 2.0);
  if (tipo === 'caminhao') aliquota = Math.min(aliquota, 1.5);

  const ipva = valor * (aliquota / 100);

  document.getElementById('resAliquota').textContent = aliquota.toFixed(2).replace('.', ',') + '%';
  document.getElementById('resIPVA').textContent = formatarBRL(ipva);

  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML = `Em <strong>${NOMES_ESTADOS[uf]}</strong>, a alíquota estimada para esse tipo de veículo é de <strong>${aliquota.toFixed(2).replace('.', ',')}%</strong>. Sobre um veículo de <strong>${formatarBRL(valor)}</strong>, o IPVA estimado é de <span class="ok">${formatarBRL(ipva)}</span>.`;
}

popularEstados();
['valorVeiculo', 'estado', 'tipoVeiculo'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
  document.getElementById(id).addEventListener('change', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
