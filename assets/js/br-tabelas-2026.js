// Tabelas oficiais vigentes em 2026 — usadas por Salário Líquido, Férias e 13º Salário
const SALARIO_MINIMO_2026 = 1621.00;

function calcularINSS(salarioBruto) {
  const faixas = [
    { ate: 1621.00, aliq: 0.075 },
    { ate: 2902.84, aliq: 0.09 },
    { ate: 4354.27, aliq: 0.12 },
    { ate: 8475.55, aliq: 0.14 }
  ];
  const teto = 8475.55;
  const base = Math.min(Math.max(salarioBruto, 0), teto);
  let inss = 0, anterior = 0;
  for (const faixa of faixas) {
    if (base > anterior) {
      const trecho = Math.min(base, faixa.ate) - anterior;
      inss += trecho * faixa.aliq;
      anterior = faixa.ate;
    }
  }
  return Math.round(inss * 100) / 100;
}

// Base já deve estar líquida de INSS e dedução por dependentes
function calcularIRRFTabela(baseCalculo) {
  const faixas = [
    { ate: 2428.80, aliq: 0, deducao: 0 },
    { ate: 2826.65, aliq: 0.075, deducao: 182.16 },
    { ate: 3751.05, aliq: 0.15, deducao: 394.16 },
    { ate: 4664.68, aliq: 0.225, deducao: 675.49 },
    { ate: Infinity, aliq: 0.275, deducao: 908.73 }
  ];
  let faixaAplicavel = faixas[faixas.length - 1];
  for (const f of faixas) {
    if (baseCalculo <= f.ate) { faixaAplicavel = f; break; }
  }
  const irrf = baseCalculo * faixaAplicavel.aliq - faixaAplicavel.deducao;
  return Math.max(0, Math.round(irrf * 100) / 100);
}

// Redutor da Lei 15.270/2025: zera o IR até R$5.000 de renda bruta e reduz parcialmente até R$7.350
function aplicarRedutorIRRF(irrfApurado, rendaBrutaMensal) {
  if (rendaBrutaMensal <= 5000) return 0;
  if (rendaBrutaMensal <= 7350) {
    const redutor = 978.62 - 0.133145 * rendaBrutaMensal;
    return Math.max(0, Math.round((irrfApurado - Math.max(0, redutor)) * 100) / 100);
  }
  return irrfApurado;
}

const DEDUCAO_DEPENDENTE_2026 = 189.59;

// Função completa: retorna { inss, irrf, liquido } a partir do salário bruto
function calcularDescontosFolha(salarioBruto, numDependentes) {
  const inss = calcularINSS(salarioBruto);
  const baseIRRF = Math.max(0, salarioBruto - inss - (numDependentes * DEDUCAO_DEPENDENTE_2026));
  const irrfApurado = calcularIRRFTabela(baseIRRF);
  const irrfFinal = aplicarRedutorIRRF(irrfApurado, salarioBruto);
  return { inss, irrf: irrfFinal, liquido: salarioBruto - inss - irrfFinal };
}
