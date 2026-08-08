function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseData(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const d = new Date(str + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

// Meses completos entre duas datas, aplicando a regra dos 15 dias (art. 477 CLT)
function mesesComRegra15(d1, d2) {
  if (d2 <= d1) return 0;
  let anos = d2.getFullYear() - d1.getFullYear();
  let meses = d2.getMonth() - d1.getMonth();
  let dias = d2.getDate() - d1.getDate();
  if (dias < 0) {
    meses -= 1;
    const diasMesAnterior = new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
    dias += diasMesAnterior;
  }
  if (meses < 0) { anos -= 1; meses += 12; }
  let totalMeses = anos * 12 + meses;
  if (dias >= 15) totalMeses += 1;
  return totalMeses;
}

// Anos completos de serviço (para aviso prévio), sem a regra dos 15 dias
function anosCompletosServico(d1, d2) {
  let anos = d2.getFullYear() - d1.getFullYear();
  if (d2.getMonth() < d1.getMonth() || (d2.getMonth() === d1.getMonth() && d2.getDate() < d1.getDate())) {
    anos -= 1;
  }
  return Math.max(0, anos);
}

function calcular() {
  const salario = parseFloat(document.getElementById('salario').value) || 0;
  const admissao = parseData(document.getElementById('dataAdmissao').value);
  const desligamento = parseData(document.getElementById('dataDesligamento').value);
  const tipo = document.getElementById('tipoRescisao').value;
  const temFeriasVencidas = document.getElementById('feriasVencidas').value === 'sim';

  if (!admissao || !desligamento || desligamento <= admissao) {
    ['resSaldoSalario','res13','resFeriasProp','resFeriasVenc','resAviso','resMulta','resTotal']
      .forEach(id => document.getElementById(id).textContent = '—');
    return;
  }

  // Saldo de salário (dias do mês do desligamento)
  const diasSaldo = desligamento.getDate();
  const saldoSalario = (salario / 30) * diasSaldo;

  // 13º proporcional (meses no ano corrente, regra dos 15 dias)
  const inicio13 = (admissao.getFullYear() === desligamento.getFullYear())
    ? admissao
    : new Date(desligamento.getFullYear(), 0, 1);
  const meses13 = Math.min(12, mesesComRegra15(inicio13, desligamento));

  // Férias proporcionais (desde o último aniversário de admissão)
  let aniversario = new Date(desligamento.getFullYear(), admissao.getMonth(), admissao.getDate());
  if (aniversario > desligamento) aniversario.setFullYear(aniversario.getFullYear() - 1);
  if (aniversario < admissao) aniversario = new Date(admissao);
  const mesesFerias = Math.min(12, mesesComRegra15(aniversario, desligamento));

  const anosServico = anosCompletosServico(admissao, desligamento);
  const totalMesesServico = mesesComRegra15(admissao, desligamento);

  let itemSaldo = saldoSalario;
  let item13 = 0, itemFeriasProp = 0, itemFeriasVenc = 0, itemAviso = 0, itemMulta = 0;

  const feriasVencidasValor = temFeriasVencidas ? salario * (4 / 3) : 0;
  const fgtsEstimado = salario * 0.08 * totalMesesServico;
  const diasAviso = Math.min(90, 30 + 3 * anosServico);
  const avisoIntegral = (salario / 30) * diasAviso;

  if (tipo === 'sem_justa_causa') {
    item13 = (salario / 12) * meses13;
    itemFeriasProp = (salario / 12) * mesesFerias * (4 / 3);
    itemFeriasVenc = feriasVencidasValor;
    itemAviso = avisoIntegral;
    itemMulta = fgtsEstimado * 0.40;
  } else if (tipo === 'pedido_demissao') {
    item13 = (salario / 12) * meses13;
    itemFeriasProp = (salario / 12) * mesesFerias * (4 / 3);
    itemFeriasVenc = feriasVencidasValor;
  } else if (tipo === 'acordo') {
    item13 = (salario / 12) * meses13;
    itemFeriasProp = (salario / 12) * mesesFerias * (4 / 3);
    itemFeriasVenc = feriasVencidasValor;
    itemAviso = avisoIntegral / 2;
    itemMulta = fgtsEstimado * 0.20;
  } else if (tipo === 'justa_causa') {
    itemFeriasVenc = feriasVencidasValor;
  }

  const total = itemSaldo + item13 + itemFeriasProp + itemFeriasVenc + itemAviso + itemMulta;

  document.getElementById('resSaldoSalario').textContent = formatarBRL(itemSaldo);
  document.getElementById('res13').textContent = formatarBRL(item13);
  document.getElementById('resFeriasProp').textContent = formatarBRL(itemFeriasProp);
  document.getElementById('resFeriasVenc').textContent = formatarBRL(itemFeriasVenc);
  document.getElementById('resAviso').textContent = formatarBRL(itemAviso);
  document.getElementById('resMulta').textContent = formatarBRL(itemMulta);
  document.getElementById('resTotal').textContent = formatarBRL(total);
}

['salario','dataAdmissao','dataDesligamento','tipoRescisao','feriasVencidas'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
  document.getElementById(id).addEventListener('change', calcular);
});
calcular();
